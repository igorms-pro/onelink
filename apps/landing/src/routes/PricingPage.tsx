import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { PricingSection } from "@/components/sections/PricingSection";
import { FeatureComparisonTable } from "@/components/sections/FeatureComparisonTable";
import { PricingFAQ } from "@/components/sections/PricingFAQ";
import { PricingContact } from "@/components/sections/PricingContact";
import { Footer } from "@/components/Footer";
import { trackPricingView } from "@/lib/analytics";

export default function PricingPage() {
  useEffect(() => {
    trackPricingView();
  }, []);
  return (
    <SEO
      title="Pricing - OneLink"
      description="Choose the plan that fits your needs. Start free, upgrade when ready. Simple, transparent pricing for sharing your links and files."
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <PricingSection />
          <FeatureComparisonTable />
          <PricingFAQ />
          <PricingContact />
        </main>
        <Footer />
      </div>
    </SEO>
  );
}
