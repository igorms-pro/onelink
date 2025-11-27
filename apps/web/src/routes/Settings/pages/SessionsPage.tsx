import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Monitor, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  SessionList,
  SessionsSkeleton,
  LoginHistoryList,
  LoginHistorySkeleton,
} from "./SessionsPage/index";
import { useSessions } from "./SessionsPage/useSessions";
import { formatDate, useFormatRelativeTime } from "./SessionsPage/utils";

export default function SessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useRequireAuth();
  const formatRelativeTime = useFormatRelativeTime();

  const {
    sessions,
    loginHistory,
    loading,
    revokingSessionId,
    loadSessions,
    revokeSession,
    revokeAllOtherSessions,
  } = useSessions();

  useEffect(() => {
    if (!user) return;
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (loading) return;
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
  }, [location.hash, loading]);

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
