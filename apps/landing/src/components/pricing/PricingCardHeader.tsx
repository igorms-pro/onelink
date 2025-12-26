interface PricingCardHeaderProps {
  name: string;
  price: string;
  description: string;
}

export function PricingCardHeader({
  name,
  price,
  description,
}: PricingCardHeaderProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm md:text-base font-medium uppercase tracking-wide text-purple-600 dark:text-purple-300">
        {name}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          {price}
        </span>
      </div>
      <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
