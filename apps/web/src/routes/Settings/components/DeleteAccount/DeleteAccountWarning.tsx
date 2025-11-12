import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export function DeleteAccountWarning() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">
            {t("settings_delete_account_warning_title")}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {t("settings_delete_account_warning_description")}
          </p>
        </div>
      </div>
    </div>
  );
}
