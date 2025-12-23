import { useTranslation } from "react-i18next";

export function DemoSection() {
  const { t } = useTranslation();

  return (
    <section
      id="demo"
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-br from-purple-500/5 via-purple-500/3 to-blue-500/5 dark:from-purple-500/10 dark:via-purple-500/5 dark:to-blue-500/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t("landing.demo.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("landing.demo.description")}
          </p>
        </div>

        {/* Device Mockup Container */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* MacBook Frame */}
            <div className="relative rounded-lg border-8 border-gray-800 dark:border-gray-700 bg-gray-800 dark:bg-gray-700 shadow-2xl">
              {/* MacBook Top Bar */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-gray-700 rounded-t-lg"></div>
              
              {/* Screen Content */}
              <div className="aspect-video bg-white dark:bg-gray-900 rounded overflow-hidden">
                <div className="h-full flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <p className="text-muted-foreground text-sm md:text-base font-medium">
                    SCREENSHOT: Dashboard in Action
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
