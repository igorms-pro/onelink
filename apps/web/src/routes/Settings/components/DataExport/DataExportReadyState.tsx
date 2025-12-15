import { useTranslation } from "react-i18next";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface DataExportReadyStateProps {
  downloadUrl: string | null;
}

export function DataExportReadyState({
  downloadUrl,
}: DataExportReadyStateProps) {
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    if (!downloadUrl) return;

    try {
      await navigator.clipboard.writeText(downloadUrl);
    } catch (error) {
      console.error("Failed to copy export link", error);
      toast.error(t("dashboard_content_drops_link_copy_failed"));
    }
  };

  return (
    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <CheckCircle2
          data-testid="data-export-ready-icon"
          className="w-5 h-5 text-green-600 dark:text-green-400"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900 dark:text-green-200">
            {t("settings_export_ready")}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {t("settings_export_download_valid_24h")}
          </p>
        </div>
      </div>

      {downloadUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-md bg-green-100/60 dark:bg-green-900/40 text-[11px] sm:text-xs text-green-900 dark:text-green-100 break-all">
            {downloadUrl}
          </div>
          {navigator.clipboard && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md border border-green-300 dark:border-green-700 bg-white/80 dark:bg-green-900/60 text-xs font-medium text-green-800 dark:text-green-100 hover:bg-green-50 dark:hover:bg-green-800 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {t("dashboard_content_drops_copy_link")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
