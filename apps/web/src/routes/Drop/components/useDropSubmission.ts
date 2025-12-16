import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DropWithVisibility } from "@/lib/drops";

export function useDropSubmission(
  drop: DropWithVisibility,
  onComplete: () => void,
) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const submitFiles = async (
    files: File[],
    name: string | null,
    email: string | null,
    note: string | null,
  ): Promise<boolean> => {
    if (!drop || files.length === 0) return false;

    const maxSizeMB = drop.max_file_size_mb ?? 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Client-side validation
    for (const f of files) {
      if (f.size > maxSizeBytes) {
        toast.error(
          t("profile_drop_submission_file_too_large", {
            name: f.name,
            limit: maxSizeMB,
          }),
        );
        return false;
      }
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const blocked = [
        "exe",
        "bat",
        "cmd",
        "com",
        "pif",
        "scr",
        "vbs",
        "js",
        "jar",
        "app",
        "dmg",
      ];
      if (blocked.includes(ext)) {
        toast.error(t("profile_drop_submission_file_type_blocked", { ext }));
        return false;
      }
    }

    try {
      setUploading(true);

      // Upload files to Supabase Storage
      const uploaded: {
        path: string;
        size: number;
        content_type: string | null;
      }[] = [];
      for (const f of files) {
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${drop.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("drops")
          .upload(key, f, {
            contentType: f.type || undefined,
            upsert: false,
          });
        if (upErr) throw upErr;
        uploaded.push({
          path: key,
          size: f.size,
          content_type: f.type || null,
        });
      }

      // Create submission row
      const { error } = await supabase.from("submissions").insert([
        {
          drop_id: drop.id,
          name,
          email,
          note,
          files: uploaded,
          user_agent: navigator.userAgent,
        },
      ]);
      if (error) throw error;

      toast.success(t("profile_drop_submission_success"));
      onComplete();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(t("profile_drop_submission_failed"));
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { submitFiles, uploading };
}
