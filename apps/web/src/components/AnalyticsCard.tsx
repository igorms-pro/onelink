import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ClickRow = { link_id: string; clicks: number; label?: string };

export function AnalyticsCard({ profileId }: { profileId: string | null }) {
  const [rows, setRows] = useState<Array<ClickRow>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.rpc("get_clicks_by_profile", { profile_id: profileId, days: 7 });
        if (Array.isArray(data)) setRows(data as Array<ClickRow>);
        else setRows([]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);
  if (!profileId) return <p className="text-sm text-gray-600">Profile not ready.</p>;
  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Link</th>
            <th className="text-left p-2">Clicks (7d)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.link_id} className="border-t">
              <td className="p-2">{r.label ?? r.link_id}</td>
              <td className="p-2">{r.clicks}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="border-t"><td className="p-2" colSpan={2}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


