import { useTranslation } from "react-i18next";

export function GetStartedSlide() {
  const { t } = useTranslation();

  return (
    <div className="text-center px-4 flex flex-col gap-y-4 md:gap-y-8">
      <div className="text-6xl">🚀</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t("onboarding_getstarted_title")}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("onboarding_getstarted_description")}
      </p>
    </div>
  );
}
