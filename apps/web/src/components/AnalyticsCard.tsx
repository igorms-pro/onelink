import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
// import { supabase } from "../lib/supabase"; // Temporarily commented for dummy data

type ClickRow = { link_id: string; clicks: number; label?: string };

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);

    // Dummy data for testing
    const dummyData: ClickRow[] = [
      { link_id: "1", label: "Portfolio", clicks: 45 },
      { link_id: "2", label: "GitHub", clicks: 32 },
      { link_id: "3", label: "LinkedIn", clicks: 28 },
      { link_id: "4", label: "Twitter", clicks: 15 },
      { link_id: "5", label: "Blog", clicks: 8 },
    ];

    setTimeout(() => {
      setRows(dummyData);
      setLoading(false);
    }, 300);

    // Real API call (commented out for now)
    /*
    (async () => {
      try {
        const { data } = await supabase.rpc("get_clicks_by_profile", {
          profile_id: profileId,
          days,
        });
        if (Array.isArray(data)) setRows(data as Array<ClickRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
    */
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
        Profile not ready.
      </p>
    );

  return (
    <div className="mt-2">
      {isExpanded && (
        <>
          {/* Toggle buttons - Above title */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setDays(7)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                days === 7
                  ? "bg-gray-900 dark:bg-gray-700 text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {loading && days === 7 ? "..." : "7 days"}
            </button>
            <button
              onClick={() => setDays(30)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                days === 30
                  ? "bg-gray-900 dark:bg-gray-700 text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {loading && days === 30 ? "..." : "30 days"}
            </button>
            <button
              onClick={() => setDays(90)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                days === 90
                  ? "bg-gray-900 dark:bg-gray-700 text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {loading && days === 90 ? "..." : "90 days"}
            </button>
          </div>
        </>
      )}
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 text-left"
        aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
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
              {sortedRows.length === 0 ? (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No clicks yet
                </div>
              ) : (
                sortedRows.map((r) => (
                  <div
                    key={r.link_id}
                    className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-gray-800 p-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white text-sm">
                      {r.label ?? r.link_id}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
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
