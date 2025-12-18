import { supabase } from "../supabase";
import type { DropWithVisibility } from "./types";

/**
 * Get drop by share token (for private drop access)
 */
export async function getDropByToken(
  shareToken: string,
): Promise<DropWithVisibility | null> {
  const { data, error } = await supabase
    .from("drops")
    .select(
      "id,label,emoji,order,is_active,is_public,share_token,max_file_size_mb,profile_id,profiles!inner(user_id)",
    )
    .eq("share_token", shareToken)
    .eq("is_active", true)
    .maybeSingle<
      DropWithVisibility & { profile_id: string; profiles: { user_id: string } }
    >();

  if (error) {
    console.error("Failed to get drop by token:", error);
    return null;
  }

  if (!data) return null;

  // Extract owner user_id and return clean DropWithVisibility
  return {
    id: data.id,
    label: data.label,
    emoji: data.emoji,
    order: data.order,
    is_active: data.is_active,
    is_public: data.is_public,
    share_token: data.share_token,
    max_file_size_mb: data.max_file_size_mb,
    profile_id: data.profile_id,
    owner_user_id: data.profiles.user_id,
  };
}

/**
 * Get shareable link for a drop
 */
export function getDropShareLink(
  _dropId: string,
  shareToken: string | null,
): string | null {
  if (!shareToken) return null;

  // Get current origin (domain)
  const origin = window.location.origin;
  return `${origin}/drop/${shareToken}`;
}
