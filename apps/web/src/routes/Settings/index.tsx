import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Header } from "@/components/Header";
import { PlanTypeValue, isProPlan } from "@/lib/types/plan";
import { useDashboardData } from "../Dashboard/hooks/useDashboardData";
import {
  NotificationsSection,
  EmailPreferencesSection,
  BillingSection,
  CustomDomainSection,
  ActiveSessionsSection,
  DataExportSection,
  ApiIntegrationsSection,
  PrivacySecuritySection,
} from "./components";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { plan } = useDashboardData(user?.id ?? null);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, user, navigate]);

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_dashboard")}
        </button>
        <div className="mb-8">
          <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
            {t("settings_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("settings_description")}
          </p>
        </div>

        <div className="space-y-6">
          <NotificationsSection />
          <EmailPreferencesSection />
          <BillingSection plan={plan as PlanTypeValue | null} />
          {isProPlan(plan) && <CustomDomainSection />}
          <ActiveSessionsSection />
          <DataExportSection />
          <ApiIntegrationsSection />
          <PrivacySecuritySection />
        </div>
      </main>
    </div>
  );
}
