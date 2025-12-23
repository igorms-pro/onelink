import { LucideIcon } from "lucide-react";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}

export default function StepCard({
  stepNumber,
  title,
  description,
  icon: Icon,
  isLast = false,
}: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center md:text-left md:items-start gap-4">
      {/* Step Number Circle */}
      <div className="relative flex items-center justify-center">
        <div className="flex items-center justify-center size-12 md:size-16 rounded-full bg-linear-to-r from-purple-500 to-purple-600 text-white font-bold text-lg md:text-xl shadow-lg shadow-purple-500/30 z-10">
          {stepNumber}
        </div>
        {/* Icon overlay on desktop */}
        <div className="hidden md:flex absolute -bottom-2 -right-2 items-center justify-center size-8 rounded-lg bg-background border-2 border-purple-500/30">
          <Icon className="size-4 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 md:pb-0">
        {/* Mobile: Show icon with title */}
        <div className="md:hidden mb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon className="size-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
        </div>
        {/* Desktop: Title only */}
        <div className="hidden md:block mb-2">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{description}</p>
      </div>

      {/* Connector Line */}
      {!isLast && (
        <>
          {/* Vertical line for mobile */}
          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-linear-to-b from-purple-500/30 to-purple-600/30 md:hidden" />

          {/* Horizontal line for desktop */}
          <div className="hidden md:block absolute left-8 top-8 right-0 h-0.5 bg-linear-to-r from-purple-500/30 via-purple-500/20 to-transparent -z-10" />
        </>
      )}
    </div>
  );
}
