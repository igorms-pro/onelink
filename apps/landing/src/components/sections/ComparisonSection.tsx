import { Check, X } from "lucide-react";
import clsx from "clsx";
import { Layout } from "@/components/Layout";

interface ComparisonFeature {
  name: string;
  onelink: boolean | string;
  others: boolean | string;
}

export default function ComparisonSection() {
  const features: ComparisonFeature[] = [
    {
      name: "Bio Links",
      onelink: true,
      others: true,
    },
    {
      name: "File Sharing / Drops",
      onelink: true,
      others: false,
    },
    {
      name: "File Collection from Others",
      onelink: true,
      others: false,
    },
    {
      name: "Real-time Notifications",
      onelink: true,
      others: "Limited",
    },
    {
      name: "Analytics",
      onelink: true,
      others: true,
    },
    {
      name: "Custom Domain",
      onelink: true,
      others: true,
    },
    {
      name: "Privacy Controls",
      onelink: true,
      others: "Limited",
    },
    {
      name: "Dark/Light Theme",
      onelink: true,
      others: true,
    },
  ];

  return (
    <section
      id="comparison"
      className="py-16 md:py-24 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-blue-500/10 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Why OneLink?
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              More than just links. Everything you need in one powerful
              platform.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                  <th className="text-left py-6 px-6 font-bold text-lg md:text-xl lg:text-2xl text-foreground">
                    Feature
                  </th>
                  <th className="text-center py-6 px-6 font-bold text-lg md:text-xl lg:text-2xl text-foreground bg-purple-50/50 dark:bg-purple-900/20">
                    OneLink
                  </th>
                  <th className="text-center py-6 px-6 font-bold text-lg md:text-xl lg:text-2xl text-foreground">
                    Common Bio Links
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
                      index % 2 === 1 && "bg-gray-50/50 dark:bg-gray-800/50",
                    )}
                  >
                    <td className="py-6 px-6 text-base md:text-lg lg:text-xl font-semibold text-foreground">
                      {feature.name}
                    </td>
                    <td className="py-6 px-6 text-center bg-purple-50/30 dark:bg-purple-900/10">
                      {typeof feature.onelink === "boolean" ? (
                        feature.onelink ? (
                          <Check className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 md:h-7 md:w-7 lg:w-8 lg:h-8 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium">
                          {feature.onelink}
                        </span>
                      )}
                    </td>
                    <td className="py-6 px-6 text-center">
                      {typeof feature.others === "boolean" ? (
                        feature.others ? (
                          <Check className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium">
                          {feature.others}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </section>
  );
}
