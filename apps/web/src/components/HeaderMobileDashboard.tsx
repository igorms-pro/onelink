import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

interface HeaderMobileDashboardProps {
  onSettingsClick?: () => void;
}

export function HeaderMobileDashboard({
  onSettingsClick,
}: HeaderMobileDashboardProps) {
  const { t, i18n } = useTranslation();
  const appTitle = i18n.exists("app_title") ? t("app_title") : "OneLink";

  return (
    <header className="fixed top-0 left-0 right-0 sm:sticky w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50 shadow-sm">
      <div className="mx-auto max-w-4xl w-full flex items-center justify-between p-4 md:p-6 lg:p-8">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          {appTitle}
        </Link>
        <div className="flex items-center gap-2">
          {onSettingsClick && (
            <>
              <ThemeToggleButton />
              <LanguageToggleButton />
              <button
                onClick={onSettingsClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
