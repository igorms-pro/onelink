import { useTranslation } from "react-i18next";
import { CreditCard, ExternalLink } from "lucide-react";

interface SubscriptionSectionProps {
  hasPaidPlan: boolean;
  onManageOnStripe: () => void;
  onUpgrade: () => void;
}

export function SubscriptionSection({
  hasPaidPlan,
  onManageOnStripe,
  onUpgrade,
}: SubscriptionSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("billing_manage_subscription")}
        </h2>
      </div>
      <div className="pl-7 space-y-4">
        {hasPaidPlan ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("billing_manage_on_stripe_description", {
                defaultValue:
                  "Manage your payment method, view invoices, and cancel your subscription on Stripe.",
              })}
            </p>
            <button
              onClick={onManageOnStripe}
              data-testid="manage-on-stripe-button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              {t("billing_manage_on_stripe", {
                defaultValue: "Manage on Stripe",
              })}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("billing_upgrade_description", {
                defaultValue:
                  "Upgrade to a paid plan to unlock more features and higher limits.",
              })}
            </p>
            <button
              onClick={onUpgrade}
              data-testid="upgrade-to-pro-button"
              className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              {t("settings_upgrade_to_pro")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
