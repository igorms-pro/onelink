import { useTranslation } from "react-i18next";
import { Monitor, MapPin, Clock, LogOut } from "lucide-react";
import { CurrentSessionBadge } from "./CurrentSessionBadge";

export type Session = {
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

interface SessionCardProps {
  session: Session;
  isRevoking: boolean;
  onRevoke: (sessionId: string) => void;
  formatRelativeTime: (dateString: string) => string;
}

export function SessionCard({
  session,
  isRevoking,
  onRevoke,
  formatRelativeTime,
}: SessionCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {session.device.browser} on {session.device.os}
              </p>
              {session.isCurrent && <CurrentSessionBadge />}
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
              <span>{formatRelativeTime(session.lastActivity)}</span>
            </div>
          </div>
        </div>
        {!session.isCurrent && (
          <button
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className="ml-4 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            {isRevoking ? t("sessions_revoking") : t("sessions_revoke")}
          </button>
        )}
      </div>
    </div>
  );
}
