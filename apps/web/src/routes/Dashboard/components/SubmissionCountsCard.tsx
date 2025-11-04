import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CountRow } from "../types";

export function SubmissionCountsCard({
  profileId,
}: {
  profileId: string | null;
}) {
  const [rows, setRows] = useState<Array<CountRow>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.rpc(
          "get_submission_counts_by_profile",
          { p_profile_id: profileId },
        );
        if (Array.isArray(data)) setRows(data as Array<CountRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);

  if (!profileId) return null;

  if (loading) {
    return (
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No drop submissions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
              Drop
            </th>
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
              Submissions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.drop_id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td className="p-3 text-gray-900 dark:text-white">
                {r.drop_label ?? r.drop_id}
              </td>
              <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                {r.submissions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
