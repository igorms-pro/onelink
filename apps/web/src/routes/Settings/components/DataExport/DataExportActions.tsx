import { useTranslation } from "react-i18next";
import { Download, Loader2 } from "lucide-react";

interface DataExportActionsProps {
  isGenerating: boolean;
  isReady: boolean;
  hasSelectedData: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export function DataExportActions({
  isGenerating,
  isReady,
  hasSelectedData,
  onGenerate,
  onDownload,
  onClose,
}: DataExportActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        {isReady ? t("common_close") : t("common_cancel")}
      </button>
      {isReady ? (
        <button
          type="button"
          onClick={onDownload}
          className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {t("settings_export_download")}
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !hasSelectedData}
          className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("settings_export_generating")}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t("settings_export_generate")}
            </>
          )}
        </button>
      )}
    </div>
  );
}
