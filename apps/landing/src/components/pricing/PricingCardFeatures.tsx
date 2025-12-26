import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PricingCardFeaturesProps {
  features: string[];
}

export function PricingCardFeatures({ features }: PricingCardFeaturesProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-auto space-y-3">
      <p className="text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t("pricing.includes")}
      </p>
      <ul className="space-y-2 md:space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm md:text-base text-gray-600 dark:text-gray-300"
          >
            <span className="mt-0.5 rounded-full bg-purple-500/10 p-1 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
