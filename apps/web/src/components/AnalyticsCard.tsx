import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LinksAnalyticsCard } from "./LinksAnalyticsCard";
import { DropsAnalyticsCard } from "@/routes/Dashboard/components/DropsAnalyticsCard";

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const { t } = useTranslation();
  const [days, setDays] = useState<7 | 30 | 90>(7);

  return (
    <div data-testid="analytics-section">
      {/* Toggle buttons - Above both cards */}
      <div
        className="grid grid-cols-3 gap-2 mb-3"
        data-testid="analytics-time-filters"
      >
        <button
          onClick={() => setDays(7)}
          data-testid="analytics-filter-7"
          className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
            days === 7
              ? "bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-sm"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          {t("dashboard_account_analytics_days_7")}
        </button>
        <button
          onClick={() => setDays(30)}
          data-testid="analytics-filter-30"
          className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
            days === 30
              ? "bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-sm"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          {t("dashboard_account_analytics_days_30")}
        </button>
        <button
          onClick={() => setDays(90)}
          data-testid="analytics-filter-90"
          className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
            days === 90
              ? "bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-sm"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          {t("dashboard_account_analytics_days_90")}
        </button>
      </div>
      <LinksAnalyticsCard profileId={profileId} days={days} />
      <DropsAnalyticsCard profileId={profileId} days={days} />
    </div>
  );
}
