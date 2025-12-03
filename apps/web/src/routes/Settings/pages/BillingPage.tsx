import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import {
  goToPortal,
  BillingError,
  getSubscriptionDetails,
  getInvoices,
  getPaymentMethods,
  type SubscriptionDetails,
  type Invoice,
  type PaymentMethod,
} from "@/lib/billing";
import { getPlanLinksLimit, getPlanDropsLimit } from "@/lib/plan-limits";
import { isPaidPlan, getPlanName, PlanId } from "@/lib/types/plan";
import {
  PlanCard,
  SubscriptionSection,
  BillingSkeleton,
  InvoicesList,
  PaymentMethodCard,
} from "./Billing";

export default function BillingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const {
    plan,
    links,
    drops,
    loading: dataLoading,
  } = useDashboardData(user?.id ?? null);

  const hasPaidPlan = isPaidPlan(plan);
  const planDisplayName = getPlanName(plan);
  const linksLimit = getPlanLinksLimit(plan);
  const dropsLimit = getPlanDropsLimit(plan);
  const isLoading = dataLoading;

  const [subscriptionDetails, setSubscriptionDetails] =
    useState<SubscriptionDetails | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Get plan price from translations
  const getPlanPrice = (planId: string | null | undefined): string => {
    if (!planId || planId === PlanId.FREE) return "€0";
    const planData = t(`pricing.plans.${planId}`, { returnObjects: true }) as {
      priceMonthly?: string;
      priceYearly?: string;
    };
    // Default to monthly price, but we could detect billing period from subscription
    return planData?.priceMonthly || "€0";
  };

  const planPrice = getPlanPrice(plan);

  // Fetch subscription data
  useEffect(() => {
    if (!user || !hasPaidPlan) {
      setLoadingSubscription(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        setLoadingSubscription(true);
        const [subscription, invoicesData, paymentMethods] = await Promise.all([
          getSubscriptionDetails(),
          getInvoices(),
          getPaymentMethods(),
        ]);

        setSubscriptionDetails(subscription);
        setInvoices(invoicesData);
        setPaymentMethod(paymentMethods[0] || null);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
        if (error instanceof BillingError && error.code !== "AUTH_REQUIRED") {
          toast.error(
            t("billing_fetch_error", {
              defaultValue: "Failed to load billing information",
            }),
          );
        }
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscriptionData();
  }, [user, hasPaidPlan, t]);

  if (!user) {
    return null;
  }

  const handleManageOnStripe = async () => {
    try {
      await goToPortal();
    } catch (error) {
      if (error instanceof BillingError) {
        if (error.code === "AUTH_REQUIRED") {
          toast.error(
            t("billing_auth_required", {
              defaultValue: "Please sign in to manage billing",
            }),
          );
          navigate("/auth");
        } else {
          toast.error(t("billing_payment_error"));
        }
      } else {
        toast.error(t("billing_payment_error"));
      }
    }
  };

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  // Format renewal date from subscription details
  const formatRenewalDate = (): string => {
    if (!subscriptionDetails?.renewalDate) {
      return t("billing_no_renewal_date", { defaultValue: "N/A" });
    }
    const date = new Date(subscriptionDetails.renewalDate);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renewalDate = formatRenewalDate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          data-testid="billing-back-button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_settings")}
        </button>

        <div className="mb-8" data-testid="billing-page-header">
          <h1
            className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!"
            data-testid="billing-title"
          >
            {t("billing_title")}
          </h1>
          <p
            className="text-gray-500 dark:text-gray-400 mt-2"
            data-testid="billing-description"
          >
            {t("billing_description")}
          </p>
        </div>

        {isLoading || loadingSubscription ? (
          <BillingSkeleton data-testid="billing-skeleton" />
        ) : (
          <div className="space-y-6" data-testid="billing-content">
            <PlanCard
              planDisplayName={planDisplayName}
              planPrice={planPrice}
              hasPaidPlan={hasPaidPlan}
              renewalDate={renewalDate}
              linksUsed={links.length}
              linksLimit={linksLimit}
              dropsUsed={drops.length}
              dropsLimit={dropsLimit}
            />
            <SubscriptionSection
              hasPaidPlan={hasPaidPlan}
              onManageOnStripe={handleManageOnStripe}
              onUpgrade={handleUpgrade}
            />
            {hasPaidPlan && (
              <>
                <section
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
                  data-testid="payment-method-section"
                >
                  <h2
                    className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                    data-testid="payment-method-title"
                  >
                    {t("billing_payment_method", {
                      defaultValue: "Payment Method",
                    })}
                  </h2>
                  <PaymentMethodCard paymentMethod={paymentMethod} />
                </section>
                <section
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
                  data-testid="invoices-section"
                >
                  <h2
                    className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                    data-testid="invoices-title"
                  >
                    {t("billing_invoices", { defaultValue: "Invoices" })}
                  </h2>
                  <InvoicesList invoices={invoices} />
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
