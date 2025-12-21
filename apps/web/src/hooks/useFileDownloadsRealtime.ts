import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { DownloadRow } from "@/routes/Dashboard/types";

interface UseFileDownloadsRealtimeProps {
  profileId: string | null;
  setDownloads: React.Dispatch<React.SetStateAction<DownloadRow[]>>;
}

/**
 * Hook to subscribe to realtime INSERT events on file_downloads table
 * Filters by profile_id and updates the downloads list automatically
 * Shows toast notifications for new downloads
 */
export function useFileDownloadsRealtime({
  profileId,
  setDownloads,
}: UseFileDownloadsRealtimeProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Don't subscribe if no profileId
    if (!profileId) {
      return;
    }

    // Create a channel for realtime subscriptions
    const channel = supabase
      .channel(`file_downloads:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "file_downloads",
        },
        async (
          payload: RealtimePostgresInsertPayload<Record<string, unknown>>,
        ) => {
          const newDownload = payload.new;

          // Check if this download belongs to our profile
          // We need to query the submission -> drop -> profile chain
          const { data: submissionData, error: submissionError } =
            await supabase
              .from("submissions")
              .select("id, drop_id, name, email, created_at, deleted_at")
              .eq("id", newDownload.submission_id)
              .single();

          if (submissionError || !submissionData || submissionData.deleted_at) {
            // Submission doesn't exist or is deleted, ignore
            return;
          }

          // Get drop and profile info
          const { data: dropData, error: dropError } = await supabase
            .from("drops")
            .select("id, profile_id, label")
            .eq("id", submissionData.drop_id)
            .single();

          if (dropError || !dropData) {
            console.error("Error fetching drop for download:", dropError);
            return;
          }

          // Only process if this download belongs to our profile
          if (dropData.profile_id !== profileId) {
            return;
          }

          // Check if this is the owner's own download (exclude)
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("id", profileId)
            .single();

          if (profileData && newDownload.user_id === profileData.user_id) {
            // Owner's own download, ignore
            return;
          }

          // Fetch the full downloads data using the RPC function
          // This ensures we get the same format as the initial load
          const { data: downloadsData, error: downloadsError } =
            await supabase.rpc("get_downloads_by_profile", {
              p_profile_id: profileId,
            });

          if (downloadsError) {
            console.error("Error fetching downloads:", downloadsError);
            return;
          }

          // Update downloads state with the fresh data
          setDownloads(
            Array.isArray(downloadsData)
              ? (downloadsData as DownloadRow[])
              : [],
          );

          // Show toast notification
          const filePath =
            typeof newDownload.file_path === "string"
              ? newDownload.file_path
              : "";
          const fileName = filePath.split("/").pop() || "file";
          const dropLabel = dropData.label || "Drop";
          toast.success(`File downloaded from ${dropLabel}`, {
            description: fileName,
            duration: 5000,
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            "[useFileDownloadsRealtime] Subscribed to file_downloads",
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error("[useFileDownloadsRealtime] Channel error");
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe when component unmounts or profileId changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profileId, setDownloads]);
}
