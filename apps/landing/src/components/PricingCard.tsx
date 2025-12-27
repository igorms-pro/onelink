import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { PricingCardHeader } from "@/components/pricing/PricingCardHeader";
import { PricingCardCTA } from "@/components/pricing/PricingCardCTA";
import { PricingCardFeatures } from "@/components/pricing/PricingCardFeatures";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  cta: string;
  features: string[];
  highlight?: boolean;
  ctaUrl: string;
}

export function PricingCard({
  name,
  price,
  description,
  cta,
  features,
  highlight = false,
  ctaUrl,
}: PricingCardProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid={`pricing-card-${name.toLowerCase()}`}
      className={clsx(
        "relative flex h-full flex-col rounded-2xl p-8 md:p-10 lg:p-12 shadow-sm transition-all",
        highlight
          ? "border-2 border-purple-500 bg-white dark:bg-gray-900 hover:shadow-lg"
          : "border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg",
      )}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-purple-500 to-purple-600 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-white shadow-lg">
          {t("pricing.most_popular")}
        </span>
      )}
      <div className="space-y-4 pb-6">
        <PricingCardHeader
          name={name}
          price={price}
          description={description}
        />
        <PricingCardCTA
          cta={cta}
          ctaUrl={ctaUrl}
          highlight={highlight}
          name={name}
        />
      </div>
      <PricingCardFeatures features={features} />
    </div>
  );
}
