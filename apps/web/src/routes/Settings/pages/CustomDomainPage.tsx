import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { useRequireProPlan } from "@/hooks/useRequireProPlan";
import {
  DomainSkeleton,
  DomainForm,
  DomainList,
  DnsInstructions,
} from "./CustomDomain";
import { useCustomDomains } from "./CustomDomain/useCustomDomains";

export default function CustomDomainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, isPro } = useRequireProPlan();

  const {
    domains,
    loading,
    submitting,
    domainInput,
    setDomainInput,
    errors,
    setErrors,
    handleAddDomain,
    handleDeleteDomain,
  } = useCustomDomains({ userId: user?.id ?? null });

  if (authLoading || !user || !isPro) {
    return null; // Will redirect via useRequireProPlan
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header onSettingsClick={() => navigate("/settings")} />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("settings_back_to_dashboard")}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-[22px]! font-bold text-gray-900 dark:text-white sm:text-3xl!">
              {t("settings_custom_domain")}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("settings_domain_page_description")}
          </p>
        </div>

        {loading ? (
          <DomainSkeleton />
        ) : (
          <div className="space-y-6">
            <DomainForm
              domainInput={domainInput}
              setDomainInput={setDomainInput}
              onSubmit={handleAddDomain}
              submitting={submitting}
              error={errors.domain}
              onClearError={() => setErrors({})}
            />

            <DomainList domains={domains} onDelete={handleDeleteDomain} />

            <DnsInstructions domainInput={domainInput} />
          </div>
        )}
      </main>
    </div>
  );
}
