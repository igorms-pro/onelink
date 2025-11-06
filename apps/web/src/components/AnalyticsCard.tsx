import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase"; // Temporarily commented for dummy data

type ClickRow = { link_id: string; clicks: number; label?: string };

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(7);

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
  if (!profileId)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Profile not ready.
      </p>
    );
  if (loading)
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>;
  return (
    <div className="mt-2">
      {/* Toggle buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setDays(7)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            days === 7
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          7 days
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            days === 30
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          30 days
        </button>
        <button
          onClick={() => setDays(90)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            days === 90
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          90 days
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="space-y-2 pb-3">
          <div className="flex justify-between items-center px-3 pb-0 mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Link</span>
            <span>Clicks</span>
          </div>
          {rows.length === 0 ? (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No clicks yet
            </div>
          ) : (
            rows.map((r) => (
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
