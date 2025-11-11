import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmailPreferencesSection() {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_email_preferences")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_marketing_emails")}
          </span>
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_product_updates")}
          </span>
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
            defaultChecked
          />
        </label>
      </div>
    </section>
  );
}
