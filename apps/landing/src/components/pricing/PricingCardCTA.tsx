import clsx from "clsx";
import { trackSignUpClick, trackCTAClick } from "@/lib/analytics";

interface PricingCardCTAProps {
  cta: string;
  ctaUrl: string;
  highlight: boolean;
  name: string;
}

export function PricingCardCTA({
  cta,
  ctaUrl,
  highlight,
  name,
}: PricingCardCTAProps) {
  return (
    <a
      data-testid={`pricing-card-cta-${name.toLowerCase()}`}
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
        "flex w-full rounded-xl px-4 py-3 md:py-4 text-center text-sm md:text-base font-semibold shadow-md transition-all cursor-pointer min-h-[44px] items-center justify-center",
        highlight
          ? "bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
          : "border border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10",
      )}
    >
      {cta}
    </a>
  );
}
