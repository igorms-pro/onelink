import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { setOnboardingCompleted } from "@/lib/onboarding";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const slides = [
    {
      title: "Welcome to OneLink",
      description: "Share a single link. Route by intent.",
      icon: "🔗",
    },
    {
      title: "Create Routes",
      description:
        "Add multiple links and organize them by intent. Visitors choose where to go based on their needs.",
      icon: "✨",
    },
    {
      title: "Receive Files",
      description:
        "Create file drops where visitors can submit files directly to you without logging in.",
      icon: "📁",
    },
    {
      title: "Get Started",
      description:
        "Sign in to create your OneLink profile and start sharing your single link everywhere.",
      icon: "🚀",
    },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleNext = () => {
    if (current < count) {
      api?.scrollNext();
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setOnboardingCompleted();
    onComplete();
    navigate("/auth");
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col relative">
      {/* Background image - light mode */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: "url(/screen.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Background image - dark mode */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: "url(/screen-dark.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
        aria-label="Skip onboarding"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Carousel */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <Carousel setApi={setApi} className="w-full max-w-sm">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="text-center px-4">
                  <div className="text-6xl mb-6">{slide.icon}</div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {slide.description}
                  </p>
                  {index === 1 && (
                    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        <strong>Example:</strong> Link to your calendar,
                        portfolio, or contact form - all from one URL!
                      </p>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Use case:</strong> Collect resumes, design
                        files, or documents without email attachments.
                      </p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mb-8 relative z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index + 1 === current
                ? "bg-purple-600 w-8"
                : "bg-gray-300 dark:bg-gray-600 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Next/Get Started button */}
      <div className="px-6 pb-8 relative z-10">
        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg"
        >
          {current === count ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
