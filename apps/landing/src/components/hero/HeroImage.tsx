import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Marketing/Lifestyle hero image carousel
// Supports multiple images via environment variable
// Example: VITE_HERO_IMAGES='["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"]'
// Or single image: VITE_HERO_IMAGE_URL="/images/hero-marketing.jpg"

// Image Ideas for Marketing Carousel:
// 1. Creator/Influencer using OneLink on phone (lifestyle photo)
// 2. Freelancer showing their portfolio link (professional photo)
// 3. Business person sharing their OneLink (corporate photo)
// 4. Person with phone showing OneLink profile (casual photo)
// 5. Team collaborating with OneLink (group photo)

export function HeroImage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<Array<{ url: string; alt: string }>>([]);

  useEffect(() => {
    // Get images from environment variable
    const heroImageUrl = import.meta.env.VITE_HERO_IMAGE_URL;
    const heroImagesEnv = import.meta.env.VITE_HERO_IMAGES
      ? JSON.parse(import.meta.env.VITE_HERO_IMAGES)
      : null;

    if (heroImagesEnv && Array.isArray(heroImagesEnv)) {
      // Multiple images - create carousel
      setImages(
        heroImagesEnv.map((url: string) => ({
          url,
          alt: "OneLink - Share everything with one link",
        })),
      );
    } else if (heroImageUrl) {
      // Single image
      setImages([
        {
          url: heroImageUrl,
          alt: "OneLink - Share everything with one link",
        },
      ]);
    }
  }, []);

  // Auto-rotate carousel if multiple images
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  return (
    <div className="relative w-full mx-auto lg:mx-0 order-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-end-3">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
        {hasImages ? (
          <>
            {/* Image Carousel */}
            <div className="relative aspect-[4/5] md:aspect-square w-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded-2xl"
                    data-testid="hero-marketing-image"
                  />
                </div>
              ))}

              {/* Navigation Arrows (only if multiple images) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                </>
              )}

              {/* Dots Indicator (only if multiple images) */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
          </>
        ) : (
          <div className="aspect-[4/5] md:aspect-square w-full flex items-center justify-center bg-linear-to-br from-purple-100 via-purple-50 to-blue-100 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-blue-900/30 rounded-2xl">
            <div className="text-center px-6">
              <p
                data-testid="hero-image-placeholder"
                className="text-muted-foreground text-sm md:text-base font-medium mb-2"
              >
                Marketing Images Carousel
              </p>
              <p className="text-muted-foreground text-xs md:text-sm opacity-70 mb-4">
                Add your marketing/lifestyle images
                <br />
                Set VITE_HERO_IMAGES in .env
              </p>
              <div className="text-left text-xs text-muted-foreground opacity-60 space-y-1 mt-4">
                <p className="font-semibold">Image Ideas:</p>
                <p>• Creator using OneLink (lifestyle)</p>
                <p>• Freelancer portfolio showcase</p>
                <p>• Business professional sharing</p>
                <p>• Person with phone showing profile</p>
                <p>• Team collaboration photo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
