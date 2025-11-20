import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlanType } from "@/lib/types/plan";
import {
  goToCheckout,
  BillingError,
  type BillingPeriod,
  type PlanTier,
} from "@/lib/billing";

interface PricingPlanContent {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  cta: string;
  features: string[];
}

export function usePricingPlans(
  billingPeriod: BillingPeriod,
  _loadingPlan: string | null,
  setLoadingPlan: (plan: string | null) => void,
) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const freePlan = t("pricing.plans.free", {
    returnObjects: true,
  }) as PricingPlanContent;
  const starterPlan = t("pricing.plans.starter", {
    returnObjects: true,
  }) as PricingPlanContent;
  const proPlan = t("pricing.plans.pro", {
    returnObjects: true,
  }) as PricingPlanContent;

  const handleUpgrade = async (plan: PlanTier) => {
    setLoadingPlan(plan);
    try {
      await goToCheckout(plan, billingPeriod);
    } catch (error) {
      setLoadingPlan(null);
      if (error instanceof BillingError) {
        if (error.code === "AUTH_REQUIRED") {
          toast.error(
            t("billing_auth_required", {
              defaultValue: "Please sign in to upgrade",
            }),
          );
          navigate("/auth");
        } else {
          toast.error(t("billing_upgrade_error"));
        }
      } else {
        toast.error(t("billing_upgrade_error"));
      }
    }
  };

  const plans = [
    {
      id: PlanType.FREE,
      ...freePlan,
      highlight: false,
      onClick: () => navigate("/auth"),
      planTier: null as PlanTier | null,
    },
    {
      id: "starter",
      ...starterPlan,
      highlight: false,
      onClick: () => handleUpgrade("starter"),
      planTier: "starter" as PlanTier,
    },
    {
      id: PlanType.PRO,
      ...proPlan,
      highlight: true,
      onClick: () => handleUpgrade("pro"),
      planTier: "pro" as PlanTier,
    },
  ];

  return { plans };
}
