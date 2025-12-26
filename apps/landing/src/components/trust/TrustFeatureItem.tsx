import type { LucideIcon } from "lucide-react";

interface TrustFeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function TrustFeatureItem({
  icon: Icon,
  title,
  description,
}: TrustFeatureItemProps) {
  return (
    <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
      <div className="shrink-0">
        <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div>
        <h4 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
          {title}
        </h4>
        <p className="text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
