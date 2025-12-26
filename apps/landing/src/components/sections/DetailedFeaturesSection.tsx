import type { Feature } from "@/data/features";
import { DetailedFeatureCard } from "@/components/DetailedFeatureCard";

export interface DetailedFeaturesSectionProps {
  features: Feature[];
}

export function DetailedFeaturesSection({
  features,
}: DetailedFeaturesSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {features.map((feature, index) => (
            <DetailedFeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
