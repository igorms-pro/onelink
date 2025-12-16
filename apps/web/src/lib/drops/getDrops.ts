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
      "id,label,emoji,order,is_active,is_public,share_token,max_file_size_mb",
    )
    .eq("share_token", shareToken)
    .eq("is_active", true)
    .maybeSingle<DropWithVisibility>();

  if (error) {
    console.error("Failed to get drop by token:", error);
    return null;
  }

  return data;
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
