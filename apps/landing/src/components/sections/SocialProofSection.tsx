import { useTranslation } from "react-i18next";

export function SocialProofSection() {
  const { t } = useTranslation();

  const userCount = 1000; // Placeholder count

  return (
    <section
      className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 opacity-0"
      data-scroll-animate
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t("landing.socialProof.title")}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t("landing.socialProof.userCount", { count: userCount })}
          </p>

          {/* Trust badges placeholder */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Creator
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Freelancer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-900/30"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Business
              </span>
            </div>
          </div>

          {/* Testimonials placeholder - empty for now, can add later */}
          <div className="mt-12">
            {/* Placeholder for testimonials carousel - will be added later */}
          </div>
        </div>
      </div>
    </section>
  );
}
