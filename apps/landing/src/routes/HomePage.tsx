import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { DemoSection } from "@/components/sections/DemoSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";
import { initScrollAnimations } from "@/lib/scrollAnimation";
import { useScrollDepth } from "@/hooks/useScrollDepth";

export default function HomePage() {
  // Track scroll depth
  useScrollDepth();

  useEffect(() => {
    // Initialize scroll animations
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);
  return (
    <SEO
      title="One Link to Share Everything"
      description="Share your links, files, and drops with one simple link. No more messy bios or multiple links."
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

          {/* Pricing Section */}
          <PricingSection />

          {/* Social Proof Section */}
          <SocialProofSection />

          {/* Demo Section */}
          <DemoSection />

          {/* Final CTA Section */}
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </SEO>
  );
}
