import { useTranslation } from "react-i18next";

export function PricingSocialProof() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
          {t("pricing.trusted_by", {
            defaultValue: "Trusted by creators worldwide",
          })}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
          {/* Placeholder for company/user logos - can be replaced with real data */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Creator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Freelancer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
