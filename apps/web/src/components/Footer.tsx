import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

interface FooterProps {
  className?: string;
  showBranding?: boolean;
  brandingText?: string;
  variant?: "default" | "transparent";
}

export function Footer({
  className,
  showBranding = false,
  brandingText,
  variant = "default",
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {t("footer_brand_name", { defaultValue: "OneLink" })}
            </span>
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
          </div>
        </div>
        {showBranding && (brandingText || t("footer_powered")) && (
          <div className="mx-auto max-w-5xl px-4 pb-6 text-xs text-gray-500 dark:text-gray-500">
            {brandingText || t("footer_powered")}
          </div>
        )}
      </div>
    </footer>
  );
}
