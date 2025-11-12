import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "../hooks/useUserPreferences";

export function NotificationsSection() {
  const { t } = useTranslation();
  const { preferences, loading, saving, updatePreference } =
    useUserPreferences();

  if (loading) {
    return (
      <section
        data-testid="settings-notifications-section"
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("settings_notifications")}
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
    <section
      data-testid="settings-notifications-section"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_notifications")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_email_notifications")}
          </span>
          <input
            data-testid="settings-email-notifications-toggle"
            type="checkbox"
            checked={preferences.email_notifications}
            onChange={(e) =>
              updatePreference("email_notifications", e.target.checked)
            }
            disabled={saving}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_weekly_digest")}
          </span>
          <input
            data-testid="settings-weekly-digest-toggle"
            type="checkbox"
            checked={preferences.weekly_digest}
            onChange={(e) =>
              updatePreference("weekly_digest", e.target.checked)
            }
            disabled={saving}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>
    </section>
  );
}
