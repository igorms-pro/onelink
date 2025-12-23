import { useTranslation } from "react-i18next";
import { PricingCard } from "@/components/PricingCard";

export function PricingSection() {
  const { t } = useTranslation();

  const freePlan = {
    name: t("landing.pricing.free.name"),
    price: t("landing.pricing.free.price"),
    description: t("landing.pricing.free.description"),
    cta: t("landing.pricing.free.cta"),
    features: t("landing.pricing.free.features", { returnObjects: true }) as string[],
    ctaUrl: "https://app.getonelink.io/auth",
  };

  const proPlan = {
    name: t("landing.pricing.pro.name"),
    price: t("landing.pricing.pro.price"),
    description: t("landing.pricing.pro.description"),
    cta: t("landing.pricing.pro.cta"),
    features: t("landing.pricing.pro.features", { returnObjects: true }) as string[],
    highlight: true,
    ctaUrl: "https://app.getonelink.io/pricing",
  };

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-950 opacity-0"
      data-scroll-animate
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <PricingCard {...freePlan} />
          <PricingCard {...proPlan} />
        </div>
      </div>
    </section>
  );
}
