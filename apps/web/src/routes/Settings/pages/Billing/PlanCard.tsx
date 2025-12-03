import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import { UsageProgressBar } from "./UsageProgressBar";

interface PlanCardProps {
  planDisplayName: string;
  planPrice: string;
  hasPaidPlan: boolean;
  renewalDate: string;
  linksUsed: number;
  linksLimit: number;
  dropsUsed: number;
  dropsLimit: number;
}

export function PlanCard({
  planDisplayName,
  planPrice,
  hasPaidPlan,
  renewalDate,
  linksUsed,
  linksLimit,
  dropsUsed,
  dropsLimit,
}: PlanCardProps) {
  const { t } = useTranslation();

  const linksUsagePercent =
    linksLimit === Infinity ? 0 : Math.min((linksUsed / linksLimit) * 100, 100);
  const dropsUsagePercent =
    dropsLimit === Infinity ? 0 : Math.min((dropsUsed / dropsLimit) * 100, 100);

  return (
    <section
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
      data-testid="plan-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2
          className="text-xl font-semibold text-gray-900 dark:text-white"
          data-testid="plan-card-title"
        >
          {t("billing_current_plan")}
        </h2>
      </div>
      <div className="space-y-4 pl-7">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_current_plan")}
          </span>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-semibold text-gray-900 dark:text-white"
              data-testid="plan-price"
            >
              {planPrice}
              {hasPaidPlan && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                  /{t("billing_month", { defaultValue: "month" })}
                </span>
              )}
            </span>
            <span
              data-testid="plan-badge"
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasPaidPlan
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {planDisplayName}
            </span>
          </div>
        </div>

        {hasPaidPlan && (
          <div
            className="flex items-center justify-between text-sm"
            data-testid="renewal-date-row"
          >
            <span className="text-gray-700 dark:text-gray-300">
              {t("settings_renewal_date")}
            </span>
            <span
              className="text-gray-500 dark:text-gray-400"
              data-testid="renewal-date"
            >
              {renewalDate}
            </span>
          </div>
        )}

        {/* Usage Progress Bars - only for limited plans */}
        {linksLimit !== Infinity && (
          <div className="space-y-4 pt-2">
            <UsageProgressBar
              label={t("billing_links_usage")}
              used={linksUsed}
              limit={linksLimit}
              unit={t("billing_links")}
              percent={linksUsagePercent}
            />
            <UsageProgressBar
              label={t("billing_drops_usage")}
              used={dropsUsed}
              limit={dropsLimit}
              unit={t("billing_drops")}
              percent={dropsUsagePercent}
            />
          </div>
        )}

        {/* Unlimited plan info */}
        {linksLimit === Infinity && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("billing_pro_limits")}
          </div>
        )}
      </div>
    </section>
  );
}
