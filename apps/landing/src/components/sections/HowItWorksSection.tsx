import { UserPlus, Link2, Share2, BarChart3 } from "lucide-react";
import StepCard from "@/components/StepCard";

const steps = [
  {
    stepNumber: 1,
    title: "Sign Up",
    description: "Create your free account in seconds. No credit card required.",
    icon: UserPlus,
  },
  {
    stepNumber: 2,
    title: "Create Your Link",
    description: "Add your links, upload files, and customize your profile to match your style.",
    icon: Link2,
  },
  {
    stepNumber: 3,
    title: "Share",
    description: "One simple link to share everywhere. Put it in your bio, email signature, or anywhere.",
    icon: Share2,
  },
  {
    stepNumber: 4,
    title: "Track",
    description: "See analytics in real-time. Track clicks, views, and downloads with detailed insights.",
    icon: BarChart3,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-blue-500/10 opacity-0"
      data-scroll-animate
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes. It's that simple.
            </p>
          </div>

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
      </div>
    </section>
  );
}
