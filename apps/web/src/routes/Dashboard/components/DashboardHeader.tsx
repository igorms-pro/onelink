import { Settings } from "lucide-react";
import { goToCheckout, goToPortal } from "@/lib/billing";

interface DashboardHeaderProps {
  isFree: boolean;
  onSettingsClick: () => void;
  onSignOut: () => void;
}

export function DashboardHeader({
  isFree,
  onSettingsClick,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <span className="rounded-full border border-gray-200/80 dark:border-gray-700/80 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-medium uppercase tracking-wide shadow-sm">
          {isFree ? "Free" : "Pro"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        {isFree ? (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            onClick={goToCheckout}
          >
            Upgrade to Pro
          </button>
        ) : (
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            onClick={goToPortal}
          >
            Manage billing
          </button>
        )}
        <button
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
