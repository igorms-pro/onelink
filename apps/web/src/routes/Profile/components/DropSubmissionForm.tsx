import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FileDropZone,
  FilePreviewList,
  SubmissionFormFields,
  SubmitButton,
} from "@/components/upload";
import { useDropSubmission } from "./useDropSubmission";
import type { PublicDrop } from "../types";

interface DropSubmissionFormProps {
  drop: PublicDrop;
}

export function DropSubmissionForm({ drop }: DropSubmissionFormProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    submitting: uploading,
    selectedFiles,
    setSelectedFiles,
    handleSubmit: handleSubmission,
  } = useDropSubmission(drop);

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
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = (formData.get("name") as string) || null;
    const email = (formData.get("email") as string) || null;
    const note = (formData.get("note") as string) || null;

    const success = await handleSubmission({
      name,
      email,
      note,
      files: selectedFiles,
    });

    if (success && formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div
      className={`rounded-xl border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-all ${
        isExpanded
          ? "bg-purple-50 dark:bg-gray-800/80"
          : "bg-white dark:bg-gray-800/80"
      }`}
    >
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 sm:p-8 pb-4 sm:pb-4 text-left cursor-pointer"
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
          onSubmit={handleSubmit}
        >
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

          <SubmitButton isLoading={uploading} />
        </form>
      )}
    </div>
  );
}
