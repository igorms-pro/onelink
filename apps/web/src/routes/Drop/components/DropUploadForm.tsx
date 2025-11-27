import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  FileDropZone,
  FilePreviewList,
  SubmissionFormFields,
  SubmitButton,
} from "@/components/upload";
import type { DropWithVisibility } from "@/lib/drops";

interface DropUploadFormProps {
  drop: DropWithVisibility;
  onUploadComplete: () => void;
}

export function DropUploadForm({
  drop,
  onUploadComplete,
}: DropUploadFormProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drop || !formRef.current || selectedFiles.length === 0) return;

    const formData = new FormData(formRef.current);
    const name = (formData.get("name") as string) || null;
    const email = (formData.get("email") as string) || null;
    const note = (formData.get("note") as string) || null;
    const maxSizeMB = drop.max_file_size_mb ?? 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Client-side validation
    for (const f of selectedFiles) {
      if (f.size > maxSizeBytes) {
        toast.error(
          t("profile_drop_submission_file_too_large", {
            name: f.name,
            limit: maxSizeMB,
          }),
        );
        return;
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
        return;
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
      for (const f of selectedFiles) {
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
      formRef.current.reset();
      setSelectedFiles([]);
      onUploadComplete();
    } catch (err) {
      console.error(err);
      toast.error(t("profile_drop_submission_failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Upload Files
      </h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <SubmissionFormFields />

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("profile_drop_submission_files_label")}
          </label>
          <FileDropZone
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            maxFileSizeMB={drop.max_file_size_mb ?? 50}
          />
          <FilePreviewList files={selectedFiles} onRemove={removeFile} />
        </div>

        <SubmitButton
          isLoading={uploading}
          disabled={selectedFiles.length === 0}
        />
      </form>
    </div>
  );
}
