// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { initSentry } from "../_shared/sentry.ts";

// Initialize Sentry (will only initialize once, even if called multiple times)
await initSentry();

// CORS helper (mirrors other JSON POST endpoints)
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CreateProfileRequest {
  username: string;
  userId?: string; // Optional, will use JWT user if not provided
}

interface ProfileRow {
  id: string;
  user_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Validate username format
 * Rules:
 * - Only lowercase letters (a-z), numbers (0-9), hyphens (-), and underscores (_)
 * - No spaces, no uppercase letters
 * - Min length: 3 characters
 * - Max length: 30 characters
 */
function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Username is required" };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long" };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: "Username must be at most 30 characters long" };
  }

  // Only allow lowercase letters, numbers, hyphens, and underscores
  const validPattern = /^[a-z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: "Username can only contain lowercase letters, numbers, hyphens, and underscores",
    };
  }

  return { valid: true };
}

/**
 * Check if username (slug) is available
 */
async function checkUsernameAvailability(
  supabaseAdmin: any,
  slug: string,
): Promise<{ available: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[create-profile] Error checking username availability:", error);
      return { available: false, error: "Failed to check username availability" };
    }

    if (data) {
      return { available: false, error: "Username is already taken" };
    }

    return { available: true };
  } catch (error: any) {
    console.error("[create-profile] Unexpected error checking availability:", error?.message);
    return { available: false, error: "Failed to check username availability" };
  }
}

/**
 * Create profile atomically
 * Uses a transaction-like approach with service role to ensure atomicity
 */
async function createProfile(
  supabaseAdmin: any,
  userId: string,
  slug: string,
): Promise<{ profile?: ProfileRow; error?: string }> {
  try {
    // First, ensure the user exists in public.users (should exist via trigger, but just in case)
    const { error: userError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: userId,
          email: (await supabaseAdmin.auth.admin.getUserById(userId)).data?.user?.email ?? "",
        },
        { onConflict: "id" },
      );

    if (userError) {
      console.warn("[create-profile] Failed to ensure users row:", userError);
      // Continue anyway, as the trigger should have created it
    }

    // Check if user already has a profile
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, slug, display_name, bio, avatar_url, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle<ProfileRow>();

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      console.error("[create-profile] Error checking existing profile:", existingError);
      return { error: "Failed to check existing profile" };
    }

    if (existingProfile) {
      return { error: "User already has a profile" };
    }

    // Double-check username availability (race condition protection)
    const availability = await checkUsernameAvailability(supabaseAdmin, slug);
    if (!availability.available) {
      return { error: availability.error || "Username is already taken" };
    }

    // Create the profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userId,
        slug: slug,
        display_name: null,
        bio: null,
        avatar_url: null,
      })
      .select("id, user_id, slug, display_name, bio, avatar_url, created_at, updated_at")
      .single<ProfileRow>();

    if (createError) {
      // Check if it's a unique constraint violation
      if (createError.code === "23505" || createError.message?.includes("unique")) {
        return { error: "Username is already taken" };
      }
      console.error("[create-profile] Error creating profile:", createError);
      return { error: createError.message || "Failed to create profile" };
    }

    if (!newProfile) {
      return { error: "Failed to create profile" };
    }

    return { profile: newProfile };
  } catch (error: any) {
    console.error("[create-profile] Unexpected error creating profile:", error?.message, error?.stack);
    return { error: error?.message || "Failed to create profile" };
  }
}

interface HandlerEnv {
  supabaseUrl?: string | null;
  supabaseAnonKey?: string | null;
  serviceRoleKey?: string | null;
  createClientImpl?: typeof createClient;
}

export async function handleCreateProfileRequest(
  req: Request,
  env: HandlerEnv = {},
) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = env.supabaseUrl ?? Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = env.supabaseAnonKey ?? Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = env.serviceRoleKey ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.error("[create-profile] Missing required environment variables");
    return new Response(
      JSON.stringify({
        error: "SERVER_ERROR",
        message: "Server configuration error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    return new Response(
      JSON.stringify({
        error: "UNAUTHORIZED",
        message: "Authorization token is required",
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const createClientFn = env.createClientImpl ?? createClient;
  const supabase = createClientFn(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  try {
    // 1. Authenticate request (require JWT, user must be logged in)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error("[create-profile] Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({
          error: "UNAUTHORIZED",
          message: "Invalid or expired token",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const userId = user.id;

    // 2. Parse request body
    let requestBody: CreateProfileRequest = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (parseError: any) {
      console.error("[create-profile] Failed to parse request body:", parseError?.message);
      return new Response(
        JSON.stringify({
          error: "INVALID_REQUEST",
          message: "Invalid request body",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 3. Validate username
    const username = requestBody.username?.trim();
    if (!username) {
      return new Response(
        JSON.stringify({
          error: "INVALID_USERNAME",
          message: "Username is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: "INVALID_USERNAME",
          message: validation.error || "Invalid username format",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 4. Create profile using service role (bypasses RLS and ensures atomicity)
    const supabaseAdmin = createClientFn(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const result = await createProfile(supabaseAdmin, userId, username);

    if (result.error) {
      const statusCode = result.error.includes("already") || result.error.includes("taken") ? 409 : 500;
      return new Response(
        JSON.stringify({
          error: statusCode === 409 ? "USERNAME_TAKEN" : "CREATE_FAILED",
          message: result.error,
        }),
        {
          status: statusCode,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 5. Return success response with profile
    return new Response(
      JSON.stringify({
        success: true,
        profile: result.profile,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e: any) {
    console.error("[create-profile] Unexpected error:", e?.message ?? e, e?.stack);
    return new Response(
      JSON.stringify({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// Initialize Sentry before starting the server
initSentry();

Deno.serve((req) => handleCreateProfileRequest(req));
