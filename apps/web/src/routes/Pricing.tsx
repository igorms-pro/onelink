import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { HeaderMobileSignIn } from "@/components/HeaderMobileSignIn";
import { Footer } from "@/components/Footer";
import { PlanType } from "@/lib/types/plan";
import { goToCheckout } from "@/lib/billing";

interface PricingPlanContent {
  name: string;
  price: string;
  description: string;
  cta: string;
  features: string[];
}

interface PricingFaqContent {
  question: string;
  answer: string;
}

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const freePlan = t("pricing.plans.free", {
    returnObjects: true,
  }) as PricingPlanContent;
  const proPlan = t("pricing.plans.pro", {
    returnObjects: true,
  }) as PricingPlanContent;
  const faq = t("pricing.faq", { returnObjects: true }) as PricingFaqContent[];

  const plans = [
    {
      id: PlanType.FREE,
      ...freePlan,
      highlight: false,
      onClick: () => navigate("/auth"),
    },
    {
      id: PlanType.PRO,
      ...proPlan,
      highlight: true,
      onClick: async () => {
        setLoadingPlan(PlanType.PRO);
        try {
          await goToCheckout();
        } finally {
          setLoadingPlan(null);
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors flex flex-col">
      <HeaderMobileSignIn />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-linear-to-r from-purple-600/15 via-purple-500/10 to-blue-600/15 dark:from-purple-600/25 dark:via-purple-500/15 dark:to-blue-600/25">
          <div className="absolute inset-y-0 right-0 w-1/2 -translate-y-10 bg-gradient-to-l from-purple-500/20 to-transparent blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="space-y-6 text-center">
              <span className="inline-flex items-center justify-center rounded-full bg-white/70 px-4 py-1 text-xs font-medium text-purple-700 shadow-sm dark:bg-white/10 dark:text-purple-200">
                {t("pricing.monthly_label")}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                {t("pricing.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                {t("pricing.description")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t("pricing.currency_note")}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={
                  "relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/80"
                }
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    {t("pricing.most_popular")}
                  </span>
                )}
                <div className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      {plan.name}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.id === PlanType.FREE ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t("pricing.per_month")}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t("pricing.per_month")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </p>
                  </div>
                  <button
                    onClick={plan.onClick}
                    disabled={loadingPlan === plan.id}
                    className={clsx(
                      "w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all cursor-pointer",
                      plan.highlight
                        ? "bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-60"
                        : "border border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:text-gray-100 dark:hover:border-purple-400/60 dark:hover:bg-purple-500/10 disabled:opacity-60",
                    )}
                  >
                    {loadingPlan === plan.id ? t("pricing.loading") : plan.cta}
                  </button>
                </div>
                <div className="mt-auto space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t("pricing.includes")}
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
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
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("pricing.cta_title")}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("pricing.cta_description")}
                </p>
              </div>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-purple-600 hover:to-purple-700 cursor-pointer"
              >
                {t("pricing.cta_button")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t("pricing.faq_title")}
          </h2>
          <div className="mt-6 space-y-6">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
