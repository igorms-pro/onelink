import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import type { PublicDrop } from "../types";

interface DropSubmissionFormData {
  name: string | null;
  email: string | null;
  note: string | null;
  files: File[];
}

export function useDropSubmission(drop: PublicDrop) {
  const { t } = useTranslation();
  const { submitting, submit } = useAsyncSubmit();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFiles = useCallback(
    (files: File[]): boolean => {
      const maxSizeMB = drop.max_file_size_mb ?? 50;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const blockedExtensions = [
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

      for (const file of files) {
        if (file.size > maxSizeBytes) {
          toast.error(
            t("profile_drop_submission_file_too_large", {
              name: file.name,
              limit: maxSizeMB,
            }),
          );
          return false;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (blockedExtensions.includes(ext)) {
          toast.error(t("profile_drop_submission_file_type_blocked", { ext }));
          return false;
        }
      }

      return true;
    },
    [drop.max_file_size_mb, t],
  );

  const uploadFiles = useCallback(
    async (
      files: File[],
    ): Promise<
      Array<{
        path: string;
        size: number;
        content_type: string | null;
      }>
    > => {
      const uploaded: Array<{
        path: string;
        size: number;
        content_type: string | null;
      }> = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${drop.drop_id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("drops")
          .upload(key, file, {
            contentType: file.type || undefined,
            upsert: false,
          });

        if (upErr) throw upErr;

        uploaded.push({
          path: key,
          size: file.size,
          content_type: file.type || null,
        });
      }

      return uploaded;
    },
    [drop.drop_id],
  );

  const handleSubmit = useCallback(
    async (formData: DropSubmissionFormData): Promise<boolean> => {
      if (!validateFiles(formData.files)) {
        return false;
      }

      try {
        await submit(async () => {
          const uploaded = await uploadFiles(formData.files);

          const { error } = await supabase.from("submissions").insert([
            {
              drop_id: drop.drop_id,
              name: formData.name,
              email: formData.email,
              note: formData.note,
              files: uploaded,
              user_agent: navigator.userAgent,
            },
          ]);

          if (error) throw error;

          toast.success(t("profile_drop_submission_success"));
          setSelectedFiles([]);
        });
        return true;
      } catch {
        return false;
      }
    },
    [validateFiles, uploadFiles, drop.drop_id, submit, t],
  );

  return {
    submitting,
    selectedFiles,
    setSelectedFiles,
    handleSubmit,
  };
}
