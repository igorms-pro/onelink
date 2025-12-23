import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import FeaturesSection from "@/components/sections/FeaturesSection";
import { Footer } from "@/components/Footer";

export default function FeaturesPage() {
  return (
    <SEO
      title="Features - OneLink"
      description="Discover all the powerful features OneLink offers. One link for everything - share links, files, and drops with analytics and customization."
    >
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <FeaturesSection />
        </main>
        <Footer />
      </div>
    </SEO>
  );
}
