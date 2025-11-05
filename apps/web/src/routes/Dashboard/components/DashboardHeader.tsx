import { useTranslation } from "react-i18next";
import { goToCheckout, goToPortal } from "@/lib/billing";

interface DashboardHeaderProps {
  isFree: boolean;
  onSignOut: () => void;
}

export function DashboardHeader({ isFree, onSignOut }: DashboardHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t("dashboard_header_title")}
        </h1>
        <span className="rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide shadow-sm">
          {isFree ? t("dashboard_header_free") : t("dashboard_header_pro")}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        {isFree ? (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 text-sm font-semibold hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
            onClick={goToCheckout}
          >
            {t("dashboard_header_upgrade")}
          </button>
        ) : (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 text-sm font-semibold hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
            onClick={goToPortal}
          >
            {t("dashboard_header_manage_billing")}
          </button>
        )}
        <button
          className="hidden sm:inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
          onClick={onSignOut}
        >
          {t("dashboard_header_sign_out")}
        </button>
      </div>
    </header>
  );
}
