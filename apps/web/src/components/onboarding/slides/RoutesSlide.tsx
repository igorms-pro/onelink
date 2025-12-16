import { useTranslation } from "react-i18next";

export function RoutesSlide() {
  const { t } = useTranslation();

  return (
    <div className="text-center px-4 flex flex-col gap-y-4 md:gap-y-8">
      <div className="text-6xl">✨</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t("onboarding_routes_title")}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("onboarding_routes_description")}
      </p>
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          <strong>{t("onboarding_routes_example")}</strong>{" "}
          {t("onboarding_routes_example_text")}
        </p>
      </div>
    </div>
  );
}
