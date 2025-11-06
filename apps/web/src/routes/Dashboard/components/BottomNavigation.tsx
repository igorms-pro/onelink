import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Inbox, Link2, User, Trash2 } from "lucide-react";
import type { TabId } from "../types";

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  submissionCount: number;
  onClearAll?: () => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  submissionCount,
  onClearAll,
}: BottomNavigationProps) {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sm:hidden">
      {/* Clear all button for Inbox */}
      {activeTab === "inbox" && submissionCount > 0 && onClearAll && (
        <div className="absolute -top-12 right-4">
          <button
            onClick={onClearAll}
            className={`p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all shadow-md ${
              isScrolled ? "opacity-40" : "opacity-100"
            }`}
            aria-label="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-around h-14">
        <button
          onClick={() => onTabChange("inbox")}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
        >
          <div className="relative">
            <Inbox
              className={`w-5 h-5 transition-colors ${
                activeTab === "inbox"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
            {submissionCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-purple-600 text-white text-[9px] font-semibold flex items-center justify-center px-1">
                {submissionCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === "inbox"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("dashboard_tab_inbox")}
          </span>
        </button>

        <button
          onClick={() => onTabChange("content")}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
        >
          <Link2
            className={`w-5 h-5 transition-colors ${
              activeTab === "content"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === "content"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("dashboard_tab_content")}
          </span>
        </button>

        <button
          onClick={() => onTabChange("account")}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
        >
          <User
            className={`w-5 h-5 transition-colors ${
              activeTab === "account"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === "account"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("dashboard_tab_account")}
          </span>
        </button>
      </div>
    </nav>
  );
}
