import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { BillingPeriod } from "@/lib/billing";

interface PricingHeaderProps {
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
}

export function PricingHeader({
  billingPeriod,
  onBillingPeriodChange,
}: PricingHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="relative isolate overflow-hidden bg-linear-to-r from-purple-600/15 via-purple-500/10 to-blue-600/15 dark:from-purple-600/25 dark:via-purple-500/15 dark:to-blue-600/25">
      <div className="absolute inset-y-0 right-0 w-1/2 -translate-y-10 bg-linear-to-l from-purple-500/20 to-transparent blur-3xl" />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {t("pricing.description")}
          </p>

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={clsx(
                "text-sm font-medium",
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
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                billingPeriod === "yearly"
                  ? "bg-purple-600"
                  : "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  billingPeriod === "yearly"
                    ? "translate-x-6"
                    : "translate-x-1",
                )}
              />
            </button>
            <span
              className={clsx(
                "text-sm font-medium",
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

          <p className="text-xs text-gray-500 dark:text-gray-500">
            {t("pricing.currency_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
