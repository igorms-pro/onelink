import { Check } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { PlanType } from "@/lib/types/plan";
import type { PlanTier } from "@/lib/billing";

interface PricingPlanCardProps {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  cta: string;
  features: string[];
  highlight: boolean;
  planTier: PlanTier | null;
  billingPeriod: "monthly" | "yearly";
  loadingPlan: string | null;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  onClick: () => void;
  onButtonClick: () => void;
}

export function PricingPlanCard({
  id,
  name,
  priceMonthly,
  priceYearly,
  description,
  cta,
  features,
  highlight,
  planTier,
  billingPeriod,
  loadingPlan,
  isSelected = false,
  isCurrentPlan = false,
  onClick,
  onButtonClick,
}: PricingPlanCardProps) {
  const { t } = useTranslation();

  const getPrice = () => {
    if (id === PlanType.FREE) return priceMonthly || "$0";
    return billingPeriod === "yearly" ? priceYearly : priceMonthly;
  };

  const getPriceLabel = () => {
    if (id === PlanType.FREE) return "";
    return billingPeriod === "yearly"
      ? t("pricing.per_year")
      : t("pricing.per_month");
  };

  const price = getPrice();
  const priceLabel = getPriceLabel();

  return (
    <div
      onClick={!isCurrentPlan ? onClick : undefined}
      className={clsx(
        "relative flex h-full flex-col rounded-2xl border p-8 shadow-sm transition",
        isCurrentPlan
          ? "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 cursor-default"
          : isSelected
            ? "border-purple-600 ring-2 ring-purple-500 ring-offset-2 bg-purple-50/50 dark:bg-purple-900/20 hover:shadow-lg cursor-pointer"
            : highlight
              ? "border-purple-500 bg-white dark:bg-gray-900 hover:shadow-lg cursor-pointer"
              : "border-gray-200 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80 hover:shadow-lg cursor-pointer",
      )}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          {t("pricing.most_popular")}
        </span>
      )}
      <div className="space-y-4 pb-6">
        <div className="space-y-2">
          <span className="text-sm font-medium uppercase tracking-wide text-purple-600 dark:text-purple-300">
            {name}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {price}
            </span>
            {priceLabel && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {priceLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCurrentPlan) {
              onButtonClick();
            }
          }}
          disabled={
            loadingPlan === planTier ||
            !planTier ||
            !isSelected ||
            isCurrentPlan
          }
          data-testid={`pricing-plan-${id}-button`}
          className={clsx(
            "w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all",
            isCurrentPlan
              ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              : !isSelected
                ? "opacity-50 cursor-not-allowed"
                : highlight
                  ? "bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-60 cursor-pointer"
                  : id === PlanType.FREE
                    ? "border border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:text-gray-100 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10 cursor-pointer"
                    : "border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-400/60 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20 disabled:opacity-60 cursor-pointer",
          )}
        >
          {isCurrentPlan
            ? t("pricing.current_plan", { defaultValue: "Your current plan" })
            : loadingPlan === planTier
              ? t("pricing.loading")
              : cta}
        </button>
      </div>
      <div className="mt-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("pricing.includes")}
        </p>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
            >
              <span className="mt-0.5 rounded-full bg-purple-500/10 p-1 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
