import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export function TwoFactorActiveStatus() {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 shadow-sm"
      data-testid="two-factor-active-status"
    >
      <div className="flex items-center gap-3 mb-2">
        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h2
          className="text-xl font-semibold text-green-900 dark:text-green-100"
          data-testid="two-factor-active-title"
        >
          {t("settings_2fa_active")}
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300">
        {t("settings_2fa_active_description")}
      </p>
    </div>
  );
}
