import { Check, X } from "lucide-react";
import clsx from "clsx";
import type { ComparisonFeature } from "@/data/comparisonFeatures";

interface ComparisonTableRowProps {
  feature: ComparisonFeature;
  index: number;
}

export function ComparisonTableRow({
  feature,
  index,
}: ComparisonTableRowProps) {
  return (
    <tr
      className={clsx(
        "border-b border-gray-200 dark:border-gray-700",
        index % 2 === 0 && "bg-white dark:bg-gray-900",
        index % 2 === 1 && "bg-gray-50/50 dark:bg-gray-800/50",
      )}
    >
      <td className="py-4 px-3 sm:py-6 sm:px-6 text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-foreground">
        {feature.name}
      </td>
      <td className="py-4 px-2 sm:py-6 sm:px-6 text-center bg-purple-50/30 dark:bg-purple-900/10">
        {typeof feature.onelink === "boolean" ? (
          feature.onelink ? (
            <Check className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-500 mx-auto" />
          ) : (
            <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:w-8 lg:h-8 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-medium">
            {feature.onelink}
          </span>
        )}
      </td>
      <td className="py-4 px-2 sm:py-6 sm:px-6 text-center">
        {typeof feature.others === "boolean" ? (
          feature.others ? (
            <Check className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-500 mx-auto" />
          ) : (
            <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:w-8 lg:h-8 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-medium">
            {feature.others}
          </span>
        )}
      </td>
    </tr>
  );
}
