import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/AuthProvider";
import type { BillingPeriod } from "@/lib/billing";
import { PricingHeader } from "./components/PricingHeader";
import { PricingPlanCard } from "./components/PricingPlanCard";
import { PricingCTA } from "./components/PricingCTA";
import { PricingFAQ } from "./components/PricingFAQ";
import { PricingContact } from "./components/PricingContact";
import { usePricingPlans } from "./hooks/usePricingPlans";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    (searchParams.get("period") as BillingPeriod) || "monthly",
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { plans } = usePricingPlans(billingPeriod, loadingPlan, setLoadingPlan);
  const isAuthenticated = !!user;

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      <Header
        onSettingsClick={isAuthenticated ? handleSettingsClick : undefined}
      />
      <main className="flex-1">
        {isAuthenticated && (
          <div className="sticky top-[56px] sm:static z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        )}

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

        {!isAuthenticated && <PricingCTA />}

        <PricingFAQ />

        <PricingContact />
      </main>
      <Footer />
    </div>
  );
}
