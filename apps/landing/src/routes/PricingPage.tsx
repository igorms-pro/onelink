import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  return (
    <SEO
      title="Pricing - OneLink"
      description="Choose the plan that fits your needs. Start free, upgrade when ready. Simple, transparent pricing for sharing your links and files."
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <PricingSection />
        </main>
        <Footer />
      </div>
    </SEO>
  );
}
