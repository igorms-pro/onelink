interface OnboardingDotsProps {
  count: number;
  current: number;
  onDotClick: (index: number) => void;
}

export function OnboardingDots({
  count,
  current,
  onDotClick,
}: OnboardingDotsProps) {
  return (
    <div className="flex justify-center gap-2 my-8">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            index + 1 === current
              ? "bg-purple-600 w-8"
              : "bg-gray-300 dark:bg-gray-600 w-2"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
