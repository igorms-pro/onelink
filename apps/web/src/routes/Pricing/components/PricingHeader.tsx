import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { BillingPeriod } from "@/lib/billing";

interface PricingHeaderProps {
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function PricingHeader({
  billingPeriod,
  onBillingPeriodChange,
  showBackButton = false,
  onBackClick,
}: PricingHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="relative isolate overflow-hidden bg-linear-to-r from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-linear-to-l from-purple-500/10 to-transparent blur-3xl"></div>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs sm:text-sm md:px-4 md:py-2 md:text-base font-medium text-purple-700 shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            {t("back", { defaultValue: "Back" })}
          </button>
        )}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            {t("pricing.description")}
          </p>

          {/* Billing Period Toggle - Linktree style */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => onBillingPeriodChange("monthly")}
                className={clsx(
                  "px-6 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  billingPeriod === "monthly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {t("pricing.monthly_label")}
              </button>
              <button
                type="button"
                onClick={() => onBillingPeriodChange("yearly")}
                className={clsx(
                  "px-6 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                  billingPeriod === "yearly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {t("pricing.yearly_label", {
                  defaultValue: "Annually (save 20%)",
                })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
