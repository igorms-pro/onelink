import { File, Download } from "lucide-react";
import {
  formatFileSize,
  formatDateFull,
  getFileUrl,
} from "@/lib/utils/fileUtils";

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
}

export function DropFileList({ files }: DropFileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        No files uploaded yet.
      </p>
    );
  }

  return (
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
                    {formatDateFull(file.created_at)}
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
  );
}
