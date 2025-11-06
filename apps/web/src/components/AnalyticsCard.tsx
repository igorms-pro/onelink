import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ClickRow = { link_id: string; clicks: number; label?: string };

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<7 | 30>(7);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
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
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setDays(7)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            days === 7
              ? "bg-gray-900 dark:bg-gray-700 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          7 days
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            days === 30
              ? "bg-gray-900 dark:bg-gray-700 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          30 days
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-2/3">
                Link
              </th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300 w-1/3">
                Clicks ({days}d)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                  colSpan={2}
                >
                  No clicks yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.link_id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="p-3 text-gray-900 dark:text-white w-2/3">
                    {r.label ?? r.link_id}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 font-medium text-right w-1/3">
                    {r.clicks}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
