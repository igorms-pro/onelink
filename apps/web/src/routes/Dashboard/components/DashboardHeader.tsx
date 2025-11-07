import { useTranslation } from "react-i18next";
import { goToCheckout, goToPortal } from "@/lib/billing";

interface DashboardHeaderProps {
  isFree: boolean;
  onSignOut: () => void;
}

export function DashboardHeader({ isFree, onSignOut }: DashboardHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="fixed top-[56px] left-0 right-0 sm:static z-40 bg-gray-50 dark:bg-gray-900 flex flex-row items-center justify-between gap-2 sm:gap-4 px-4 md:px-6 lg:px-8 py-2 sm:py-2 sm:mb-4 sm:pb-4 sm:pt-0 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="text-2xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          {t("dashboard_header_title")}
        </div>
        <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
          {isFree ? t("dashboard_header_free") : t("dashboard_header_pro")}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2 shrink-0">
        {isFree ? (
          <button
            className="rounded-lg bg-gray-900 dark:bg-gray-800 text-white px-4 py-2.5 sm:px-3 sm:py-2 text-sm font-medium hover:opacity-90 transition-all whitespace-nowrap"
            onClick={goToCheckout}
          >
            {t("dashboard_header_upgrade")}
          </button>
        ) : (
          <button
            className="rounded-lg bg-gray-900 dark:bg-gray-800 text-white px-4 py-2.5 sm:px-3 sm:py-2 text-sm font-medium hover:opacity-90 transition-all whitespace-nowrap"
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
