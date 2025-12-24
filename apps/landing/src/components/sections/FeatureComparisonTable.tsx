import { Check, X } from "lucide-react";
import clsx from "clsx";
import { Layout } from "@/components/Layout";

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

export function FeatureComparisonTable() {
  const features: Feature[] = [
    {
      name: "Links",
      free: "5 links",
      pro: "Unlimited",
    },
    {
      name: "Drops",
      free: "3 drops",
      pro: "Unlimited",
    },
    {
      name: "File Size",
      free: "50MB per file",
      pro: "2GB per file",
    },
    {
      name: "File Retention",
      free: "7 days",
      pro: "90 days",
    },
    {
      name: "Analytics",
      free: "Basic (7-day history)",
      pro: "Advanced (30 & 90-day history)",
    },
    {
      name: "Custom Domain",
      free: false,
      pro: true,
    },
    {
      name: "Google Analytics Integration",
      free: false,
      pro: true,
    },
    {
      name: "Priority Support",
      free: false,
      pro: true,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
      <Layout className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Compare Plans
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            See what's included in each plan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                  Feature
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                  Free
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white bg-purple-50 dark:bg-purple-900/20">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
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
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </section>
  );
}
