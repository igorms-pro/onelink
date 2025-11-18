import { File } from "lucide-react";
import { formatFileSize, formatDate, getFileUrl } from "@/lib/utils/fileUtils";
import { useTranslation } from "react-i18next";

export interface DropFile {
  path: string;
  size: number;
  content_type: string | null;
  submission_id: string;
  created_at: string;
  uploaded_by: string | null;
}

interface DropFileListProps {
  files: DropFile[];
  isLoading: boolean;
}

export function DropFileList({ files, isLoading }: DropFileListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        {t("common_loading")}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        {t("dashboard_content_drops_no_files")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.submission_id}-${index}`}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <File className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <a
                href={getFileUrl(file.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline truncate block"
              >
                {file.path.split("/").pop()}
              </a>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  •
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(file.created_at)}
                </p>
                {file.uploaded_by && (
                  <>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      •
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("dashboard_content_drops_uploaded_by")}{" "}
                      {file.uploaded_by}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
