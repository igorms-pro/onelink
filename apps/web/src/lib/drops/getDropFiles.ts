import { supabase } from "../supabase";

/**
 * Get all files in a drop (from submissions)
 * Uses public RPC for anonymous users, direct query for authenticated owners
 */
export async function getDropFiles(dropId: string) {
  // Try using public RPC first (works for both anonymous and authenticated users)
  // This allows anonymous users to see files from public drops
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_drop_files_public",
    { p_drop_id: dropId },
  );

  if (!rpcError && rpcData) {
    // RPC returned data successfully
    return rpcData.map(
      (file: {
        path: string;
        size: number;
        content_type: string | null;
        submission_id: string;
        created_at: string;
        uploaded_by: string | null;
      }) => ({
        path: file.path,
        size: file.size,
        content_type: file.content_type,
        submission_id: file.submission_id,
        created_at: file.created_at,
        uploaded_by: file.uploaded_by,
      }),
    );
  }

  // Fallback: Try direct query (for authenticated owners, or if RPC doesn't exist yet)
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
