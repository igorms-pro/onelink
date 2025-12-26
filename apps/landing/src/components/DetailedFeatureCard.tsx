import type { LucideIcon } from "lucide-react";

export interface DetailedFeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: LucideIcon;
    details: string[];
  };
  index: number;
}

export function DetailedFeatureCard({
  feature,
  index,
}: DetailedFeatureCardProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 items-center">
      <div className={index % 2 === 1 ? "lg:order-2" : ""}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-4">
          <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {feature.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {feature.description}
        </p>
        <ul className="space-y-3">
          {feature.details.map((detail, detailIndex) => (
            <li
              key={detailIndex}
              className="flex items-start gap-3 text-gray-600 dark:text-gray-300"
            >
              <span className="mt-1 rounded-full bg-purple-500/10 p-1 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={index % 2 === 1 ? "lg:order-1" : ""}>
        {/* Screenshot placeholder */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-600 text-sm">
              SCREENSHOT: {feature.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
