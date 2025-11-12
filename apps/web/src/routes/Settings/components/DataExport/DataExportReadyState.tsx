import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

export function DataExportReadyState() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900 dark:text-green-200">
            {t("settings_export_ready")}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {t("settings_export_download_valid_24h")}
          </p>
        </div>
      </div>
    </div>
  );
}
