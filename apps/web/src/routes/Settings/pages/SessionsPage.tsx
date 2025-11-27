import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Monitor, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import {
  SessionList,
  SessionsSkeleton,
  LoginHistoryList,
  LoginHistorySkeleton,
  type Session,
  type LoginHistory,
} from "./components";

export default function SessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const sectionsReady = !loading;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!sectionsReady) return;
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add(
      "ring-2",
      "ring-purple-400",
      "ring-offset-2",
      "dark:ring-purple-500/60",
    );
    const timeout = window.setTimeout(() => {
      el.classList.remove(
        "ring-2",
        "ring-purple-400",
        "ring-offset-2",
        "dark:ring-purple-500/60",
      );
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [location.hash, sectionsReady]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("sessions_just_now");
    if (diffMins < 60) {
      return diffMins === 1
        ? t("sessions_minutes_ago", { count: diffMins })
        : t("sessions_minutes_ago_plural", { count: diffMins });
    }
    if (diffHours < 24) {
      return diffHours === 1
        ? t("sessions_hours_ago", { count: diffHours })
        : t("sessions_hours_ago_plural", { count: diffHours });
    }
    return diffDays === 1
      ? t("sessions_days_ago", { count: diffDays })
      : t("sessions_days_ago_plural", { count: diffDays });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_settings")}
        </button>

        <div className="mb-8">
          <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
            {t("sessions_page_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("sessions_page_description")}
          </p>
        </div>

        {/* Active Sessions Section */}
        <section
          id="active-sessions"
          className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          {loading ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Monitor className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("sessions_active_sessions")}
                </h2>
              </div>
              <SessionsSkeleton />
            </>
          ) : (
            <SessionList
              sessions={sessions}
              revokingSessionId={revokingSessionId}
              onRevoke={revokeSession}
              onRevokeAll={revokeAllOtherSessions}
              formatRelativeTime={formatRelativeTime}
            />
          )}
        </section>

        {/* Login History Section */}
        <section
          id="login-history"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("sessions_login_history")}
          </h2>

          {loading ? (
            <LoginHistorySkeleton />
          ) : (
            <LoginHistoryList history={loginHistory} formatDate={formatDate} />
          )}
        </section>
      </main>
    </div>
  );
}
