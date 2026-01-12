import { supabase } from "./supabase";

export type ProfileRow = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

/**
 * Free plan limits (separate for links and drops)
 *
 * NOTE: Currently hardcoded, but can be easily migrated to DB later if needed.
 * To migrate: create a plan_limits table and fetch from DB here.
 */
export const FREE_PLAN_LINKS_LIMIT = 4;
export const FREE_PLAN_DROPS_LIMIT = 2;

/**
 * Get links limit for a given plan
 * @param plan - Plan type ("free" | "pro" | string)
 * @returns Limit number (4 for free, Infinity for pro/unlimited)
 *
 * Future: Can be modified to fetch from DB if dynamic limits are needed
 */
export function getPlanLinksLimit(plan: "free" | "pro" | string): number {
  if (plan === "pro") {
    return Infinity;
  }
  return FREE_PLAN_LINKS_LIMIT;
}

/**
 * Get drops limit for a given plan
 * @param plan - Plan type ("free" | "pro" | string)
 * @returns Limit number (2 for free, Infinity for pro/unlimited)
 *
 * Future: Can be modified to fetch from DB if dynamic limits are needed
 */
export function getPlanDropsLimit(plan: "free" | "pro" | string): number {
  if (plan === "pro") {
    return Infinity;
  }
  return FREE_PLAN_DROPS_LIMIT;
}

/**
 * @deprecated Use getPlanLinksLimit and getPlanDropsLimit instead
 * Kept for backward compatibility
 */
export const FREE_PLAN_ITEM_LIMIT =
  FREE_PLAN_LINKS_LIMIT + FREE_PLAN_DROPS_LIMIT;

/**
 * @deprecated Use getPlanLinksLimit and getPlanDropsLimit instead
 * Kept for backward compatibility
 */
export function getPlanItemLimit(plan: "free" | "pro" | string): number {
  if (plan === "pro") {
    return Infinity;
  }
  return FREE_PLAN_ITEM_LIMIT;
}

/**
 * @deprecated Use getPlanItemLimit instead
 * Kept for backward compatibility
 */
export const FREE_DROP_LIMIT = FREE_PLAN_ITEM_LIMIT;

/**
 * @deprecated Use getPlanItemLimit instead
 * Kept for backward compatibility
 */
export function getDropLimit(plan: "free" | "pro" | string): number {
  return getPlanItemLimit(plan);
}

/**
 * Get existing profile for a user, or return null if it doesn't exist.
 *
 * NOTE: This function NO LONGER creates a profile automatically.
 * Use the Edge Function `create-profile` or `createProfileWithUsername()`
 * to create a new profile.
 *
 * @param userId - The user ID
 * @returns The profile if it exists, or null if it doesn't
 */
export async function getOrCreateProfile(
  userId: string,
): Promise<ProfileRow | null> {
  // First, ensure public.users row exists (trigger should create it, but just in case)
  const { error: userError } = await supabase.from("users").upsert(
    {
      id: userId,
      email: (await supabase.auth.getUser()).data.user?.email ?? "",
    },
    { onConflict: "id" },
  );
  if (userError) console.warn("Failed to ensure users row:", userError);

  // Check if profile exists
  const existing = await supabase
    .from("profiles")
    .select("id,user_id,slug,display_name,bio,avatar_url")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (existing.data) return existing.data as ProfileRow;

  // Profile doesn't exist - return null
  // The profile will be created via the Welcome page using the Edge Function
  return null;
}

export async function getSelfPlan(
  userId: string,
): Promise<"free" | "pro" | string> {
  const { data, error } = await supabase.rpc("get_plan_by_user", {
    p_user_id: userId,
  });
  if (error) return "free";
  return (data ?? "free") as "free" | "pro" | string;
}

export async function getPlanBySlug(
  slug: string,
): Promise<"free" | "pro" | string> {
  const { data, error } = await supabase.rpc("get_plan_by_slug", {
    p_slug: slug,
  });
  if (error) return "free";
  return (data ?? "free") as "free" | "pro" | string;
}
