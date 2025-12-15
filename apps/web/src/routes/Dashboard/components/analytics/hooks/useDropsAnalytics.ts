import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  DropAnalyticsRow,
  UploadStatsRow,
  DropViewsRow,
} from "../../../types";

export function useDropsAnalytics(profileId: string | null, days: 7 | 30 | 90) {
  const [rows, setRows] = useState<Array<DropAnalyticsRow>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    setLoading(true);

    (async () => {
      try {
        // Fetch both upload stats and drop views in parallel
        const [uploadStatsResult, dropViewsResult] = await Promise.all([
          supabase.rpc("get_upload_stats_by_profile", {
            p_profile_id: profileId,
            p_days: days,
          }),
          supabase.rpc("get_drop_views_by_profile", {
            p_profile_id: profileId,
            p_days: days,
          }),
        ]);

        if (uploadStatsResult.error) {
          console.error(
            "[DropsAnalyticsCard] Error fetching upload stats:",
            uploadStatsResult.error,
          );
        }

        if (dropViewsResult.error) {
          console.error(
            "[DropsAnalyticsCard] Error fetching drop views:",
            dropViewsResult.error,
          );
        }

        const uploadStats: Array<UploadStatsRow> = Array.isArray(
          uploadStatsResult.data,
        )
          ? (uploadStatsResult.data as Array<UploadStatsRow>)
          : [];

        const dropViews: Array<DropViewsRow> = Array.isArray(
          dropViewsResult.data,
        )
          ? (dropViewsResult.data as Array<DropViewsRow>)
          : [];

        // Merge data by drop_id
        const viewsMap = new Map(dropViews.map((v) => [v.drop_id, v.views]));

        const mergedRows: Array<DropAnalyticsRow> = uploadStats.map((stat) => ({
          ...stat,
          views: viewsMap.get(stat.drop_id) ?? 0,
        }));

        // Add drops that have views but no submissions
        dropViews.forEach((view) => {
          if (!uploadStats.find((s) => s.drop_id === view.drop_id)) {
            mergedRows.push({
              drop_id: view.drop_id,
              drop_label: view.drop_label,
              owner_uploads: 0,
              visitor_uploads: 0,
              total_uploads: 0,
              views: view.views,
            });
          }
        });

        setRows(mergedRows);
      } catch (err) {
        console.error("[DropsAnalyticsCard] Unexpected error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId, days]);

  return { rows, loading };
}
