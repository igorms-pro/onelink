import { useEffect, useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
// import { supabase } from "../lib/supabase"; // Temporarily commented for dummy data

type ClickRow = { link_id: string; clicks: number; label?: string };
type SortField = "label" | "clicks";
type SortDirection = "asc" | "desc";

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [sortField, setSortField] = useState<SortField>("clicks");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  // Sort rows based on current sort field and direction
  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortField === "label") {
        const labelA = (a.label ?? a.link_id).toLowerCase();
        const labelB = (b.label ?? b.link_id).toLowerCase();
        return sortDirection === "asc"
          ? labelA.localeCompare(labelB)
          : labelB.localeCompare(labelA);
      } else {
        // Sort by clicks
        return sortDirection === "asc"
          ? a.clicks - b.clicks
          : b.clicks - a.clicks;
      }
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc for clicks, asc for label
      setSortField(field);
      setSortDirection(field === "clicks" ? "desc" : "asc");
    }
  };

  if (!profileId)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Profile not ready.
      </p>
    );

  return (
    <div className="mt-2">
      {/* Toggle buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
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
      <div className="overflow-x-auto">
        <div className="space-y-2 pb-3">
          <div className="flex justify-between items-center px-3 pb-0 mt-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <button
              onClick={() => handleSort("label")}
              className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Link</span>
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
              <span>Clicks</span>
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
    </div>
  );
}
