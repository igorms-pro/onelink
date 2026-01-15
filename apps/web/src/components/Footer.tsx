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
  showLegalLinks?: boolean; // Show Privacy/Terms links (default: true)
  hideBrandName?: boolean; // Hide brand name completely (for /auth endpoint)
}

export function Footer({
  className,
  showBranding = false,
  brandingText,
  variant = "default",
  showControls = false,
  showLegalLinks = true,
  hideBrandName = false,
}: FooterProps) {
  const { t } = useTranslation();

  const containerClasses = clsx(
    "w-full border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
    variant === "transparent" &&
      "border-transparent bg-transparent backdrop-blur-0",
  );

  return (
    <footer className={clsx("mt-auto w-full", className)}>
      <div className={containerClasses}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-2 sm:py-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Main footer content */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile: Logo + Slogan + Language/Theme on same line */}
            {/* Desktop: Logo + Slogan on left */}
            {!hideBrandName && (
              <div className="flex justify-between items-center gap-2 sm:gap-4 sm:justify-start">
                {showBranding && brandingText ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-0.5 sm:p-1 shrink-0">
                      <img
                        src="/onelink-logo-64.png"
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
                {/* Language & Theme Controls - same line as slogan on mobile, right side on desktop */}
                {showControls && (
                  <div className="flex items-center gap-2 ml-2 sm:hidden">
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <ProfileLanguageToggleButton />
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <ThemeToggleButton />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Privacy & Terms - separate line on mobile, center on desktop */}
            {showLegalLinks && (
              <div className="flex items-center justify-center gap-4">
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
              </div>
            )}
            {/* Language & Theme Controls - right side on desktop only */}
            {showControls && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-1">
                  <ProfileLanguageToggleButton />
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-1">
                  <ThemeToggleButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
