import { useTranslation } from "react-i18next";
import type { TabId } from "../types";

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  submissionCount: number;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  submissionCount,
}: TabNavigationProps) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center sm:justify-start gap-2 mb-6 border-b border-gray-200/60 dark:border-gray-800/60 overflow-x-auto">
      <button
        onClick={() => onTabChange("inbox")}
        className={`
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
          ${
            activeTab === "inbox"
              ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
        `}
      >
        {t("dashboard_tab_inbox")}
        {submissionCount > 0 && (
          <span className="ml-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2 py-0.5 shadow-sm">
            {submissionCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange("content")}
        className={`
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
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
          relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
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
