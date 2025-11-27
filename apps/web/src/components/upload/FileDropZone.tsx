import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";

interface FileDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxFileSizeMB?: number;
  multiple?: boolean;
}

export function FileDropZone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  maxFileSizeMB = 50,
  multiple = true,
}: FileDropZoneProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        multiple={multiple}
        onChange={onFileSelect}
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
          {t("profile_drop_submission_max_size", { size: maxFileSizeMB })}
        </p>
      </div>
    </div>
  );
}
