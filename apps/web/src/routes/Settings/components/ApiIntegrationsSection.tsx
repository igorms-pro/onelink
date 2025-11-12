import { Key } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ApiIntegrationsSection() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="settings-api-integrations-section"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm opacity-50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_api_integrations")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t("settings_coming_soon")}
        </div>
      </div>
    </section>
  );
}
