// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS helper (mirrors other JSON POST endpoints)
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DeleteAccountStats {
  submissions: number;
  link_clicks: number;
  links: number;
  custom_domains: number;
  drops: number;
  profiles: number;
  user_preferences: number;
  user_sessions: number;
  login_history: number;
  export_audit: number;
  users: number;
}

async function verifyMFACode(
  supabase: any,
  mfaCode: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. List MFA factors for the user
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

    if (factorsError) {
      console.error("[delete-account] Failed to list MFA factors:", factorsError);
      return { success: false, error: "MFA_VERIFICATION_FAILED" };
    }

    // 2. Check if user has TOTP factors enabled
    const totpFactors = factorsData?.totp || [];
    if (totpFactors.length === 0) {
      return { success: false, error: "MFA_NOT_ENABLED" };
    }

    // 3. Use the first TOTP factor
    const totpFactor = totpFactors[0];
    if (!totpFactor?.id) {
      return { success: false, error: "MFA_FACTOR_NOT_FOUND" };
    }

    // 4. Create a challenge for the factor
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });

    if (challengeError || !challengeData?.id) {
      console.error("[delete-account] Failed to create MFA challenge:", challengeError);
      return { success: false, error: "MFA_CHALLENGE_FAILED" };
    }

    // 5. Verify the TOTP code with the challenge
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      code: mfaCode,
      challengeId: challengeData.id,
    });

    if (verifyError) {
      console.error("[delete-account] MFA code verification failed:", verifyError);
      return { success: false, error: "MFA_CODE_INVALID" };
    }

    // Success
    return { success: true };
  } catch (error: any) {
    console.error("[delete-account] Unexpected error during MFA verification:", error?.message, error?.stack);
    return { success: false, error: "MFA_VERIFICATION_FAILED" };
  }
}

async function sendEmailNotification(
  email: string,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<void> {
  try {
    // Best-effort email notification
    // This is a placeholder - in production, you'd integrate with Resend, Postmark, or Supabase's email service
    console.log(`[delete-account] Email notification would be sent to: ${email}`);
    
    // Example: If using Supabase's email service or an external service:
    // const emailResponse = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@yourdomain.com',
    //     to: email,
    //     subject: 'Account Deletion Confirmation',
    //     html: '<p>Your account has been successfully deleted.</p>',
    //   }),
    // });
    
    // For now, we just log it (non-blocking)
  } catch (error: any) {
    // Non-blocking: log but don't fail the deletion
    console.error("[delete-account] Failed to send email notification:", error?.message);
  }
}

async function deleteUserAccount(
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ success: boolean; stats?: DeleteAccountStats; error?: string }> {
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const stats: DeleteAccountStats = {
    submissions: 0,
    link_clicks: 0,
    links: 0,
    custom_domains: 0,
    drops: 0,
    profiles: 0,
    user_preferences: 0,
    user_sessions: 0,
    login_history: 0,
    export_audit: 0,
    users: 0,
  };

  try {
    // Get user email before deletion for notification
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email || null;

    if (userError) {
      console.warn(`[delete-account] Could not fetch user email: ${userError.message}`);
    }

    // Get profile IDs for this user (needed for counting related data)
    const { data: profiles, error: profilesFetchError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId);

    if (profilesFetchError) {
      throw new Error(`Failed to fetch profiles: ${profilesFetchError.message}`);
    }

    const profileIds = profiles?.map((p) => p.id) || [];
    stats.profiles = profileIds.length;

    // Count related data before deletion (for logging/stats)
    if (profileIds.length > 0) {
      // Get drop IDs for counting submissions
      const { data: drops, error: dropsFetchError } = await supabaseAdmin
        .from("drops")
        .select("id")
        .in("profile_id", profileIds);

      if (!dropsFetchError && drops) {
        const dropIds = drops.map((d) => d.id);
        stats.drops = dropIds.length;

        // Count submissions
        const { count: submissionsCount } = await supabaseAdmin
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .in("drop_id", dropIds);
        stats.submissions = submissionsCount || 0;
      }

      // Get link IDs for counting link_clicks
      const { data: links, error: linksFetchError } = await supabaseAdmin
        .from("links")
        .select("id")
        .in("profile_id", profileIds);

      if (!linksFetchError && links) {
        const linkIds = links.map((l) => l.id);
        stats.links = linkIds.length;

        // Count link_clicks
        const { count: linkClicksCount } = await supabaseAdmin
          .from("link_clicks")
          .select("*", { count: "exact", head: true })
          .in("link_id", linkIds);
        stats.link_clicks = linkClicksCount || 0;
      }

      // Count custom_domains
      const { count: customDomainsCount } = await supabaseAdmin
        .from("custom_domains")
        .select("*", { count: "exact", head: true })
        .in("profile_id", profileIds);
      stats.custom_domains = customDomainsCount || 0;
    }

    // Count user-level tables
    const { count: userPreferencesCount } = await supabaseAdmin
      .from("user_preferences")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    stats.user_preferences = userPreferencesCount || 0;

    const { count: userSessionsCount } = await supabaseAdmin
      .from("user_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    stats.user_sessions = userSessionsCount || 0;

    const { count: loginHistoryCount } = await supabaseAdmin
      .from("login_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    stats.login_history = loginHistoryCount || 0;

    const { count: exportAuditCount } = await supabaseAdmin
      .from("export_audit")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    stats.export_audit = exportAuditCount || 0;

    const { count: usersCount } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("id", userId);
    stats.users = usersCount || 0;

    // Now perform the actual deletions
    // Most tables have ON DELETE CASCADE, but we'll delete explicitly for safety
    // Delete order: child tables first, then parent tables

    // Delete user_preferences (no cascade dependencies)
    const { error: userPreferencesError } = await supabaseAdmin
      .from("user_preferences")
      .delete()
      .eq("user_id", userId);

    if (userPreferencesError) {
      throw new Error(`Failed to delete user_preferences: ${userPreferencesError.message}`);
    }

    // Delete user_sessions (no cascade dependencies)
    const { error: userSessionsError } = await supabaseAdmin
      .from("user_sessions")
      .delete()
      .eq("user_id", userId);

    if (userSessionsError) {
      throw new Error(`Failed to delete user_sessions: ${userSessionsError.message}`);
    }

    // Delete login_history (no cascade dependencies)
    const { error: loginHistoryError } = await supabaseAdmin
      .from("login_history")
      .delete()
      .eq("user_id", userId);

    if (loginHistoryError) {
      throw new Error(`Failed to delete login_history: ${loginHistoryError.message}`);
    }

    // Delete export_audit (no cascade dependencies)
    const { error: exportAuditError } = await supabaseAdmin
      .from("export_audit")
      .delete()
      .eq("user_id", userId);

    if (exportAuditError) {
      throw new Error(`Failed to delete export_audit: ${exportAuditError.message}`);
    }

    // Delete profiles (this will CASCADE to links, drops, custom_domains, etc.)
    const { error: profilesError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profilesError) {
      throw new Error(`Failed to delete profiles: ${profilesError.message}`);
    }

    // Delete from public.users (this should cascade to any remaining references)
    const { error: usersError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (usersError) {
      throw new Error(`Failed to delete users: ${usersError.message}`);
    }

    // Finally, delete the auth user (requires service role)
    // This must be done last as it may invalidate the user_id reference
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
    }

    // Send email notification (non-blocking)
    if (userEmail) {
      await sendEmailNotification(userEmail, supabaseUrl, serviceRoleKey);
    }

    console.log(`[delete-account] Successfully deleted account for user ${userId}`, stats);

    return { success: true, stats };
  } catch (error: any) {
    console.error(`[delete-account] Error deleting account for user ${userId}:`, error?.message, error?.stack);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

interface HandlerEnv {
  supabaseUrl?: string | null;
  supabaseAnonKey?: string | null;
  serviceRoleKey?: string | null;
  deleteAccountEnabled?: string | null;
  createClientImpl?: typeof createClient;
}

export async function handleDeleteAccountRequest(
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
    console.error("[delete-account] Missing required environment variables");
    return new Response("Server configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Safety feature flag: allow soft-launch / kill-switch for delete account
  const deleteAccountEnabled = (env.deleteAccountEnabled ?? Deno.env.get("DELETE_ACCOUNT_ENABLED") || "false").toLowerCase();

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const createClientFn = env.createClientImpl ?? createClient;
  const supabase = createClientFn(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  try {
    // 1. Parse request body for mfa_code
    let requestBody: { mfa_code?: string } = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (parseError: any) {
      console.error("[delete-account] Failed to parse request body:", parseError?.message);
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

    const mfaCode = requestBody.mfa_code?.trim();

    // 2. Validate mfa_code is provided
    if (!mfaCode || mfaCode.length !== 6) {
      return new Response(
        JSON.stringify({
          error: "MFA_CODE_REQUIRED",
          message: "MFA code is required and must be 6 digits",
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

    // 3. Authenticate request (require JWT, user must be logged in)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error("[delete-account] Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or expired token" }),
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
    const timestamp = new Date().toISOString();

    console.log(`[delete-account] Delete request received for user ${userId} at ${timestamp}`);

    // 4. Verify MFA code before proceeding
    const mfaVerification = await verifyMFACode(supabase, mfaCode, userId);

    if (!mfaVerification.success) {
      const errorCode = mfaVerification.error || "MFA_VERIFICATION_FAILED";
      let statusCode = 401;
      let message = "MFA verification failed";

      if (errorCode === "MFA_NOT_ENABLED") {
        statusCode = 403;
        message = "Two-factor authentication is not enabled. Please enable 2FA before deleting your account.";
      } else if (errorCode === "MFA_CODE_INVALID") {
        statusCode = 401;
        message = "Invalid MFA code. Please try again.";
      } else {
        statusCode = 500;
        message = "MFA verification failed. Please try again.";
      }

      return new Response(
        JSON.stringify({
          error: errorCode,
          message,
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

    console.log(`[delete-account] MFA verification successful for user ${userId}`);

    // 5. Check feature flag before performing any destructive operation
    if (deleteAccountEnabled !== "true") {
      console.warn(
        `[delete-account] Delete account is currently disabled via feature flag for user ${userId} at ${timestamp}`,
      );
      return new Response(
        JSON.stringify({
          error: "DELETE_ACCOUNT_DISABLED",
          message: "Account deletion is temporarily disabled. Please contact support if you need to delete your account.",
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 6. Perform cascade delete (only if MFA verification succeeded)
    const result = await deleteUserAccount(userId, supabaseUrl, serviceRoleKey);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "DELETE_FAILED",
          message: result.error || "Failed to delete account",
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

    // 3. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully",
        stats: result.stats,
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
    console.error("[delete-account] Unexpected error:", e?.message ?? e, e?.stack);
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

Deno.serve((req) => handleDeleteAccountRequest(req));

