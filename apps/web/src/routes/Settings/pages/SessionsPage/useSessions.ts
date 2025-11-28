import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import type {
  Session,
  LoginHistory,
  DatabaseSession,
  DatabaseLoginHistory,
} from "./types";

export function useSessions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
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

      // Load login history
      const { data: historyData, error: historyError } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50); // Limit to last 50 entries

      if (historyError) {
        console.error("Error loading login history:", historyError);
        setLoginHistory([]);
      } else {
        // Map database results to LoginHistory type
        const mappedHistory: LoginHistory[] = (
          (historyData as DatabaseLoginHistory[]) || []
        ).map((h) => ({
          id: h.id,
          date: h.created_at,
          status: h.status,
          ip: h.ip_address || "Unknown",
          device: h.device_info || "Unknown",
        }));
        setLoginHistory(mappedHistory);
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
    loginHistory,
    loading,
    revokingSessionId,
    loadSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
}
