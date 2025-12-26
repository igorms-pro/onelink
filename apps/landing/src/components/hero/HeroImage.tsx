export function HeroImage() {
  return (
    <div className="relative w-full mx-auto lg:mx-0 order-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-end-3">
      <div className="relative rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 shadow-2xl shadow-purple-500/20 p-4 md:p-6 overflow-hidden">
        <div className="aspect-square w-full flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <p
            data-testid="hero-image-placeholder"
            className="text-muted-foreground text-sm md:text-base font-medium"
          >
            PORTRAIT IMAGE
          </p>
        </div>
      </div>
    </div>
  );
}
