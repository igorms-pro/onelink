import { useState, useEffect } from "react";

// Hero image carousel with sliding animation
// Images are automatically loaded from /images/hero/ directory
// Auto-rotates every 4 seconds with smooth sliding transition

const HERO_IMAGES = [
  "/images/hero/nora_hero_1.png",
  "/images/hero/elias_hero_1.png",
  "/images/hero/nora_hero_2.png",
  "/images/hero/elias_hero_2.png",
  "/images/hero/nora_hero_3.png",
  "/images/hero/elias_hero_3.png",
];

export function HeroImage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        // Ensure we never go out of bounds
        return next >= 0 && next < HERO_IMAGES.length ? next : 0;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full mx-auto lg:mx-0 order-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-end-3">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
        <div className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden">
          {/* Sliding container with all images */}
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / HERO_IMAGES.length}%)`,
              width: `${HERO_IMAGES.length * 100}%`,
            }}
          >
            {HERO_IMAGES.map((url, index) => (
              <div
                key={index}
                className="h-full flex-shrink-0"
                style={{ width: `${100 / HERO_IMAGES.length}%` }}
              >
                <img
                  src={url}
                  alt={`OneLink hero image ${index + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`hero-marketing-image-${index}`}
                  onError={(e) => {
                    console.error(`Failed to load image: ${url}`);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
