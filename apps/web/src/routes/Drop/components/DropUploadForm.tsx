import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        const ext = f.name.split(".").pop() || "bin";
        const key = `${drop.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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
        {/* Form Fields */}
        <div className="grid gap-4 mb-6">
          <input
            name="name"
            placeholder={t("profile_drop_submission_name_placeholder")}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
          />
          <input
            name="email"
            type="email"
            placeholder={t("profile_drop_submission_email_placeholder")}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
          />
          <textarea
            name="note"
            placeholder={t("profile_drop_submission_note_placeholder")}
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("profile_drop_submission_files_label")}
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative rounded-lg border-2 border-dashed transition-all cursor-pointer
              ${
                isDragging
                  ? "border-purple-500 bg-purple-100 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-purple-50 dark:bg-gray-900/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-8 text-center">
              <Upload
                className={`w-12 h-12 mx-auto mb-3 ${
                  isDragging
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-400 dark:text-gray-500"
                } transition-colors`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {t("profile_drop_submission_click_to_upload")}
                </span>{" "}
                {t("profile_drop_submission_or_drag_drop")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t("profile_drop_submission_max_size", {
                  size: drop.max_file_size_mb ?? 50,
                })}
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="shrink-0 ml-3 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || selectedFiles.length === 0}
          className="w-full rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white px-6 py-3.5 text-base font-semibold hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            t("profile_drop_submission_send")
          )}
        </button>
      </form>
    </div>
  );
}
