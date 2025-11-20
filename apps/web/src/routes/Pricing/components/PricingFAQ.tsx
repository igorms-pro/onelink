import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

interface PricingFaqContent {
  question: string;
  answer: string;
}

export function PricingFAQ() {
  const { t } = useTranslation();
  const faq = t("pricing.faq", { returnObjects: true }) as PricingFaqContent[];
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {t("pricing.faq_title")}
      </h2>
      <div className="mt-6 space-y-4">
        {faq.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {item.question}
                </h3>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>
              <div
                className={clsx(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <p className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
