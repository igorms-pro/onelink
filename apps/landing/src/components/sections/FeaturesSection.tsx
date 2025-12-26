import { Link, Upload, Bell, User, Lock, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import FeatureCard from "@/components/FeatureCard";
import { Layout } from "@/components/Layout";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("landing.features.oneLink.title"),
      description: t("landing.features.oneLink.description"),
      icon: Link,
    },
    {
      title: t("landing.features.fileSharing.title"),
      description: t("landing.features.fileSharing.description"),
      icon: Upload,
    },
    {
      title: t("landing.features.notifications.title"),
      description: t("landing.features.notifications.description"),
      icon: Bell,
    },
    {
      title: t("landing.features.customizable.title"),
      description: t("landing.features.customizable.description"),
      icon: User,
    },
    {
      title: t("landing.features.privacy.title"),
      description: t("landing.features.privacy.description"),
      icon: Lock,
    },
    {
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
      icon: BarChart3,
    },
  ];
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-background opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.features.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              {t("landing.features.subtitle")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </Layout>
    </section>
  );
}
