import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { trackSignUpClick, trackCTAClick } from "@/lib/analytics";
import { Layout } from "@/components/Layout";

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
      ? `https://app.getonelink.io/auth?username=${encodeURIComponent(username.trim())}`
      : "https://app.getonelink.io/auth";
    window.location.href = authUrl;
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
      <Layout className="pt-8 md:pt-12 pb-16 md:pb-24">
        {/* Two Column Layout - CTA Left, Portrait Image Right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left Column - CTA */}
          <div className="space-y-12 md:space-y-14">
            {/* Headline */}
            <div className="space-y-4 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h1
                  data-testid="hero-headline"
                  className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
                >
                  <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    One link. Multiple lives.
                  </span>
                </h1>
                <p
                  data-testid="hero-subtitle"
                  className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium"
                >
                  one link to Share Everything
                </p>
              </div>
              <p
                data-testid="hero-description"
                className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                Share your links, files, and drops with one simple link. No more
                messy bios or multiple links to manage.
              </p>
            </div>

            {/* Input and Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-[0.65] relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">
                    app.getonelink.io/
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGetStarted();
                    }
                  }}
                  placeholder="username"
                  className="w-full pl-[160px] md:pl-[180px] pr-5 py-4 md:py-5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg md:text-xl placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
              <Button
                data-testid="hero-cta-get-started"
                className="flex-1 sm:flex-initial sm:min-w-[200px] md:min-w-[220px] px-6 md:px-8 py-4 md:py-5 h-auto text-lg md:text-xl bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50 whitespace-nowrap font-semibold rounded-xl"
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="size-5 ml-2" />
              </Button>
            </div>

            {/* Secondary CTA */}
            <div className="flex justify-center lg:justify-start">
              <Button
                data-testid="hero-cta-view-demo"
                size="lg"
                variant="outline"
                onClick={scrollToDemo}
                className="border-2 px-6 md:px-8 py-4 md:py-5 text-base md:text-lg"
              >
                <Play className="size-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>

          {/* Right Column - Square Image */}
          <div className="relative w-full mx-auto lg:mx-0">
            <div className="relative rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 shadow-2xl shadow-purple-500/20 p-4 md:p-6 overflow-hidden">
              <div className="aspect-square w-full flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <p
                  data-testid="hero-image-placeholder"
                  className="text-muted-foreground text-sm md:text-base font-medium"
                >
                  PORTRAIT IMAGE
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
