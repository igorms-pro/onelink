import { useState, useEffect } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

export function useOnboardingCarousel(api: CarouselApi | undefined) {
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  return { current, count };
}
