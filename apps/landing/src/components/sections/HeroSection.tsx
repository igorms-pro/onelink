import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              One Link to Share Everything
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Share your links, files, and drops with one simple link. No more messy bios or multiple links.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50"
              onClick={() => {
                window.location.href = "https://app.getonelink.io/auth";
              }}
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToDemo}
              className="border-2"
            >
              <Play className="size-4" />
              View Demo
            </Button>
          </div>

          {/* Visual Placeholder */}
          <div className="pt-12 md:pt-16">
            <div className="relative rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 shadow-2xl shadow-purple-500/20 p-8 md:p-12">
              <div className="aspect-video flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-muted-foreground text-sm md:text-base font-medium">
                  SCREENSHOT: Dashboard Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
