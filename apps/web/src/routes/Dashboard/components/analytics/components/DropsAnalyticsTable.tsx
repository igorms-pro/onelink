import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
import type { DropAnalyticsRow } from "../../../types";
import { DropsAnalyticsRow } from "./DropsAnalyticsRow";

export function DropsAnalyticsTable({
  rows,
  loading,
}: {
  rows: Array<DropAnalyticsRow>;
  loading: boolean;
}) {
  const { t } = useTranslation();

  // Map drop_label to label for sorting compatibility
  const mappedRows = rows.map((r) => ({
    ...r,
    label: r.drop_label ?? r.drop_id,
  }));

  // Use sortable data hook
  const { sortedData, sortField, sortDirection, handleSort } = useSortableData({
    data: mappedRows,
    defaultSortField: "total_uploads",
    defaultSortDirection: "desc",
  });

  // Map back to original structure with views
  const sortedRows = sortedData.map((r) => ({
    drop_id: r.drop_id,
    drop_label: r.drop_label,
    owner_uploads: r.owner_uploads,
    visitor_uploads: r.visitor_uploads,
    total_uploads: r.total_uploads,
    views: r.views ?? 0,
  }));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 items-center px-3 pb-0 text-xs font-bold text-gray-700 dark:text-gray-300">
        <button
          onClick={() => handleSort("label")}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-left"
        >
          <span>{t("dashboard_account_analytics_name")}</span>
          {sortField === "label" &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
        <button
          onClick={() => handleSort("views")}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer justify-end"
        >
          <span>{t("dashboard_account_analytics_views")}</span>
          {sortField === "views" &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
        <button
          onClick={() => handleSort("total_uploads")}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer justify-end"
        >
          <span>{t("dashboard_account_analytics_submissions")}</span>
          {sortField === "total_uploads" &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
      </div>
      {sortedRows.map((row) => (
        <DropsAnalyticsRow key={row.drop_id} row={row} loading={loading} />
      ))}
    </div>
  );
}
