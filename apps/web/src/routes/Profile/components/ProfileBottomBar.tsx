import { useTranslation } from "react-i18next";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { ProfileLanguageToggleButton } from "./ProfileLanguageToggleButton";

export function ProfileBottomBar() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-1 py-1.5 sm:py-2.5">
          {/* Language Toggle */}
          <div className="flex items-center gap-0.5">
            <ProfileLanguageToggleButton />
            <span className="hidden sm:inline text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t("language")}
            </span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Theme Toggle */}
          <div className="flex items-center gap-0.5">
            <ThemeToggleButton />
            <span className="hidden sm:inline text-xs text-gray-600 dark:text-gray-400 font-medium">
              {t("theme")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
