import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LinksAnalyticsCard } from "./LinksAnalyticsCard";
import { DropsAnalyticsCard } from "@/routes/Dashboard/components/DropsAnalyticsCard";

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const { t } = useTranslation();
  const [days, setDays] = useState<7 | 30 | 90>(7);

  return (
    <>
      {/* Toggle buttons - Above both cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => setDays(7)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            days === 7
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {t("dashboard_account_analytics_days_7")}
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            days === 30
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {t("dashboard_account_analytics_days_30")}
        </button>
        <button
          onClick={() => setDays(90)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            days === 90
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {t("dashboard_account_analytics_days_90")}
        </button>
      </div>
      <LinksAnalyticsCard profileId={profileId} days={days} />
      <DropsAnalyticsCard profileId={profileId} />
    </>
  );
}
