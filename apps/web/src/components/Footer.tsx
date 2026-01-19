import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LayoutDashboard } from "lucide-react";
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
  showDashboardLink?: boolean; // Show "Back to Dashboard" link (for profile owner)
}

export function Footer({
  className,
  showBranding = false,
  brandingText,
  variant = "default",
  showControls = false,
  showLegalLinks = true,
  hideBrandName = false,
  showDashboardLink = false,
}: FooterProps) {
  const { t } = useTranslation();

  const containerClasses = clsx(
    "w-full border-t",
    variant === "transparent"
      ? "border-transparent bg-transparent backdrop-blur-0"
      : "border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                      <img
                        src="/onelink-logo-O.png"
                        alt="OneLink"
                        className="w-full h-full object-contain dark:hidden"
                      />
                      <img
                        src="/onelink-logo-white-O.png"
                        alt="OneLink"
                        className="w-full h-full object-contain hidden dark:block"
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
                  <div className="flex items-center gap-1.5 ml-2 sm:hidden">
                    {showDashboardLink && (
                      <>
                        <Link
                          to="/dashboard"
                          className="p-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          aria-label={t("footer_back_to_dashboard", {
                            defaultValue: "Back to Dashboard",
                          })}
                          title={t("footer_back_to_dashboard", {
                            defaultValue: "Back to Dashboard",
                          })}
                        >
                          <LayoutDashboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                      </>
                    )}
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
              <div className="flex items-center justify-center gap-4 flex-wrap">
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
              <div className="hidden sm:flex items-center gap-1.5">
                {showDashboardLink && (
                  <>
                    <Link
                      to="/dashboard"
                      className="p-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      aria-label={t("footer_back_to_dashboard", {
                        defaultValue: "Back to Dashboard",
                      })}
                      title={t("footer_back_to_dashboard", {
                        defaultValue: "Back to Dashboard",
                      })}
                    >
                      <LayoutDashboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                  </>
                )}
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
