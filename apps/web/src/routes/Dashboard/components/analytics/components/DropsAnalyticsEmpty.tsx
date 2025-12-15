import { useTranslation } from "react-i18next";

export function DropsAnalyticsEmpty() {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-lg bg-teal-50 dark:bg-teal-900/20 p-4 text-center"
      data-testid="drops-analytics-empty"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("dashboard_account_analytics_no_submissions")}
      </p>
    </div>
  );
}
