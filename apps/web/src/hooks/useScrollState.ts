import { useEffect, useState } from "react";

/**
 * Custom hook to track scroll state
 * Returns whether user is currently scrolling and if content is scrollable
 */
export function useScrollState(scrollDelay = 150) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const checkScrollable = () => {
      setIsScrollable(document.body.scrollHeight > window.innerHeight);
    };

    const handleScroll = () => {
      if (!isScrollable) return;

      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, scrollDelay);
    };

    checkScrollable();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkScrollable);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollable);
      clearTimeout(scrollTimeout);
    };
  }, [isScrollable, scrollDelay]);

  return { isScrolling, isScrollable };
}
