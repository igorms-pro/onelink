import { UserPlus, Link2, Share2, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import StepCard from "@/components/StepCard";
import { Layout } from "@/components/Layout";

// YouTube video ID - Replace with your actual video ID when ready
// You can also use environment variable: import.meta.env.VITE_YOUTUBE_HOW_IT_WORKS_ID
const YOUTUBE_VIDEO_ID = ""; // e.g., "dQw4w9WgXcQ" (replace with your video ID)

export default function HowItWorksSection() {
  const { t } = useTranslation();

  // Get video ID from env or use default
  const videoId =
    import.meta.env.VITE_YOUTUBE_HOW_IT_WORKS_ID || YOUTUBE_VIDEO_ID;
  const youtubeEmbedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`
    : null;

  const steps = [
    {
      stepNumber: 1,
      title: t("landing.howItWorks.step1.title"),
      description: t("landing.howItWorks.step1.description"),
      icon: UserPlus,
    },
    {
      stepNumber: 2,
      title: t("landing.howItWorks.step2.title"),
      description: t("landing.howItWorks.step2.description"),
      icon: Link2,
    },
    {
      stepNumber: 3,
      title: t("landing.howItWorks.step3.title"),
      description: t("landing.howItWorks.step3.description"),
      icon: Share2,
    },
    {
      stepNumber: 4,
      title: t("landing.howItWorks.step4.title"),
      description: t("landing.howItWorks.step4.description"),
      icon: BarChart3,
    },
  ];
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-blue-500/10 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.howItWorks.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          {/* YouTube Video - Responsive */}
          {youtubeEmbedUrl && (
            <div className="mb-12 md:mb-16">
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={youtubeEmbedUrl}
                  title={t("landing.howItWorks.title")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Steps - Mobile: Vertical, Desktop: Horizontal */}
          <div className="relative">
            {/* Mobile: Vertical Timeline */}
            <div className="md:hidden space-y-0">
              {steps.map((step, index) => (
                <StepCard
                  key={step.stepNumber}
                  stepNumber={step.stepNumber}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  isLast={index === steps.length - 1}
                />
              ))}
            </div>

            {/* Desktop: Horizontal Timeline */}
            <div className="hidden md:grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={step.stepNumber} className="relative">
                  <StepCard
                    stepNumber={step.stepNumber}
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                    isLast={index === steps.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
