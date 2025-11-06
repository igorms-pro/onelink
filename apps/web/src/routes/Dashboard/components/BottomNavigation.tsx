import { useTranslation } from "react-i18next";
import { Inbox, Link2, User } from "lucide-react";
import type { TabId } from "../types";

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  submissionCount: number;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  submissionCount,
}: BottomNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sm:hidden">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => onTabChange("inbox")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all rounded-t-lg ${
            activeTab === "inbox"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {submissionCount > 0 && activeTab !== "inbox" && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700"></span>
            )}
          </div>
          <span className="text-xs font-medium">
            {t("dashboard_tab_inbox")}
          </span>
        </button>

        <button
          onClick={() => onTabChange("content")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all rounded-t-lg ${
            activeTab === "content"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Link2 className="w-5 h-5" />
          <span className="text-xs font-medium">
            {t("dashboard_tab_content")}
          </span>
        </button>

        <button
          onClick={() => onTabChange("account")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all rounded-t-lg ${
            activeTab === "account"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">
            {t("dashboard_tab_account")}
          </span>
        </button>
      </div>
    </nav>
  );
}
