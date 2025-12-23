// Initialize scroll animations for all elements with data-scroll-animate attribute
export function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          entry.target.classList.remove("opacity-0");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  // Observe all elements with data-scroll-animate attribute
  const elements = document.querySelectorAll("[data-scroll-animate]");
  elements.forEach((el) => observer.observe(el));

  return () => {
    elements.forEach((el) => observer.unobserve(el));
  };
}
