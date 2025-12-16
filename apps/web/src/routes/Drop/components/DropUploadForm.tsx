import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FileDropZone,
  FilePreviewList,
  SubmissionFormFields,
  SubmitButton,
} from "@/components/upload";
import type { DropWithVisibility } from "@/lib/drops";
import { useDropSubmission } from "./useDropSubmission";

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
  const formRef = useRef<HTMLFormElement>(null);
  const { submitFiles, uploading } = useDropSubmission(drop, () => {
    formRef.current?.reset();
    setSelectedFiles([]);
    onUploadComplete();
  });

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
    if (!formRef.current || selectedFiles.length === 0) return;

    const formData = new FormData(formRef.current);
    const name = (formData.get("name") as string) || null;
    const email = (formData.get("email") as string) || null;
    const note = (formData.get("note") as string) || null;

    await submitFiles(selectedFiles, name, email, note);
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
