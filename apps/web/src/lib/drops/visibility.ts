import { supabase } from "../supabase";
import { toast } from "sonner";

/**
 * Toggle drop visibility between public and private
 */
export async function toggleDropVisibility(
  dropId: string,
  isPublic: boolean,
): Promise<boolean> {
  const { error } = await supabase
    .from("drops")
    .update({ is_public: isPublic })
    .eq("id", dropId);

  if (error) {
    console.error("Failed to toggle drop visibility:", error);
    toast.error("Failed to update drop visibility");
    return false;
  }

  toast.success(isPublic ? "Drop is now public" : "Drop is now private");
  return true;
}
