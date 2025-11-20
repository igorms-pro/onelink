import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function PricingCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("pricing.cta_title")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("pricing.cta_description")}
            </p>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-purple-600 hover:to-purple-700 cursor-pointer"
          >
            {t("pricing.cta_button")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
