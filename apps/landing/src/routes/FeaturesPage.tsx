import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import FeaturesSection from "@/components/sections/FeaturesSection";
import { Footer } from "@/components/Footer";
import { FeaturesPageHero } from "@/components/sections/FeaturesPageHero";
import { DetailedFeaturesSection } from "@/components/sections/DetailedFeaturesSection";
import { useTranslation } from "react-i18next";
import { getFeatures } from "@/data/features";

export default function FeaturesPage() {
  const { t } = useTranslation();
  const features = getFeatures(t);

  return (
    <SEO
      title="Features - OneLink"
      description="Discover all the powerful features OneLink offers. One link for everything - share links, files, and drops with analytics and customization."
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <FeaturesPageHero />
          <FeaturesSection />
          <DetailedFeaturesSection features={features} />
        </main>
        <Footer />
      </div>
    </SEO>
  );
}
