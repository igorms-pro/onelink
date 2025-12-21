import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { SubmissionRow } from "@/routes/Dashboard/types";

interface UseSubmissionsRealtimeProps {
  profileId: string | null;
  setSubmissions: React.Dispatch<React.SetStateAction<SubmissionRow[]>>;
}

/**
 * Hook to subscribe to realtime INSERT events on submissions table
 * Filters by profile_id and updates the inbox automatically
 * Shows toast notifications for new submissions
 */
export function useSubmissionsRealtime({
  profileId,
  setSubmissions,
}: UseSubmissionsRealtimeProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Don't subscribe if no profileId
    if (!profileId) {
      return;
    }

    // Create a channel for realtime subscriptions
    const channel = supabase
      .channel(`submissions:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
        },
        async (
          payload: RealtimePostgresInsertPayload<Record<string, unknown>>,
        ) => {
          const newSubmission = payload.new;

          // Check if this submission belongs to our profile
          // We need to query the drop to get the profile_id
          const { data: dropData, error: dropError } = await supabase
            .from("drops")
            .select("id, profile_id, label")
            .eq("id", newSubmission.drop_id)
            .single();

          if (dropError || !dropData) {
            console.error("Error fetching drop for submission:", dropError);
            return;
          }

          // Only process if this submission belongs to our profile
          if (dropData.profile_id !== profileId) {
            return;
          }

          // Fetch the full submission data using the RPC function
          // This ensures we get the same format as the initial load
          const { data: submissionsData, error: submissionsError } =
            await supabase.rpc("get_submissions_by_profile", {
              p_profile_id: profileId,
            });

          if (submissionsError) {
            console.error("Error fetching submissions:", submissionsError);
            return;
          }

          // Update submissions state with the fresh data
          // This ensures we have the latest data including read_at
          setSubmissions(
            Array.isArray(submissionsData)
              ? (submissionsData as SubmissionRow[])
              : [],
          );

          // Show toast notification
          const dropLabel = dropData.label || "Drop";
          toast.success(`New submission in ${dropLabel}`, {
            description: newSubmission.name
              ? `From: ${newSubmission.name}`
              : undefined,
            duration: 5000,
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[useSubmissionsRealtime] Subscribed to submissions");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[useSubmissionsRealtime] Channel error");
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
  }, [profileId, setSubmissions]);
}
