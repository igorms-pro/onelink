import { useEffect, useRef } from "react";
import { trackScrollDepth } from "@/lib/analytics";

/**
 * Hook to track scroll depth on the page
 * Tracks at 25%, 50%, 75%, and 100% scroll depth
 */
export function useScrollDepth() {
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = Math.round((scrollTop / scrollableHeight) * 100);

      // Track at 25%, 50%, 75%, and 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (
          scrollPercentage >= milestone &&
          !trackedDepths.current.has(milestone)
        ) {
          trackedDepths.current.add(milestone);
          trackScrollDepth(milestone);
        }
      });
    };

    // Throttle scroll events
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);
}
