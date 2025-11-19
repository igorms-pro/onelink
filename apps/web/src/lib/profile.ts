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

  // Create profile if it doesn't exist
  const fallbackSlug = `user-${userId.slice(0, 8)}`;
  const inserted = await supabase
    .from("profiles")
    .insert([{ user_id: userId, slug: fallbackSlug }])
    .select("id,user_id,slug,display_name,bio,avatar_url")
    .single<ProfileRow>();

  if (inserted.error) throw inserted.error;
  return inserted.data as ProfileRow;
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
