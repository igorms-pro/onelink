import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Upload, X, File, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getDropByToken, getDropFiles } from "@/lib/drops";
import type { DropWithVisibility } from "@/lib/drops";

interface DropPageProps {
  token: string;
}

interface DropFile {
  path: string;
  size: number;
  content_type: string | null;
  submission_id: string;
  created_at: string;
  uploaded_by: string | null;
}

export default function DropPage({ token }: DropPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [drop, setDrop] = useState<DropWithVisibility | null>(null);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch drop and files
  useEffect(() => {
    async function loadDrop() {
      try {
        setLoading(true);
        setError(null);

        const dropData = await getDropByToken(token);
        if (!dropData) {
          setError("not_found");
          return;
        }

        setDrop(dropData);

        // Load files
        const dropFiles = await getDropFiles(dropData.id);
        setFiles(dropFiles);
      } catch (err) {
        console.error("Failed to load drop:", err);
        setError("error");
      } finally {
        setLoading(false);
      }
    }

    loadDrop();
  }, [token]);

  // Refresh files after upload
  const refreshFiles = async () => {
    if (!drop) return;
    const dropFiles = await getDropFiles(drop.id);
    setFiles(dropFiles);
  };

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

      alert(t("profile_drop_submission_success"));
      formRef.current.reset();
      setSelectedFiles([]);
      await refreshFiles();
    } catch (err) {
      console.error(err);
      alert(t("profile_drop_submission_failed"));
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from("drops").getPublicUrl(path);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading drop...</p>
        </div>
      </div>
    );
  }

  if (error === "not_found" || !drop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Drop Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The drop you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Drop
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            An error occurred while loading the drop. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gradient blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/5 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-pink-300/5 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-300/5 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Drop Header */}
        <div className="mb-8 text-center">
          {drop.emoji && (
            <span className="text-5xl mb-4 block" aria-hidden="true">
              {drop.emoji}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {drop.label}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {drop.is_public ? (
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                🌐 Public
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm font-medium">
                🔒 Private
              </span>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="mb-8">
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
        </div>

        {/* Files List */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Files ({files.length})
          </h2>
          {files.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No files uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => {
                const url = getFileUrl(file.path);
                const fileName = file.path.split("/").pop() || "file";
                return (
                  <div
                    key={`${file.submission_id}-${index}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <File className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                          {file.uploaded_by && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                by {file.uploaded_by}
                              </p>
                            </>
                          )}
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 ml-4 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                      aria-label="Download file"
                    >
                      <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
