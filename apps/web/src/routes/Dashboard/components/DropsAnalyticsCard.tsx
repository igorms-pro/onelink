import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSortableData } from "@/hooks/useSortableData";
// import { supabase } from "@/lib/supabase"; // Temporarily commented for dummy data
import type { CountRow } from "../types";

export function DropsAnalyticsCard({
  profileId,
  days,
}: {
  profileId: string | null;
  days: 7 | 30 | 90;
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<CountRow>>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    // Set loading to true to show greyed state (even if we have existing data)
    // In production, this simulates fetching new data when days change
    setLoading(true);

    // Dummy data for testing
    const dummyData: CountRow[] = [
      { drop_id: "1", drop_label: "Speaker Request", submissions: 12 },
      { drop_id: "2", drop_label: "Resume Submissions", submissions: 8 },
      { drop_id: "3", drop_label: "Design Files", submissions: 5 },
    ];

    // Simulate API delay - keep existing data visible but greyed
    setTimeout(() => {
      setRows(dummyData);
      setLoading(false);
    }, 500);

    // Real API call (commented out for now)
    // NOTE: The SQL function needs to be updated to accept a days parameter
    // Example SQL update needed:
    // create or replace function public.get_submission_counts_by_profile(p_profile_id uuid, p_days int)
    // returns table (...)
    // as $$
    //   select d.id as drop_id, d.label as drop_label, count(s.id)::int as submissions
    //   from public.drops d
    //   left join public.submissions s on s.drop_id = d.id
    //     and s.created_at >= now() - make_interval(days => p_days)
    //   where d.profile_id = p_profile_id and exists (...)
    //   group by d.id, d.label
    //   order by submissions desc, d.label asc;
    // $$;
    /*
    (async () => {
      try {
        const { data } = await supabase.rpc(
          "get_submission_counts_by_profile",
          { p_profile_id: profileId, p_days: days },
        );
        if (Array.isArray(data)) setRows(data as Array<CountRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
    */
  }, [profileId, days]);

  // Map drop_label to label for sorting compatibility
  const mappedRows = rows.map((r) => ({
    ...r,
    label: r.drop_label ?? r.drop_id,
  }));

  // Use sortable data hook
  const { sortedData, sortField, sortDirection, handleSort } = useSortableData({
    data: mappedRows,
    defaultSortField: "submissions",
    defaultSortDirection: "desc",
  });

  // Map back to original structure
  const sortedRows = sortedData.map((r) => ({
    drop_id: r.drop_id,
    drop_label: r.drop_label,
    submissions: r.submissions,
  }));

  if (!profileId) return null;

  return (
    <div className="mt-3">
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center mb-3 text-left cursor-pointer"
        aria-label={isExpanded ? t("common_collapse") : t("common_expand")}
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
            <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 p-4 text-center">
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
                  onClick={() => handleSort("submissions")}
                  className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t("dashboard_account_analytics_submissions")}</span>
                  {sortField === "submissions" &&
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
                  className={`flex justify-between items-center rounded-lg bg-teal-50 dark:bg-teal-900/20 p-3 transition-all ${
                    loading
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-teal-100 dark:hover:bg-teal-900/30"
                  }`}
                >
                  <span className="text-gray-900 dark:text-white text-sm">
                    {r.drop_label ?? r.drop_id}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    {r.submissions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
