import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface FileValidationOptions {
  maxSizeMB?: number;
  blockedExtensions?: string[];
}

const DEFAULT_BLOCKED_EXTENSIONS = [
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

/**
 * Hook for managing file uploads with drag & drop, validation, and file management
 */
export function useFileUpload(options: FileValidationOptions = {}) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const maxSizeMB = options.maxSizeMB ?? 50;
  const blockedExtensions =
    options.blockedExtensions ?? DEFAULT_BLOCKED_EXTENSIONS;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeBytes) {
        return t("profile_drop_submission_file_too_large", {
          name: file.name,
          limit: maxSizeMB,
        });
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (blockedExtensions.includes(ext)) {
        return t("profile_drop_submission_file_type_blocked", { ext });
      }
      return null;
    },
    [maxSizeBytes, maxSizeMB, blockedExtensions, t],
  );

  const validateFiles = useCallback((): boolean => {
    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return false;
      }
    }
    return true;
  }, [selectedFiles, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      }
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    isDragging,
    selectedFiles,
    uploading,
    setUploading,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    clearFiles,
    validateFiles,
    validateFile,
  };
}
