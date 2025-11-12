import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  LogOut,
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { toast } from "sonner";

// Types for sessions (will be replaced with real API types later)
type Session = {
  id: string;
  device: {
    os: string;
    browser: string;
  };
  location: {
    ip: string;
    city?: string;
    country?: string;
  };
  lastActivity: string;
  isCurrent: boolean;
};

type LoginHistory = {
  id: string;
  date: string;
  status: "success" | "failed";
  ip: string;
  device: string;
};

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
      // const { data } = await supabase.rpc("get_user_sessions", { user_id: user.id });

      // Mock data for now
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
      // TODO: Replace with actual API call
      // await supabase.rpc("revoke_session", { session_id: sessionId });

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
      // TODO: Replace with actual API call
      // await supabase.rpc("revoke_all_other_sessions", { user_id: user.id });

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
    return null; // Will redirect via useEffect
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t("sessions_active_sessions")}
            </h2>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button
                onClick={revokeAllOtherSessions}
                disabled={revokingSessionId === "all"}
                className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {revokingSessionId === "all"
                  ? t("sessions_revoking")
                  : t("sessions_revoke_all_other")}
              </button>
            )}
          </div>

          {loading ? (
            <SessionsSkeleton />
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("sessions_no_sessions")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.device.browser} on {session.device.os}
                          </p>
                          {session.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1">
                              {t("sessions_current_session")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-8">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {session.location.city
                              ? `${session.location.city}, ${session.location.country}`
                              : session.location.country || session.location.ip}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatRelativeTime(session.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        disabled={revokingSessionId === session.id}
                        className="ml-4 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium flex items-center gap-1"
                      >
                        <LogOut className="w-4 h-4" />
                        {revokingSessionId === session.id
                          ? t("sessions_revoking")
                          : t("sessions_revoke")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("sessions_no_history")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {entry.status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.device} • {entry.ip}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      entry.status === "success"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {entry.status === "success"
                      ? t("sessions_status_success")
                      : t("sessions_status_failed")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SessionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex gap-4 ml-8">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 animate-pulse"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}
