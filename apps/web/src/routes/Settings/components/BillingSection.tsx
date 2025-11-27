import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isPaidPlan, getPlanName } from "@/lib/types/plan";
import type { PlanTypeValue } from "@/lib/types/plan";

interface BillingSectionProps {
  plan: PlanTypeValue | null;
}

export function BillingSection({ plan }: BillingSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasPaidPlan = isPaidPlan(plan);
  const planDisplayName = getPlanName(plan);

  const handleNavigateToBilling = () => {
    navigate("/settings/billing");
  };

  return (
    <section
      data-testid="settings-billing-section"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_billing")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t("settings_current_plan")}
          </span>
          <span
            data-testid="settings-current-plan-badge"
            className={`px-2 py-1 rounded text-xs font-medium ${
              hasPaidPlan
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {planDisplayName}
          </span>
        </div>
        {hasPaidPlan && (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("settings_renewal_date")}: {t("settings_coming_soon")}
            </div>
            <button
              data-testid="settings-manage-payment"
              onClick={handleNavigateToBilling}
              className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
            >
              {t("settings_manage_payment")}
            </button>
            <button
              data-testid="settings-billing-history"
              onClick={handleNavigateToBilling}
              className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
            >
              {t("settings_billing_history")}
            </button>
          </>
        )}
        {!hasPaidPlan && (
          <button
            data-testid="settings-upgrade-to-pro"
            onClick={handleNavigateToBilling}
            className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
          >
            {t("settings_upgrade_to_pro")}
          </button>
        )}
      </div>
    </section>
  );
}
