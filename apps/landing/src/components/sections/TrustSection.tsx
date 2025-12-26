import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { TrustFeatureItem } from "@/components/trust/TrustFeatureItem";
import { trustFeatures } from "@/data/trustFeatures";

export function TrustSection() {
  const { t } = useTranslation();

  return (
    <section
      id="trust"
      className="py-16 md:py-24 bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm md:text-base font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                {t("landing.trust.badge")}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.trust.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              {t("landing.trust.subtitle")}
            </p>
          </div>

          {/* Two-Column Layout with Big Icons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column - Main Trust Badge */}
            <TrustBadge />

            {/* Right Column - Feature List */}
            <div className="space-y-6">
              {trustFeatures.map((feature, index) => (
                <TrustFeatureItem
                  key={index}
                  icon={feature.icon}
                  title={t(feature.titleKey)}
                  description={t(feature.descriptionKey)}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
