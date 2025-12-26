import { Layout } from "@/components/Layout";
import { pricingFeatures } from "@/data/pricingFeatures";
import { FeatureTableHeader } from "@/components/pricing/FeatureTableHeader";
import { FeatureTableRow } from "@/components/pricing/FeatureTableRow";

export function FeatureComparisonTable() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
      <Layout className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Compare Plans
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            See what's included in each plan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <FeatureTableHeader />
            <tbody>
              {pricingFeatures.map((feature, index) => (
                <FeatureTableRow
                  key={feature.name}
                  feature={feature}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </section>
  );
}
