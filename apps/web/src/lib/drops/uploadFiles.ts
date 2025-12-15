import { supabase } from "../supabase";
import { toast } from "sonner";

/**
 * Upload file to drop as owner
 * Uploads file to Supabase Storage and creates a submission record
 */
export async function uploadFileToDrop(
  dropId: string,
  file: File,
  userId: string | null = null,
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
          uploaded_by: userId, // Track who uploaded (owner)
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
