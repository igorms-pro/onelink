import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import clsx from "clsx";

export function FAQSection() {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqItems = t("landing.faq.items", { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

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
    <section
      id="faq"
      className="py-16 md:py-24 bg-background opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.faq.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              {t("landing.faq.subtitle")}
            </p>
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground pr-6">
                      {item.question}
                    </h3>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </button>
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="border-t border-gray-200 dark:border-gray-800">
                      <p className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </section>
  );
}
