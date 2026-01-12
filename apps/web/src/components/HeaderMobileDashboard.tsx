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
    <header className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50 shadow-sm shrink-0">
      <div className="mx-auto max-w-4xl w-full flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-1.5 sm:p-2">
            <img
              src="/onelink-logo-64.png"
              alt="OneLink"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            {appTitle}
          </span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onSettingsClick && (
            <>
              <div className="scale-100 sm:scale-110">
                <ThemeToggleButton />
              </div>
              <div className="scale-100 sm:scale-110">
                <LanguageToggleButton />
              </div>
              <button
                onClick={onSettingsClick}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center cursor-pointer"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
