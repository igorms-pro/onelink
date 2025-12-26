import { useTranslation } from "react-i18next";
import { PricingCard } from "@/components/PricingCard";
import { Layout } from "@/components/Layout";

export function PricingSection() {
  const { t } = useTranslation();

  const freePlan = {
    name: t("pricing.plans.free.name"),
    price: t("pricing.plans.free.priceMonthly"),
    description: t("pricing.plans.free.description"),
    cta: t("pricing.plans.free.cta"),
    features: t("pricing.plans.free.features", {
      returnObjects: true,
    }) as string[],
    ctaUrl: "https://app.getonelink.io/auth",
  };

  const starterPlan = {
    name: t("pricing.plans.starter.name"),
    price: `${t("pricing.plans.starter.priceMonthly")} ${t("pricing.per_month")}`,
    description: t("pricing.plans.starter.description"),
    cta: t("pricing.plans.starter.cta"),
    features: t("pricing.plans.starter.features", {
      returnObjects: true,
    }) as string[],
    highlight: true,
    ctaUrl: "https://app.getonelink.io/pricing",
  };

  const proPlan = {
    name: t("pricing.plans.pro.name"),
    price: `${t("pricing.plans.pro.priceMonthly")} ${t("pricing.per_month")}`,
    description: t("pricing.plans.pro.description"),
    cta: t("pricing.plans.pro.cta"),
    features: t("pricing.plans.pro.features", {
      returnObjects: true,
    }) as string[],
    highlight: false,
    ctaUrl: "https://app.getonelink.io/pricing",
  };

  return (
    <section
      id="pricing"
      className="py-16 md:py-24 bg-white dark:bg-gray-950 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("pricing.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              {t("pricing.description")}
            </p>
          </div>

          <div className="grid gap-8 md:gap-10 lg:gap-12 lg:grid-cols-3">
            <PricingCard {...freePlan} />
            <PricingCard {...starterPlan} />
            <PricingCard {...proPlan} />
          </div>
        </div>
      </Layout>
    </section>
  );
}
