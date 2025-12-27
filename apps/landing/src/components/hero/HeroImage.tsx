import { useState, useEffect, useRef } from "react";

// Hero image carousel with infinite loop sliding animation
// Images are automatically loaded from /images/hero/ directory
// Auto-rotates every 4 seconds with seamless infinite loop

const HERO_IMAGES = [
  "/images/hero/nora_hero_1.png",
  "/images/hero/elias_hero_1.png",
  "/images/hero/nora_hero_2.png",
  "/images/hero/elias_hero_2.png",
  "/images/hero/nora_hero_3.png",
  "/images/hero/elias_hero_3.png",
];

export function HeroImage() {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at first real image (after duplicate last)
  const [isTransitioning, setIsTransitioning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create infinite loop array: [last, ...images, first]
  const infiniteImages = [
    HERO_IMAGES[HERO_IMAGES.length - 1], // Duplicate last at start
    ...HERO_IMAGES,
    HERO_IMAGES[0], // Duplicate first at end
  ];

  // Auto-rotate carousel with infinite loop
  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        // If we've reached the duplicate first image at the end
        if (next >= infiniteImages.length - 1) {
          // After transition completes, jump back to first real image without transition
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(1);
            // Re-enable transitions on next frame
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setIsTransitioning(true);
              });
            });
          }, 700); // Wait for CSS transition to complete (700ms)
        }

        return next;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full mx-auto lg:mx-0 order-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-end-3">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
        <div className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden">
          {/* Sliding container with all images (including duplicates) */}
          <div
            ref={containerRef}
            className={`flex h-full ease-in-out ${
              isTransitioning ? "transition-transform duration-700" : ""
            }`}
            style={{
              transform: `translateX(-${(currentIndex * 100) / infiniteImages.length}%)`,
              width: `${infiniteImages.length * 100}%`,
            }}
          >
            {infiniteImages.map((url, index) => {
              // Map index to original image index for test IDs
              let originalIndex = index - 1; // Account for duplicate last at start
              if (originalIndex < 0) originalIndex = HERO_IMAGES.length - 1; // Last image
              if (originalIndex >= HERO_IMAGES.length) originalIndex = 0; // First image (duplicate)

              return (
                <div
                  key={index}
                  className="h-full flex-shrink-0"
                  style={{ width: `${100 / infiniteImages.length}%` }}
                >
                  <img
                    src={url}
                    alt={`OneLink hero image ${originalIndex + 1}`}
                    className="w-full h-full object-cover"
                    data-testid={`hero-marketing-image-${originalIndex}`}
                    onError={(e) => {
                      console.error(`Failed to load image: ${url}`);
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
