import { useTranslation } from "react-i18next";
import { Globe, Trash2 } from "lucide-react";
import { DomainStatusBadge } from "./DomainStatusBadge";

export interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  created_at: string;
}

interface DomainListProps {
  domains: CustomDomain[];
  onDelete: (domainId: string, domainName: string) => void;
}

export function DomainList({ domains, onDelete }: DomainListProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {t("settings_domain_list_title")}
      </h2>
      {domains.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t("settings_domain_empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {domain.domain}
                  </div>
                  <div className="mt-1">
                    <DomainStatusBadge verified={domain.verified} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(domain.id, domain.domain)}
                className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label={t("common_delete")}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
