import { useTranslation } from "react-i18next";
import { File as FileIcon, ChevronDown, ChevronUp } from "lucide-react";
import { DropFileList, type DropFile } from "../DropFileList";

interface DropCardFilesProps {
  files: DropFile[];
  fileCount: number | null;
  showFiles: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function DropCardFiles({
  files,
  fileCount,
  showFiles,
  isLoading,
  onToggle,
}: DropCardFilesProps) {
  const { t } = useTranslation();

  return (
    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileIcon className="w-4 h-4" />
          <span>
            {t("dashboard_content_drops_files_list")} ({fileCount ?? "..."})
          </span>
        </div>
        {showFiles ? (
          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {showFiles && (
        <div className="mt-3">
          <DropFileList files={files} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
