import { useTranslation } from "react-i18next";
import type { TabId } from "../types";

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  unreadCount: number;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  unreadCount,
}: TabNavigationProps) {
  const { t } = useTranslation();
  return (
    <div className="hidden sm:flex sm:sticky sm:z-30 bg-white dark:bg-gray-900 justify-start gap-2 mb-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto shrink-0">
      <button
        onClick={() => onTabChange("inbox")}
        className={`
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap cursor-pointer
          ${
            activeTab === "inbox"
              ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
        `}
      >
        {t("dashboard_tab_inbox")}
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2 py-0.5 shadow-sm font-medium">
            {unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange("content")}
        className={`
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap cursor-pointer
          ${
            activeTab === "content"
              ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
        `}
      >
        {t("dashboard_tab_content")}
      </button>
      <button
        onClick={() => onTabChange("account")}
        className={`
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap cursor-pointer
          ${
            activeTab === "account"
              ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
        `}
      >
        {t("dashboard_tab_account")}
      </button>
    </div>
  );
}
