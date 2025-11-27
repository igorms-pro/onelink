import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import { goToPortal, BillingError } from "@/lib/billing";
import { getPlanLinksLimit, getPlanDropsLimit } from "@/lib/plan-limits";
import { isPaidPlan, getPlanName } from "@/lib/types/plan";

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

  const linksUsagePercent =
    linksLimit === Infinity
      ? 0
      : Math.min((links.length / linksLimit) * 100, 100);
  const dropsUsagePercent =
    dropsLimit === Infinity
      ? 0
      : Math.min((drops.length / dropsLimit) * 100, 100);

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
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Section */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("billing_current_plan")}
                </h2>
              </div>
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("settings_current_plan")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      hasPaidPlan
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {planDisplayName}
                  </span>
                </div>

                {hasPaidPlan && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("settings_renewal_date")}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {renewalDate}
                    </span>
                  </div>
                )}

                {/* Usage Progress Bar - only for limited plans */}
                {linksLimit !== Infinity && (
                  <div className="space-y-4 pt-2">
                    {/* Links Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {t("billing_links_usage")}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {links.length} / {linksLimit} {t("billing_links")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            linksUsagePercent >= 100
                              ? "bg-red-500"
                              : linksUsagePercent >= 80
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${linksUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Drops Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {t("billing_drops_usage")}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {drops.length} / {dropsLimit} {t("billing_drops")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            dropsUsagePercent >= 100
                              ? "bg-red-500"
                              : dropsUsagePercent >= 80
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${dropsUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlimited plan info */}
                {linksLimit === Infinity && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("billing_pro_limits")}
                  </div>
                )}
              </div>
            </section>

            {/* Manage Subscription Section */}
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
                      onClick={handleManageOnStripe}
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
                      onClick={handleUpgrade}
                      className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                    >
                      {t("settings_upgrade_to_pro")}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
