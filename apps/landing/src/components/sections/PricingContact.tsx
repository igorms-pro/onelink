import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PricingContact() {
  const { t } = useTranslation();
  const contactEmail = t("pricing.contact_email");

  return (
    <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
            <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("pricing.contact_title")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("pricing.contact_description")}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
