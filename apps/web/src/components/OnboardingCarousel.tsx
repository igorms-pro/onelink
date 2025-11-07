import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { setOnboardingCompleted } from "@/lib/onboarding";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { LanguageToggleButton } from "./LanguageToggleButton";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const slides = [
    {
      title: t("onboarding_welcome_title"),
      description: t("onboarding_welcome_description"),
      icon: "🔗",
    },
    {
      title: t("onboarding_routes_title"),
      description: t("onboarding_routes_description"),
      icon: "✨",
      exampleLabel: t("onboarding_routes_example"),
      exampleText: t("onboarding_routes_example_text"),
    },
    {
      title: t("onboarding_files_title"),
      description: t("onboarding_files_description"),
      icon: "📁",
      usecaseLabel: t("onboarding_files_usecase"),
      usecaseText: t("onboarding_files_usecase_text"),
    },
    {
      title: t("onboarding_getstarted_title"),
      description: t("onboarding_getstarted_description"),
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
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Background image - light mode */}
      <div
        className="fixed inset-0 dark:hidden pointer-events-none"
        style={{
          backgroundImage: "url(/screen.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      ></div>

      {/* Background image - dark mode */}
      <div
        className="fixed inset-0 hidden dark:block pointer-events-none"
        style={{
          backgroundImage: "url(/screen-dark.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      ></div>

      {/* Header container with max-width */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between p-4 md:p-6 lg:p-8">
          {/* Logo */}
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center p-2">
            <img
              src="/logo.png"
              alt="OneLink"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Theme, Language toggles, and Skip button */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <LanguageToggleButton />
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium bg-purple-600/90 hover:bg-purple-600 text-white transition-all rounded-lg shadow-md hover:shadow-lg active:scale-[0.98]"
              aria-label={t("onboarding_skip")}
            >
              {t("onboarding_skip")}
            </button>
          </div>
        </div>
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-md mx-auto">
        {/* Carousel */}
        <Carousel setApi={setApi} className="w-full">
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
                  {slide.exampleLabel && slide.exampleText && (
                    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        <strong>{slide.exampleLabel}</strong>{" "}
                        {slide.exampleText}
                      </p>
                    </div>
                  )}
                  {slide.usecaseLabel && slide.usecaseText && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>{slide.usecaseLabel}</strong>{" "}
                        {slide.usecaseText}
                      </p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 my-8">
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
        <div className="w-full pb-8">
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-3.5 text-base font-medium hover:from-purple-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg"
          >
            {current === count
              ? t("onboarding_getstarted_button")
              : t("onboarding_next")}
          </button>
        </div>
      </div>
    </div>
  );
}
