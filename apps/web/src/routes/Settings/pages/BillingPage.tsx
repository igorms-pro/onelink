import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import { goToPortal, BillingError } from "@/lib/billing";
import { getPlanLinksLimit, getPlanDropsLimit } from "@/lib/plan-limits";
import { isPaidPlan, getPlanName } from "@/lib/types/plan";
import { PlanCard, SubscriptionSection, BillingSkeleton } from "./Billing";

export default function BillingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
  const isLoading = authLoading || dataLoading;

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

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

  // TODO: Fetch real renewal date from Stripe via API
  const renewalDate = "27 Dec 2025"; // Placeholder - should come from Stripe subscription

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_settings")}
        </button>

        <div className="mb-8">
          <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
            {t("billing_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("billing_description")}
          </p>
        </div>

        {isLoading ? (
          <BillingSkeleton />
        ) : (
          <div className="space-y-6">
            <PlanCard
              planDisplayName={planDisplayName}
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
          </div>
        )}
      </main>
    </div>
  );
}
