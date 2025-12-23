import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import type { Session, DatabaseSession } from "./types";

export function useSessions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const loadSessions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, clean up duplicate sessions (keep only latest per device/browser)
      // This runs automatically to prevent showing duplicates
      // Wrap in try-catch to handle if function doesn't exist yet
      try {
        const { error: cleanupError } = await supabase.rpc(
          "cleanup_my_duplicate_sessions",
          {},
        );
        if (cleanupError) {
          // Don't fail if cleanup fails - just log it (function might not exist yet)
          console.warn("Failed to cleanup duplicate sessions:", cleanupError);
        }
      } catch (cleanupErr) {
        // Function might not exist yet - that's okay, just continue
        console.warn("Cleanup function not available:", cleanupErr);
      }

      // Load sessions from database
      const { data: sessionsData, error: sessionsError } = await supabase.rpc(
        "get_user_sessions",
        { p_user_id: user.id },
      );

      if (sessionsError) {
        console.error("Error loading sessions:", sessionsError);
        toast.error(t("sessions_load_error"));
        setSessions([]);
      } else {
        // Map database results to Session type
        const mappedSessions: Session[] = (
          (sessionsData as DatabaseSession[]) || []
        ).map((s) => ({
          id: s.id,
          device: {
            os: s.device_os || "Unknown",
            browser: s.device_browser || "Unknown",
          },
          location: {
            ip: s.ip_address || "Unknown",
            city: s.city || undefined,
            country: s.country || undefined,
          },
          lastActivity: s.last_activity || s.created_at,
          isCurrent: s.is_current || false,
        }));
        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error(t("sessions_load_error"));
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!user?.id) return;

    // Check if it's the current session
    const session = sessions.find((s) => s.id === sessionId);
    if (session?.isCurrent) {
      toast.error(t("sessions_cannot_revoke_current"));
      return;
    }

    setRevokingSessionId(sessionId);
    try {
      const { error } = await supabase.rpc("revoke_session", {
        p_session_id: sessionId,
      });

      if (error) {
        console.error("Error revoking session:", error);
        toast.error(t("sessions_revoke_error"));
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success(t("sessions_revoked_success"));
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error(t("sessions_revoke_error"));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!user?.id) return;

    if (!confirm(t("sessions_revoke_all_confirm"))) return;

    setRevokingSessionId("all");
    try {
      const { error } = await supabase.rpc("revoke_all_other_sessions", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error revoking all sessions:", error);
        toast.error(t("sessions_revoke_all_error"));
      } else {
        // Reload sessions to get updated list
        await loadSessions();
        toast.success(t("sessions_revoked_all_success"));
      }
    } catch (error) {
      console.error("Error revoking all sessions:", error);
      toast.error(t("sessions_revoke_all_error"));
    } finally {
      setRevokingSessionId(null);
    }
  };

  return {
    sessions,
    loading,
    revokingSessionId,
    loadSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
}
