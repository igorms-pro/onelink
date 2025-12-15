import { useTranslation } from "react-i18next";
import type { DropAnalyticsRow } from "../../../types";

export function DropsAnalyticsRow({
  row,
  loading,
}: {
  row: DropAnalyticsRow;
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      data-testid={`drops-analytics-row-${row.drop_id}`}
      className={`flex flex-col gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 p-3 transition-all ${
        loading
          ? "opacity-50 pointer-events-none"
          : "hover:bg-teal-100 dark:hover:bg-teal-900/30"
      }`}
    >
      <div className="grid grid-cols-3 gap-2 items-center">
        <span
          className="text-gray-900 dark:text-white text-sm font-medium"
          data-testid="drop-label"
        >
          {row.drop_label ?? row.drop_id}
        </span>
        <span
          className="text-gray-700 dark:text-gray-300 font-semibold text-sm text-right"
          data-testid="drop-views"
        >
          {row.views}
        </span>
        <span
          className="text-gray-700 dark:text-gray-300 font-semibold text-sm text-right"
          data-testid="drop-total-uploads"
        >
          {row.total_uploads}
        </span>
      </div>
      {(row.total_uploads > 0 || row.views > 0) && (
        <div
          className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400"
          data-testid="drop-upload-breakdown"
        >
          {row.owner_uploads > 0 && (
            <span data-testid="drop-owner-uploads">
              {row.owner_uploads} {t("dashboard_account_analytics_by_you")}
            </span>
          )}
          {row.visitor_uploads > 0 && (
            <span data-testid="drop-visitor-uploads">
              {row.visitor_uploads}{" "}
              {t("dashboard_account_analytics_by_visitors")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
