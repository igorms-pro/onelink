import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthProvider";
import { Settings } from "lucide-react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAuthenticated = !!user;

  // Fallback if translation fails
  const appTitle = i18n.exists("app_title") ? t("app_title") : "OneLink";

  return (
    <header className="w-full flex items-center justify-between p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
      <div
        className={`mx-auto ${isDashboard ? "max-w-4xl" : ""} w-full flex items-center justify-between`}
      >
        <Link
          to="/"
          className="text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          {appTitle}
        </Link>
        <div className="flex items-center gap-2">
          {isDashboard && isAuthenticated && onSettingsClick && (
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
          {!isDashboard && (
            <>
              <ThemeToggleButton />
              <LanguageToggleButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
