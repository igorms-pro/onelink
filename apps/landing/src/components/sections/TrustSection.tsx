import { Shield, Lock, Database, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";

export function TrustSection() {
  const { t } = useTranslation();
  return (
    <section
      id="trust"
      className="py-16 md:py-24 bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20 opacity-0"
      data-scroll-animate
    >
      <Layout>
        <div className="w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm md:text-base font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                {t("landing.trust.badge")}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {t("landing.trust.title")}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              {t("landing.trust.subtitle")}
            </p>
          </div>

          {/* Two-Column Layout with Big Icons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column - Main Trust Badge */}
            <div className="relative">
              <div className="sticky top-8 rounded-3xl bg-white dark:bg-gray-900 p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
                <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Shield className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 text-foreground">
                  {t("landing.trust.gdprTitle")}
                </h3>
                <p className="text-base md:text-lg text-center text-muted-foreground mb-6">
                  {t("landing.trust.gdprDescription")}
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm md:text-base font-medium">
                    {t("landing.trust.certified")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Feature List */}
            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Lock className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                    {t("landing.trust.encryption.title")}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t("landing.trust.encryption.description")}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Database className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                    {t("landing.trust.hosting.title")}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t("landing.trust.hosting.description")}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <div className="shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                    {t("landing.trust.control.title")}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t("landing.trust.control.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
