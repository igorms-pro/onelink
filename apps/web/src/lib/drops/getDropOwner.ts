import { supabase } from "../supabase";

/**
 * Get the owner user_id for a drop
 * Used for PostHog tracking
 */
export async function getDropOwnerUserId(
  dropId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("drops")
    .select("profile_id,profiles!inner(user_id)")
    .eq("id", dropId)
    .maybeSingle<{ profile_id: string; profiles: { user_id: string } }>();

  if (error || !data) {
    return null;
  }

  return data.profiles.user_id;
}
