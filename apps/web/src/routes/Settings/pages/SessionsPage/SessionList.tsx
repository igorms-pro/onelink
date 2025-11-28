import { useTranslation } from "react-i18next";
import { Monitor } from "lucide-react";
import { SessionCard } from "./SessionCard";
import type { Session } from "./types";

interface SessionListProps {
  sessions: Session[];
  revokingSessionId: string | null;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  formatRelativeTime: (dateString: string) => string;
}

export function SessionList({
  sessions,
  revokingSessionId,
  onRevoke,
  onRevokeAll,
  formatRelativeTime,
}: SessionListProps) {
  const { t } = useTranslation();

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12" data-testid="sessions-empty-state">
        <Monitor className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {t("sessions_no_sessions")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          data-testid="active-sessions-title"
        >
          <Monitor className="w-5 h-5" />
          {t("sessions_active_sessions")}
        </h2>
        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <button
            onClick={onRevokeAll}
            disabled={revokingSessionId === "all"}
            className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            data-testid="revoke-all-sessions-button"
          >
            {revokingSessionId === "all"
              ? t("sessions_revoking")
              : t("sessions_revoke_all_other")}
          </button>
        )}
      </div>
      <div className="space-y-4" data-testid="sessions-list">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isRevoking={revokingSessionId === session.id}
            onRevoke={onRevoke}
            formatRelativeTime={formatRelativeTime}
          />
        ))}
      </div>
    </>
  );
}

export function SessionsSkeleton() {
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
