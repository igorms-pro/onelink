import { useTranslation } from "react-i18next";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { LoginHistory } from "./types";

interface LoginHistoryListProps {
  history: LoginHistory[];
  formatDate: (dateString: string) => string;
}

export function LoginHistoryList({
  history,
  formatDate,
}: LoginHistoryListProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {t("sessions_no_history")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
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
  );
}

export function LoginHistorySkeleton() {
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
