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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {t("pricing.description")}
          </p>

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-5">
            <span
              className={clsx(
                "text-base font-medium",
                billingPeriod === "monthly"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {t("pricing.monthly_label")}
            </span>
            <button
              type="button"
              onClick={() =>
                onBillingPeriodChange(
                  billingPeriod === "monthly" ? "yearly" : "monthly",
                )
              }
              className={clsx(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer",
                billingPeriod === "yearly"
                  ? "bg-purple-600"
                  : "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                  billingPeriod === "yearly"
                    ? "translate-x-8"
                    : "translate-x-1",
                )}
              />
            </button>
            <span
              className={clsx(
                "text-base font-medium",
                billingPeriod === "yearly"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {t("pricing.yearly_label", {
                defaultValue: "Annually (save 20%)",
              })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
