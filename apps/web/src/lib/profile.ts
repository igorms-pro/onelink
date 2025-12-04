import { supabase } from "./supabase";
import { getDefaultPlan } from "./types/plan";
import type { PlanTypeValue } from "./types/plan";

export type ProfileRow = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export async function getOrCreateProfile(userId: string): Promise<ProfileRow> {
  console.log("[Profile] getOrCreateProfile called for userId:", userId);

  try {
    // First, ensure user exists in public.users table
    // The trigger should create it, but let's check and create if needed
    // Use Promise.race with timeout to prevent hanging
    console.log("[Profile] Checking if user exists in public.users...");
    const userCheckStartTime = Date.now();
    let userData, userError;

    try {
      const queryPromise = supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("User check query timed out after 5 seconds"));
        }, 5000);
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      userData = result.data;
      userError = result.error;
      const userCheckDuration = Date.now() - userCheckStartTime;
      console.log(`[Profile] User check completed in ${userCheckDuration}ms`);
    } catch (err) {
      const userCheckDuration = Date.now() - userCheckStartTime;
      console.error(
        `[Profile] User check threw error after ${userCheckDuration}ms:`,
        err,
      );
      userError = err as Error;
      // If query timed out or failed, continue anyway - the trigger should handle user creation
    }

    console.log("[Profile] User check result:", {
      hasData: !!userData,
      data: userData,
      error: userError,
      errorMessage: userError instanceof Error ? userError.message : undefined,
      errorCode:
        userError && typeof userError === "object" && "code" in userError
          ? String(userError.code)
          : undefined,
    });

    // Only try to create user if check succeeded but user doesn't exist
    // If check failed/timed out, skip creation attempt and continue to profile query
    if (!userError && !userData) {
      console.log(
        "[Profile] User not found in public.users, checking auth user...",
      );
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          console.log(
            "[Profile] Auth user found, creating public.users entry...",
          );
          const { data: newUser, error: createUserError } = await supabase
            .from("users")
            .insert([{ id: userId, email: authUser.user.email || "" }])
            .select("id")
            .single();

          console.log("[Profile] Create user result:", {
            data: newUser,
            error: createUserError,
          });

          if (createUserError) {
            console.error("[Profile] Error creating user:", createUserError);
            // Continue anyway, the trigger might create it
          }
        }
      } catch (createErr) {
        console.error("[Profile] Error in user creation attempt:", createErr);
        // Continue anyway
      }
    } else if (userError) {
      console.log(
        "[Profile] User check failed/timed out, skipping user creation attempt. Continuing to profile query...",
      );
    }

    // Check if profile exists
    console.log("[Profile] Querying existing profile from Supabase...");
    const queryStartTime = Date.now();
    const existing = await supabase
      .from("profiles")
      .select("id,user_id,slug,display_name,bio,avatar_url")
      .eq("user_id", userId)
      .maybeSingle<ProfileRow>();

    const queryDuration = Date.now() - queryStartTime;
    console.log(`[Profile] Query completed in ${queryDuration}ms`);

    console.log("[Profile] Existing profile query result:", {
      hasData: !!existing.data,
      data: existing.data,
      error: existing.error,
      errorMessage: existing.error?.message,
      errorCode: existing.error?.code,
      errorDetails: existing.error?.details,
      errorHint: existing.error?.hint,
    });

    if (existing.error) {
      console.error("[Profile] Error checking existing profile:", {
        message: existing.error.message,
        code: existing.error.code,
        details: existing.error.details,
        hint: existing.error.hint,
      });
      // Don't throw here, try to create instead
    }

    if (existing.data) {
      console.log("[Profile] Returning existing profile:", existing.data);
      return existing.data as ProfileRow;
    }

    // Create profile if it doesn't exist
    const fallbackSlug = `user-${userId.slice(0, 8)}`;
    console.log("[Profile] Creating new profile with slug:", fallbackSlug);

    console.log("[Profile] Inserting profile into Supabase...");
    const inserted = await supabase
      .from("profiles")
      .insert([{ user_id: userId, slug: fallbackSlug }])
      .select("id,user_id,slug,display_name,bio,avatar_url")
      .single<ProfileRow>();

    console.log("[Profile] Insert result:", {
      hasData: !!inserted.data,
      data: inserted.data,
      error: inserted.error,
      errorMessage: inserted.error?.message,
      errorCode: inserted.error?.code,
      errorDetails: inserted.error?.details,
      errorHint: inserted.error?.hint,
    });

    if (inserted.error) {
      console.error("[Profile] Error creating profile:", {
        message: inserted.error.message,
        code: inserted.error.code,
        details: inserted.error.details,
        hint: inserted.error.hint,
      });
      throw inserted.error;
    }

    if (!inserted.data) {
      console.error("[Profile] Insert succeeded but no data returned!");
      throw new Error("Profile creation failed: no data returned");
    }

    console.log("[Profile] Returning new profile:", inserted.data);
    return inserted.data as ProfileRow;
  } catch (error) {
    console.error("[Profile] Unexpected error in getOrCreateProfile:", error);
    throw error;
  }
}

export async function getSelfPlan(userId: string): Promise<PlanTypeValue> {
  const { data, error } = await supabase.rpc("get_plan_by_user", {
    p_user_id: userId,
  });
  if (error) return getDefaultPlan();
  return (data ?? getDefaultPlan()) as PlanTypeValue;
}

export async function getPlanBySlug(slug: string): Promise<PlanTypeValue> {
  const { data, error } = await supabase.rpc("get_plan_by_slug", {
    p_slug: slug,
  });
  if (error) return getDefaultPlan();
  return (data ?? getDefaultPlan()) as PlanTypeValue;
}
