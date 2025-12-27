import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import { DemoSection } from "@/components/sections/DemoSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import { PricingSection } from "@/components/sections/PricingSection";
// import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";
import { initScrollAnimations } from "@/lib/scrollAnimation";
import { useScrollDepth } from "@/hooks/useScrollDepth";

export default function HomePage() {
  const { t } = useTranslation();
  // Track scroll depth
  useScrollDepth();

  useEffect(() => {
    // Initialize scroll animations
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);
  return (
    <SEO
      title={t("landing.hero.headline")}
      description={t("landing.hero.description")}
    >
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="scroll-smooth">
          {/* Hero Section */}
          <HeroSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* How It Works Section */}
          <HowItWorksSection />

          {/* Demo Section */}
          <DemoSection />

          {/* Comparison Section */}
          <ComparisonSection />

          {/* Pricing Section */}
          <PricingSection />

          {/* Social Proof Section */}
          {/* <SocialProofSection /> */}

          {/* Trust & Security Section */}
          <TrustSection />

          {/* FAQ Section */}
          <FAQSection />

          {/* Final CTA Section */}
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </SEO>
  );
}
