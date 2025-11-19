import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { ProfileLanguageToggleButton } from "@/routes/Profile/components/ProfileLanguageToggleButton";

interface FooterProps {
  className?: string;
  showBranding?: boolean;
  brandingText?: string;
  variant?: "default" | "transparent";
  showControls?: boolean; // Show language/theme toggles (for profile pages)
}

export function Footer({
  className,
  showBranding = false,
  brandingText,
  variant = "default",
  showControls = false,
}: FooterProps) {
  const { t } = useTranslation();
  const year = useMemo(() => new Date().getFullYear(), []);

  const containerClasses = clsx(
    "w-full border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
    variant === "transparent" &&
      "border-transparent bg-transparent backdrop-blur-0",
  );

  return (
    <footer className={clsx("mt-auto w-full", className)}>
      <div className={containerClasses}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:py-6 text-sm text-gray-600 dark:text-gray-400">
          {/* Main footer content */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              {/* Logo + Slogan (replaces brand name) */}
              {showBranding && brandingText ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-0.5 sm:p-1 flex-shrink-0">
                    <img
                      src="/logo.png"
                      alt="OneLink"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                    {brandingText}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {t("footer_brand_name", { defaultValue: "OneLink" })}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {t("footer_all_rights", {
                  year,
                  defaultValue: `© ${year} OneLink. All rights reserved.`,
                })}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/privacy"
                className="text-sm text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300 cursor-pointer"
              >
                {t("footer_privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300 cursor-pointer"
              >
                {t("footer_terms")}
              </Link>
              {/* Language & Theme Controls (for profile pages) */}
              {showControls && (
                <>
                  <div className="hidden sm:block h-4 w-px bg-gray-300 dark:bg-gray-700" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <ProfileLanguageToggleButton />
                      <span className="hidden md:inline text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t("language")}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <ThemeToggleButton />
                      <span className="hidden md:inline text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {t("theme")}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
