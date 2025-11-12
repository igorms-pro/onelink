import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function CustomDomainSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      data-testid="settings-custom-domain-section"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_custom_domain")}
        </h2>
      </div>
      <div className="space-y-3 pl-7">
        <button
          data-testid="settings-custom-domain-configure"
          onClick={() => navigate("/settings/domain")}
          className="w-full text-left text-sm text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
        >
          {t("settings_configure_domain")}
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t("settings_domain_help")}
        </div>
      </div>
    </section>
  );
}
