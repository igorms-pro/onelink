import { Check } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { trackSignUpClick, trackCTAClick } from "@/lib/analytics";

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
      className={clsx(
        "relative flex h-full flex-col rounded-2xl border p-8 shadow-sm transition-all",
        highlight
          ? "border-purple-500 bg-white dark:bg-gray-900 ring-2 ring-purple-500 ring-offset-2 hover:shadow-lg"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg",
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
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        <a
          href={ctaUrl}
          target={ctaUrl.startsWith("http") ? "_blank" : undefined}
          rel={ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          onClick={() => {
            if (ctaUrl.includes("/auth")) {
              trackSignUpClick("pricing");
            } else if (ctaUrl.includes("/pricing")) {
              trackCTAClick("upgrade", "pricing");
            }
          }}
          className={clsx(
            "flex w-full rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-md transition-all cursor-pointer min-h-[44px] items-center justify-center",
            highlight
              ? "bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
              : "border border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10",
          )}
        >
          {cta}
        </a>
      </div>
      <div className="mt-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("pricing.includes")}
        </p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li
              key={index}
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
