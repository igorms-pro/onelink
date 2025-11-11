import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
// import { supabase } from "../lib/supabase"; // Temporarily commented for dummy data

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
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!profileId) return;

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
        {t("dashboard_account_analytics_profile_not_ready")}
      </p>
    );

  return (
    <div className="mt-2">
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center mb-3 text-left cursor-pointer"
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
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {t("dashboard_account_analytics_no_clicks")}
                </div>
              ) : (
                sortedRows.map((r) => (
                  <div
                    key={r.link_id}
                    className="flex justify-between items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
