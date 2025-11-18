import { supabase } from "./supabase";
import { toast } from "sonner";

export type DropWithVisibility = {
  id: string;
  label: string;
  emoji: string | null;
  order: number;
  is_active: boolean;
  is_public: boolean;
  share_token: string | null;
  max_file_size_mb: number | null;
};

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
  dropId: string,
  shareToken: string | null,
): string | null {
  if (!shareToken) return null;

  // Get current origin (domain)
  const origin = window.location.origin;
  return `${origin}/drop/${shareToken}`;
}

/**
 * Get all files in a drop (from submissions)
 */
export async function getDropFiles(dropId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select("id,files,created_at,name,email")
    .eq("drop_id", dropId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get drop files:", error);
    return [];
  }

  // Flatten files from all submissions
  const allFiles: Array<{
    path: string;
    size: number;
    content_type: string | null;
    submission_id: string;
    created_at: string;
    uploaded_by: string | null;
  }> = [];

  data?.forEach((submission) => {
    if (Array.isArray(submission.files)) {
      submission.files.forEach(
        (file: { path: string; size: number; content_type: string | null }) => {
          allFiles.push({
            ...file,
            submission_id: submission.id,
            created_at: submission.created_at,
            uploaded_by: submission.name || submission.email || null,
          });
        },
      );
    }
  });

  return allFiles;
}

/**
 * Upload file to drop as owner
 * Uploads file to Supabase Storage and creates a submission record
 */
export async function uploadFileToDrop(
  dropId: string,
  file: File,
): Promise<boolean> {
  try {
    // Generate unique file path
    const ext = file.name.split(".").pop() || "bin";
    const key = `${dropId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("drops")
      .upload(key, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload file to storage:", uploadError);
      toast.error("Failed to upload file");
      return false;
    }

    // Create submission record (owner upload, no name/email required)
    const { error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          drop_id: dropId,
          name: null, // Owner upload, no name required
          email: null, // Owner upload, no email required
          note: null,
          files: [
            {
              path: key,
              size: file.size,
              content_type: file.type || null,
            },
          ],
          user_agent: navigator.userAgent,
        },
      ]);

    if (submissionError) {
      console.error("Failed to create submission record:", submissionError);
      // Try to clean up uploaded file if submission creation fails
      await supabase.storage.from("drops").remove([key]);
      toast.error("Failed to save file record");
      return false;
    }

    toast.success("File uploaded successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error during file upload:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
}
