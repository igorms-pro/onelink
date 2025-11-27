import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { isPaidPlan, getPlanName } from "@/lib/types/plan";
import type { PlanTypeValue } from "@/lib/types/plan";

interface DashboardSubHeaderProps {
  plan: PlanTypeValue | null;
  onSignOut: () => void;
}

export function DashboardSubHeader({
  plan,
  onSignOut,
}: DashboardSubHeaderProps) {
  const hasPaidPlan = isPaidPlan(plan);
  const planDisplayName = getPlanName(plan);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  const handleManageBilling = () => {
    navigate("/settings/billing");
  };

  return (
    <header className="sticky top-[56px] sm:static z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div className="mx-auto max-w-4xl w-full flex flex-row items-center justify-between gap-2 sm:gap-4 px-4 md:px-6 lg:px-8 py-2 sm:py-4 ">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="text-2xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {t("dashboard_header_title")}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide ${
              hasPaidPlan
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {planDisplayName}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0">
          {!hasPaidPlan ? (
            <button
              className="rounded-lg bg-gray-900 dark:bg-gray-800 text-white px-4 py-2.5 sm:px-3 sm:py-2 text-sm font-medium hover:opacity-90 transition-all whitespace-nowrap cursor-pointer"
              onClick={handleUpgrade}
            >
              {t("dashboard_header_upgrade")}
            </button>
          ) : (
            <button
              className="rounded-lg bg-gray-900 dark:bg-gray-800 text-white px-4 py-2.5 sm:px-3 sm:py-2 text-sm font-medium hover:opacity-90 transition-all whitespace-nowrap cursor-pointer"
              onClick={handleManageBilling}
            >
              {t("dashboard_header_manage_billing")}
            </button>
          )}
          <button
            className="hidden sm:inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
            onClick={onSignOut}
          >
            {t("dashboard_header_sign_out")}
          </button>
        </div>
      </div>
    </header>
  );
}
