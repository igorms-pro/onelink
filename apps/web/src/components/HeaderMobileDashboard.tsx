import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

interface HeaderMobileDashboardProps {
  onSettingsClick?: () => void;
}

export function HeaderMobileDashboard({
  onSettingsClick,
}: HeaderMobileDashboardProps) {
  return (
    <header className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50 shadow-sm shrink-0">
      <div className="mx-auto max-w-4xl w-full flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3">
        <Link
          to="/"
          className="flex items-center min-h-[44px] min-w-[44px] cursor-pointer"
        >
          <img
            src="/onelink-logo.png"
            alt="OneLink"
            className="h-10 sm:h-12 w-auto object-contain dark:hidden"
          />
          <img
            src="/onelink-logo-white.png"
            alt="OneLink"
            className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
          />
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
