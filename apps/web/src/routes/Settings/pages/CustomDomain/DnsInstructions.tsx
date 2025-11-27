import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";

interface DnsInstructionsProps {
  domainInput?: string;
}

export function DnsInstructions({ domainInput }: DnsInstructionsProps) {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("settings_domain_dns_title")}
        </h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t("settings_domain_help_toggle")}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      {showHelp && (
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold mb-2">
              {t("settings_domain_dns_subdomain_title")}
            </h3>
            <p className="mb-2">
              {t("settings_domain_dns_subdomain_description")}
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-xs">
              <div className="mb-1">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>{" "}
                CNAME
              </div>
              <div className="mb-1">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>{" "}
                {domainInput || "subdomain.example.com"}
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Value:</span>{" "}
                cname.vercel-dns.com
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              {t("settings_domain_dns_apex_title")}
            </h3>
            <p className="mb-2">{t("settings_domain_dns_apex_description")}</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-xs">
              <div className="mb-1">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>{" "}
                A
              </div>
              <div className="mb-1">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>{" "}
                @
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Value:</span>{" "}
                76.76.21.21
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("settings_domain_dns_apex_note")}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("settings_domain_dns_note")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
