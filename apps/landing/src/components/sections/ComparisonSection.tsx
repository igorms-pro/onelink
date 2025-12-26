import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { useComparisonFeatures } from "@/data/comparisonFeatures";
import { ComparisonTableHeader } from "@/components/comparison/ComparisonTableHeader";
import { ComparisonTableRow } from "@/components/comparison/ComparisonTableRow";

export default function ComparisonSection() {
  const { t } = useTranslation();
  const features = useComparisonFeatures();

  return (
    <section
      id="comparison"
      className="py-16 md:py-24 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-blue-500/10 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.comparison.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              {t("landing.comparison.subtitle")}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-w-full inline-block">
              <table className="w-full border-collapse">
                <ComparisonTableHeader />
                <tbody>
                  {features.map((feature, index) => (
                    <ComparisonTableRow
                      key={feature.name}
                      feature={feature}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
