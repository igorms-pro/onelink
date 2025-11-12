import { useNavigate } from "react-router-dom";
import { Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ActiveSessionsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      data-testid="settings-active-sessions-section"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_active_sessions")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <button
          data-testid="settings-view-sessions"
          onClick={() => navigate("/settings/sessions#active-sessions")}
          className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
        >
          {t("settings_view_sessions")}
        </button>
        <button
          data-testid="settings-login-history"
          onClick={() => navigate("/settings/sessions#login-history")}
          className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
        >
          {t("settings_login_history")}
        </button>
      </div>
    </section>
  );
}
