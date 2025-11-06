import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

export function HeaderMobileSignIn() {
  const { t, i18n } = useTranslation();
  const appTitle = i18n.exists("app_title") ? t("app_title") : "OneLink";

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-md w-full flex items-center justify-between p-4 md:p-6 lg:p-8">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          {appTitle}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LanguageToggleButton />
        </div>
      </div>
    </header>
  );
}
