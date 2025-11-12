import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "../hooks/useUserPreferences";

export function EmailPreferencesSection() {
  const { t } = useTranslation();
  const { preferences, loading, saving, updatePreference } =
    useUserPreferences();

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("settings_email_preferences")}
          </h2>
        </div>
        <div className="space-y-3 pl-7">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </div>
      </section>
    );
  }

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
            checked={preferences.marketing_emails}
            onChange={(e) =>
              updatePreference("marketing_emails", e.target.checked)
            }
            disabled={saving}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_product_updates")}
          </span>
          <input
            type="checkbox"
            checked={preferences.product_updates}
            onChange={(e) =>
              updatePreference("product_updates", e.target.checked)
            }
            disabled={saving}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>
    </section>
  );
}
