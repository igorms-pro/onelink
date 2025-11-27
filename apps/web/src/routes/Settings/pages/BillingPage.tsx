import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CreditCard, Download, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { useDashboardData } from "../../Dashboard/hooks/useDashboardData";
import { goToPortal } from "@/lib/billing";

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  pdfUrl?: string;
};

type PaymentMethod = {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
};

import { getPlanLinksLimit, getPlanDropsLimit } from "@/lib/plan-limits";
import { isPaidPlan, getPlanName } from "@/lib/types/plan";
import { BillingError } from "@/lib/billing";

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

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

  // Load invoices (placeholder - will be replaced with real API)
  useEffect(() => {
    if (!user || !hasPaidPlan) return;
    setLoadingInvoices(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setInvoices([]);
      setLoadingInvoices(false);
    }, 500);
  }, [user, hasPaidPlan]);

  // Load payment method (placeholder - will be replaced with real API)
  useEffect(() => {
    if (!user || !hasPaidPlan) return;
    setLoadingPayment(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setPaymentMethod(null);
      setLoadingPayment(false);
    }, 500);
  }, [user, hasPaidPlan]);

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const linksUsagePercent =
    linksLimit === Infinity
      ? 0
      : Math.min((links.length / linksLimit) * 100, 100);
  const dropsUsagePercent =
    dropsLimit === Infinity
      ? 0
      : Math.min((drops.length / dropsLimit) * 100, 100);

  const handleManagePayment = async () => {
    try {
      await goToPortal();
    } catch (error) {
      if (error instanceof BillingError) {
        if (error.code === "AUTH_REQUIRED") {
          toast.error(
            t("billing_auth_required", {
              defaultValue: "Please sign in to manage payment",
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

  const handleAddCard = async () => {
    try {
      await goToPortal();
    } catch (error) {
      if (error instanceof BillingError) {
        if (error.code === "AUTH_REQUIRED") {
          toast.error(
            t("billing_auth_required", {
              defaultValue: "Please sign in to add payment method",
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

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        t("billing_cancel_confirm", {
          defaultValue:
            "Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.",
        }),
      )
    ) {
      return;
    }
    // TODO: Implement cancel subscription API
    toast.info(t("billing_cancel_coming_soon"));
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement download invoice API
    toast.info(t("billing_download_coming_soon"));
  };

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
            {[1, 2, 3].map((i) => (
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("settings_renewal_date")}:{" "}
                    {t("billing_renewal_placeholder")}
                  </div>
                )}

                {/* Usage Progress Bar */}
                {linksLimit !== Infinity && (
                  <div className="space-y-4">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("billing_plan_limits_separate", {
                        links: linksLimit,
                        drops: dropsLimit,
                      })}
                    </p>
                  </div>
                )}

                {/* Unlimited plan */}
                {linksLimit === Infinity && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("billing_pro_limits")}
                  </div>
                )}
              </div>
            </section>

            {/* Payment Method Section */}
            {hasPaidPlan && (
              <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("billing_payment_method")}
                  </h2>
                </div>
                <div className="pl-7">
                  {loadingPayment ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
                    </div>
                  ) : paymentMethod ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              •••• •••• •••• {paymentMethod.last4}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("billing_expires")} {paymentMethod.expMonth}/
                              {paymentMethod.expYear}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleManagePayment}
                        className="text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
                      >
                        {t("settings_manage_payment")}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("billing_no_payment_method")}
                      </p>
                      <button
                        onClick={handleAddCard}
                        className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {t("billing_add_card")}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Billing History Section */}
            {hasPaidPlan && (
              <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("settings_billing_history")}
                  </h2>
                </div>
                <div className="pl-7">
                  {loadingInvoices ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                        </div>
                      ))}
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("billing_no_invoices")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(invoice.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ${invoice.amount.toFixed(2)} •{" "}
                                <span
                                  className={
                                    invoice.status === "paid"
                                      ? "text-green-600 dark:text-green-400"
                                      : invoice.status === "pending"
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {t(`billing_status_${invoice.status}`)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleDownloadInvoice}
                            className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {t("billing_download_pdf")}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Manage Subscription Section */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("billing_manage_subscription")}
                </h2>
              </div>
              <div className="pl-7 space-y-3">
                {hasPaidPlan ? (
                  <button
                    onClick={handleCancelSubscription}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <X className="w-4 h-4" />
                    {t("billing_cancel_subscription")}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {t("settings_upgrade_to_pro")}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
