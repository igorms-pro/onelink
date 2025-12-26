import { Check, X } from "lucide-react";
import clsx from "clsx";
import type { PricingFeature } from "@/data/pricingFeatures";

interface FeatureTableRowProps {
  feature: PricingFeature;
  index: number;
}

export function FeatureTableRow({ feature, index }: FeatureTableRowProps) {
  return (
    <tr
      className={clsx(
        "border-b border-gray-200 dark:border-gray-700",
        index % 2 === 0 && "bg-white dark:bg-gray-900",
        index % 2 === 1 && "bg-gray-50 dark:bg-gray-800/50",
      )}
    >
      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
        {feature.name}
      </td>
      <td className="py-4 px-4 text-center">
        {typeof feature.free === "boolean" ? (
          feature.free ? (
            <Check className="h-5 w-5 text-green-500 mx-auto" />
          ) : (
            <X className="h-5 w-5 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {feature.free}
          </span>
        )}
      </td>
      <td className="py-4 px-4 text-center bg-purple-50/50 dark:bg-purple-900/10">
        {typeof feature.pro === "boolean" ? (
          feature.pro ? (
            <Check className="h-5 w-5 text-green-500 mx-auto" />
          ) : (
            <X className="h-5 w-5 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {feature.pro}
          </span>
        )}
      </td>
    </tr>
  );
}
