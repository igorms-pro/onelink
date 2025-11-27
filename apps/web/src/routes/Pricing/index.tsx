import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/AuthProvider";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";
import { getSelfPlan } from "@/lib/profile";
import { getDefaultPlan } from "@/lib/types/plan";
import type { PlanTypeValue } from "@/lib/types/plan";
import type { BillingPeriod } from "@/lib/billing";
import { PricingHeader } from "./components/PricingHeader";
import { PricingPlanCard } from "./components/PricingPlanCard";
import { PricingCTA } from "./components/PricingCTA";
import { PricingFAQ } from "./components/PricingFAQ";
import { PricingContact } from "./components/PricingContact";
import { usePricingPlans } from "./hooks/usePricingPlans";

export default function Pricing() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    (searchParams.get("period") as BillingPeriod) || "monthly",
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] =
    useState<PlanTypeValue>(getDefaultPlan());

  const { plans } = usePricingPlans(billingPeriod, loadingPlan, setLoadingPlan);
  const isAuthenticated = !!user;
  const appTitle =
    i18n?.exists && i18n.exists("app_title") ? t("app_title") : "OneLink";

  useEffect(() => {
    if (user?.id) {
      getSelfPlan(user.id).then(setCurrentPlan);
    } else {
      setCurrentPlan(getDefaultPlan());
    }
  }, [user?.id]);

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      {/* Sticky Header with Logo - Same as Terms page */}
      <header className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50 shadow-sm shrink-0">
        <div className="mx-auto max-w-4xl w-full flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-1.5 sm:p-2">
              <img
                src="/logo.png"
                alt="OneLink"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {appTitle}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="scale-100 sm:scale-110">
              <ThemeToggleButton />
            </div>
            <div className="scale-100 sm:scale-110">
              <LanguageToggleButton />
            </div>
            {isAuthenticated && (
              <button
                onClick={handleSettingsClick}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center cursor-pointer"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <PricingHeader
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
          showBackButton={isAuthenticated}
          onBackClick={() => navigate(-1)}
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan: (typeof plans)[0]) => {
              const isCurrentPlan = isAuthenticated && currentPlan === plan.id;
              return (
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
                  isSelected={selectedPlan === plan.id}
                  isCurrentPlan={isCurrentPlan}
                  onClick={() => {
                    if (!isCurrentPlan) {
                      setSelectedPlan(plan.id);
                    }
                  }}
                  onButtonClick={plan.onClick}
                />
              );
            })}
          </div>
        </section>

        {!isAuthenticated && <PricingCTA />}

        <PricingFAQ />

        <PricingContact />
      </main>
      <Footer variant="default" showLegalLinks={true} />
    </div>
  );
}
