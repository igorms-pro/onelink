import { supabase } from "../supabase";

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
