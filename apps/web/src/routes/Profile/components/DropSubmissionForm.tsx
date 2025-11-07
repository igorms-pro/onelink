import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PublicDrop } from "../types";

interface DropSubmissionFormProps {
  drop: PublicDrop;
}

export function DropSubmissionForm({ drop }: DropSubmissionFormProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 sm:p-8 pb-4 sm:pb-4 text-left"
      >
        <div className="flex items-center gap-3">
          {drop.emoji && (
            <span className="text-2xl" aria-hidden="true">
              {drop.emoji}
            </span>
          )}
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {drop.label}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <form
          ref={formRef}
          className="px-6 sm:px-8 pb-6 sm:pb-8"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!formRef.current) return;

            const formData = new FormData(formRef.current);
            const name = (formData.get("name") as string) || null;
            const email = (formData.get("email") as string) || null;
            const note = (formData.get("note") as string) || null;
            const files = selectedFiles;
            const maxSizeMB = drop.max_file_size_mb ?? 50;
            const maxSizeBytes = maxSizeMB * 1024 * 1024;

            // Client-side validation
            for (const f of files) {
              if (f.size > maxSizeBytes) {
                alert(
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
                alert(t("profile_drop_submission_file_type_blocked", { ext }));
                return;
              }
            }

            try {
              // Upload files to Supabase Storage
              const uploaded: {
                path: string;
                size: number;
                content_type: string | null;
              }[] = [];
              for (const f of files) {
                const ext = f.name.split(".").pop() || "bin";
                const key = `${drop.drop_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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
                  drop_id: drop.drop_id,
                  name,
                  email,
                  note,
                  files: uploaded,
                  user_agent: navigator.userAgent,
                },
              ]);
              if (error) throw error;
              alert(t("profile_drop_submission_success"));
              formRef.current.reset();
              setSelectedFiles([]);
            } catch (err) {
              console.error(err);
              alert(t("profile_drop_submission_failed"));
            }
          }}
        >
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
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50/50 dark:bg-gray-900/50"
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
                    size: Number(drop.max_file_size_mb) || 50,
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
                      className="shrink-0 ml-3 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
            className="w-full rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white px-6 py-3.5 text-base font-semibold hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10"
          >
            {t("profile_drop_submission_send")}
          </button>
        </form>
      )}
    </div>
  );
}
