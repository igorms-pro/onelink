import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 transition-all hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
      {/* Icon */}
      <div className="mb-4 flex items-center justify-center size-12 md:size-14 rounded-xl bg-linear-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 group-hover:from-purple-500/20 group-hover:to-purple-600/20 dark:group-hover:from-purple-500/30 dark:group-hover:to-purple-600/30 transition-all">
        <Icon className="size-6 md:size-7 text-purple-600 dark:text-purple-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
}
