import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
import { supabase } from "@/lib/supabase";
import type { UploadStatsRow } from "../types";

export function DropsAnalyticsCard({
  profileId,
  days,
}: {
  profileId: string | null;
  days: 7 | 30 | 90;
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<UploadStatsRow>>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase.rpc(
          "get_upload_stats_by_profile",
          { p_profile_id: profileId, p_days: days },
        );

        if (error) {
          console.error(
            "[DropsAnalyticsCard] Error fetching upload stats:",
            error,
          );
          setRows([]);
        } else if (Array.isArray(data)) {
          setRows(data as Array<UploadStatsRow>);
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error("[DropsAnalyticsCard] Unexpected error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId, days]);

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

  // Map back to original structure
  const sortedRows = sortedData.map((r) => ({
    drop_id: r.drop_id,
    drop_label: r.drop_label,
    owner_uploads: r.owner_uploads,
    visitor_uploads: r.visitor_uploads,
    total_uploads: r.total_uploads,
  }));

  if (!profileId) return null;

  return (
    <div className="mt-3" data-testid="drops-analytics-card">
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
      {isExpanded && (
        <>
          {rows.length === 0 && !loading ? (
            <div
              className="rounded-lg bg-teal-50 dark:bg-teal-900/20 p-4 text-center"
              data-testid="drops-analytics-empty"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard_account_analytics_no_submissions")}
              </p>
            </div>
          ) : rows.length === 0 && loading ? (
            // Skeleton loader - only on first load when no data
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center rounded-lg bg-teal-50 dark:bg-teal-900/20 p-3"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-3 pb-0 text-xs font-bold text-gray-700 dark:text-gray-300">
                <button
                  onClick={() => handleSort("label")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
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
                  onClick={() => handleSort("total_uploads")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
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
              {sortedRows.map((r) => (
                <div
                  key={r.drop_id}
                  data-testid={`drops-analytics-row-${r.drop_id}`}
                  className={`flex flex-col gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 p-3 transition-all ${
                    loading
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-teal-100 dark:hover:bg-teal-900/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className="text-gray-900 dark:text-white text-sm font-medium"
                      data-testid="drop-label"
                    >
                      {r.drop_label ?? r.drop_id}
                    </span>
                    <span
                      className="text-gray-700 dark:text-gray-300 font-semibold text-sm"
                      data-testid="drop-total-uploads"
                    >
                      {r.total_uploads}
                    </span>
                  </div>
                  {r.total_uploads > 0 && (
                    <div
                      className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400"
                      data-testid="drop-upload-breakdown"
                    >
                      {r.owner_uploads > 0 && (
                        <span data-testid="drop-owner-uploads">
                          {r.owner_uploads}{" "}
                          {t("dashboard_account_analytics_by_you")}
                        </span>
                      )}
                      {r.visitor_uploads > 0 && (
                        <span data-testid="drop-visitor-uploads">
                          {r.visitor_uploads}{" "}
                          {t("dashboard_account_analytics_by_visitors")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
