import { useState } from "react";
import { trackSignUpClick, trackCTAClick } from "@/lib/analytics";
import { Layout } from "@/components/Layout";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroInput } from "@/components/hero/HeroInput";
import { HeroImage } from "@/components/hero/HeroImage";
import { HeroCTA } from "@/components/hero/HeroCTA";

export default function HeroSection() {
  const [username, setUsername] = useState("");

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
      trackCTAClick("view_demo", "hero");
    }
  };

  const handleGetStarted = () => {
    trackSignUpClick("hero");
    const authUrl = username.trim()
      ? `https://app.onlnk.io/auth?username=${encodeURIComponent(username.trim())}`
      : "https://app.onlnk.io/auth";
    window.location.href = authUrl;
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
      <Layout className="pt-8 md:pt-12 pb-16 md:pb-24">
        {/* Mobile: Single column with custom order, Desktop: Two column grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <HeroHeadline />
          <HeroInput
            username={username}
            onUsernameChange={setUsername}
            onSubmit={handleGetStarted}
          />
          <HeroImage />
          <HeroCTA onClick={scrollToDemo} />
        </div>
      </Layout>
    </section>
  );
}
