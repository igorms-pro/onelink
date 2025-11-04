import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { goToCheckout, goToPortal } from "@/lib/billing";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";

interface DashboardHeaderProps {
  isFree: boolean;
  onSettingsClick: () => void;
  onSignOut: () => void;
}

export function DashboardHeader({
  isFree,
  onSettingsClick,
  onSignOut,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t("dashboard_header_title")}
        </h1>
        <span className="rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide shadow-sm">
          {isFree ? t("dashboard_header_free") : t("dashboard_header_pro")}
        </span>
      </div>
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto">
        <button
          onClick={onSettingsClick}
          className="p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <ThemeToggleButton />
        <LanguageToggleButton />
        {isFree ? (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap flex items-center justify-center"
            onClick={goToCheckout}
          >
            {t("dashboard_header_upgrade")}
          </button>
        ) : (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap flex items-center justify-center"
            onClick={goToPortal}
          >
            {t("dashboard_header_manage_billing")}
          </button>
        )}
        <button
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center justify-center"
          onClick={onSignOut}
        >
          {t("dashboard_header_sign_out")}
        </button>
      </div>
    </header>
  );
}
