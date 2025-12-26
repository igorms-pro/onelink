import { supabase } from "./supabase";
import { trackProfileCreated } from "./posthog-events";

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

const USERNAME_STORAGE_KEY = "onelink_pending_username";

export async function getOrCreateProfile(userId: string): Promise<ProfileRow> {
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

  // Check for pending username from landing page signup
  let desiredSlug: string | null = null;
  try {
    const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedUsername) {
      desiredSlug = storedUsername.trim().toLowerCase();
      // Clear it after reading
      localStorage.removeItem(USERNAME_STORAGE_KEY);
    }
  } catch (e) {
    // localStorage might not be available (SSR, etc.)
    console.warn("Could not read pending username:", e);
  }

  // Try to use desired slug, fallback to generated slug
  let slugToUse = desiredSlug || `user-${userId.slice(0, 8)}`;

  // Check if desired slug is available
  if (desiredSlug) {
    const { data: existingSlug } = await supabase
      .from("profiles")
      .select("slug")
      .eq("slug", desiredSlug)
      .maybeSingle();

    if (existingSlug) {
      // Slug is taken, use fallback
      slugToUse = `user-${userId.slice(0, 8)}`;
    }
  }

  const inserted = await supabase
    .from("profiles")
    .insert([{ user_id: userId, slug: slugToUse }])
    .select("id,user_id,slug,display_name,bio,avatar_url")
    .single<ProfileRow>();

  if (inserted.error) {
    // If there's a conflict (slug taken), try fallback
    if (inserted.error.code === "23505" && desiredSlug) {
      const fallbackSlug = `user-${userId.slice(0, 8)}`;
      const retryInsert = await supabase
        .from("profiles")
        .insert([{ user_id: userId, slug: fallbackSlug }])
        .select("id,user_id,slug,display_name,bio,avatar_url")
        .single<ProfileRow>();

      if (retryInsert.error) throw retryInsert.error;

      const profile = retryInsert.data as ProfileRow;
      trackProfileCreated(userId, profile.slug);
      return profile;
    }
    throw inserted.error;
  }

  // Track profile creation
  const profile = inserted.data as ProfileRow;
  trackProfileCreated(userId, profile.slug);

  return profile;
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
