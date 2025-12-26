import { Check, X } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";

interface ComparisonFeature {
  name: string;
  onelink: boolean | string;
  others: boolean | string;
}

export default function ComparisonSection() {
  const { t } = useTranslation();
  const features: ComparisonFeature[] = [
    {
      name: t("landing.comparison.features.bioLinks"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.fileSharing"),
      onelink: true,
      others: false,
    },
    {
      name: t("landing.comparison.features.fileCollection"),
      onelink: true,
      others: false,
    },
    {
      name: t("landing.comparison.features.notifications"),
      onelink: true,
      others: "Limited",
    },
    {
      name: t("landing.comparison.features.analytics"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.customDomain"),
      onelink: true,
      others: true,
    },
    {
      name: t("landing.comparison.features.privacyControls"),
      onelink: true,
      others: "Limited",
    },
    {
      name: t("landing.comparison.features.theme"),
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
                {t("landing.comparison.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              {t("landing.comparison.subtitle")}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-w-full inline-block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                    <th className="text-left py-4 px-3 sm:py-6 sm:px-6 font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-foreground">
                      {t("landing.comparison.feature")}
                    </th>
                    <th className="text-center py-4 px-2 sm:py-6 sm:px-6 font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-foreground bg-purple-50/50 dark:bg-purple-900/20">
                      {t("landing.comparison.onelink")}
                    </th>
                    <th className="text-center py-4 px-2 sm:py-6 sm:px-6 font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-foreground">
                      {t("landing.comparison.others")}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
