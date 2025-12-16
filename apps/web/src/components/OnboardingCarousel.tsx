import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { setOnboardingCompleted } from "@/lib/onboarding";
import {
  WelcomeSlide,
  RoutesSlide,
  FilesSlide,
  GetStartedSlide,
  OnboardingHeader,
  OnboardingDots,
  OnboardingButton,
  OnboardingBackground,
  useOnboardingCarousel,
} from "./onboarding";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

const SLIDE_COUNT = 4;

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const { current, count } = useOnboardingCarousel(api);

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
      <OnboardingBackground />
      <OnboardingHeader onSkip={handleSkip} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 md:pt-0 relative z-10 w-full max-w-md sm:max-w-lg mx-auto">
        {/* Carousel */}
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <WelcomeSlide />
            </CarouselItem>
            <CarouselItem>
              <RoutesSlide />
            </CarouselItem>
            <CarouselItem>
              <FilesSlide />
            </CarouselItem>
            <CarouselItem>
              <GetStartedSlide />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <OnboardingDots
          count={SLIDE_COUNT}
          current={current}
          onDotClick={(index) => api?.scrollTo(index)}
        />

        <OnboardingButton
          isLastSlide={current === count}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
