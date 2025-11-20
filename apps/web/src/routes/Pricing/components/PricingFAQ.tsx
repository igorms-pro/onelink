import { useTranslation } from "react-i18next";

interface PricingFaqContent {
  question: string;
  answer: string;
}

export function PricingFAQ() {
  const { t } = useTranslation();
  const faq = t("pricing.faq", { returnObjects: true }) as PricingFaqContent[];

  return (
    <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {t("pricing.faq_title")}
      </h2>
      <div className="mt-6 space-y-6">
        {faq.map((item) => (
          <div
            key={item.question}
            className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.question}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
