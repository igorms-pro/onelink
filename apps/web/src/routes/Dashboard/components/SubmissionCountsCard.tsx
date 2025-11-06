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
      <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No drop submissions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center px-3 pb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <span>Drop</span>
        <span>Submissions</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.drop_id}
          className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-gray-800 p-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
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
  );
}
