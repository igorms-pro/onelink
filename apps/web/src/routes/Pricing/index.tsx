import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderMobileSignIn } from "@/components/HeaderMobileSignIn";
import { Footer } from "@/components/Footer";
import type { BillingPeriod } from "@/lib/billing";
import { PricingHeader } from "./components/PricingHeader";
import { PricingPlanCard } from "./components/PricingPlanCard";
import { PricingCTA } from "./components/PricingCTA";
import { PricingFAQ } from "./components/PricingFAQ";
import { usePricingPlans } from "./hooks/usePricingPlans";

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    (searchParams.get("period") as BillingPeriod) || "monthly",
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { plans } = usePricingPlans(billingPeriod, loadingPlan, setLoadingPlan);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      <HeaderMobileSignIn />
      <main className="flex-1">
        <PricingHeader
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan: (typeof plans)[0]) => (
              <PricingPlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                priceMonthly={plan.priceMonthly}
                priceYearly={plan.priceYearly}
                description={plan.description}
                cta={plan.cta}
                features={plan.features}
                highlight={plan.highlight}
                planTier={plan.planTier}
                billingPeriod={billingPeriod}
                loadingPlan={loadingPlan}
                onClick={plan.onClick}
              />
            ))}
          </div>
        </section>

        <PricingCTA />

        <PricingFAQ />
      </main>
      <Footer />
    </div>
  );
}
