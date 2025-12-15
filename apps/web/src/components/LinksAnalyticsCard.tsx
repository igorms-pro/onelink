import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
import { supabase } from "@/lib/supabase";

type ClickRow = { link_id: string; clicks: number; label?: string };

export function LinksAnalyticsCard({
  profileId,
  days,
}: {
  profileId: string | null;
  days: 7 | 30 | 90;
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_clicks_by_profile", {
          p_profile_id: profileId,
          p_days: days,
        });

        if (error) {
          console.error("[LinksAnalyticsCard] Error fetching clicks:", error);
          setRows([]);
        } else if (Array.isArray(data)) {
          setRows(data as Array<ClickRow>);
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error("[LinksAnalyticsCard] Unexpected error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId, days]);

  // Use sortable data hook
  const {
    sortedData: sortedRows,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData({
    data: rows,
    defaultSortField: "clicks",
    defaultSortDirection: "desc",
  });

  if (!profileId)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("dashboard_account_analytics_profile_not_ready")}
      </p>
    );

  return (
    <div className="mt-2" data-testid="links-analytics-card">
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center mb-3 text-left cursor-pointer"
        aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
        data-testid="links-analytics-toggle"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("dashboard_account_analytics_links")}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 ml-2" />
        )}
      </button>
      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <div className="space-y-2 pb-3">
              <div className="flex justify-between items-center px-3 pb-0 mt-2 text-xs font-bold text-gray-700 dark:text-gray-300">
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
                  onClick={() => handleSort("clicks")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t("dashboard_account_analytics_clicks")}</span>
                  {sortField === "clicks" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </button>
              </div>
              {sortedRows.length === 0 && !loading ? (
                <div
                  className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                  data-testid="links-analytics-empty"
                >
                  {t("dashboard_account_analytics_no_clicks")}
                </div>
              ) : sortedRows.length === 0 && loading ? (
                // Skeleton loader - only on first load when no data
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3"
                    >
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                    </div>
                  ))}
                </>
              ) : (
                sortedRows.map((r) => (
                  <div
                    key={r.link_id}
                    data-testid={`links-analytics-row-${r.link_id}`}
                    className={`flex justify-between items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 transition-all ${
                      loading
                        ? "opacity-50 pointer-events-none"
                        : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    }`}
                  >
                    <span
                      className="text-gray-900 dark:text-white text-sm"
                      data-testid="link-label"
                    >
                      {r.label ?? r.link_id}
                    </span>
                    <span
                      className="text-gray-700 dark:text-gray-300 font-medium text-sm"
                      data-testid="link-clicks"
                    >
                      {r.clicks}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
