import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Session, LoginHistory } from "./types";

export function useSessions() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const loadSessions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockSessions: Session[] = [
        {
          id: "current",
          device: { os: "macOS", browser: "Chrome" },
          location: { ip: "192.168.1.1", city: "San Francisco", country: "US" },
          lastActivity: new Date().toISOString(),
          isCurrent: true,
        },
        {
          id: "session-2",
          device: { os: "iOS", browser: "Safari" },
          location: { ip: "10.0.0.1", city: "New York", country: "US" },
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false,
        },
      ];
      setSessions(mockSessions);

      const mockHistory: LoginHistory[] = [
        {
          id: "hist-1",
          date: new Date().toISOString(),
          status: "success",
          ip: "192.168.1.1",
          device: "Chrome on macOS",
        },
        {
          id: "hist-2",
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "success",
          ip: "10.0.0.1",
          device: "Safari on iOS",
        },
        {
          id: "hist-3",
          date: new Date(Date.now() - 172800000).toISOString(),
          status: "failed",
          ip: "203.0.113.1",
          device: "Unknown",
        },
      ];
      setLoginHistory(mockHistory);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error(t("sessions_load_error"));
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (sessionId === "current") {
      toast.error(t("sessions_cannot_revoke_current"));
      return;
    }

    setRevokingSessionId(sessionId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success(t("sessions_revoked_success"));
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error(t("sessions_revoke_error"));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm(t("sessions_revoke_all_confirm"))) return;

    setRevokingSessionId("all");
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success(t("sessions_revoked_all_success"));
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
