import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DropsAnalyticsHeader({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center mb-3 text-left cursor-pointer"
      aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
      data-testid="drops-analytics-toggle"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t("dashboard_account_analytics_drops")}
      </h3>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
      )}
    </button>
  );
}
