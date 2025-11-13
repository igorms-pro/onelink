import { useTranslation } from "react-i18next";

interface DataExportProgressProps {
  progress: number;
}

export function DataExportProgress({ progress }: DataExportProgressProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">
          {t("settings_export_generating")}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          data-testid="data-export-progress-bar"
          className="bg-linear-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
