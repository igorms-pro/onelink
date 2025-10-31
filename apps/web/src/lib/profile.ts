import { supabase } from "./supabase";

export type ProfileRow = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | string;
};

export async function getOrCreateProfile(userId: string): Promise<ProfileRow> {
  const existing = await supabase
    .from("profiles")
    .select("id,user_id,slug,display_name,bio,avatar_url,plan")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (existing.data) return existing.data as ProfileRow;

  const fallbackSlug = `user-${userId.slice(0, 8)}`;
  const inserted = await supabase
    .from("profiles")
    .insert([{ user_id: userId, slug: fallbackSlug, plan: "free" }])
    .select("id,user_id,slug,display_name,bio,avatar_url,plan")
    .single<ProfileRow>();

  if (inserted.error) throw inserted.error;
  return inserted.data as ProfileRow;
}

export async function getSelfPlan(userId: string): Promise<"free" | "pro" | string> {
  const { data, error } = await supabase.rpc("get_plan_by_user", { p_user_id: userId });
  if (error) return "free";
  return (data ?? "free") as "free" | "pro" | string;
}

export async function getPlanBySlug(slug: string): Promise<"free" | "pro" | string> {
  const { data, error } = await supabase.rpc("get_plan_by_slug", { p_slug: slug });
  if (error) return "free";
  return (data ?? "free") as "free" | "pro" | string;
}


