import { useTranslation } from "react-i18next";

export function FilesSlide() {
  const { t } = useTranslation();

  return (
    <div className="text-center px-4 flex flex-col gap-y-4 md:gap-y-8">
      <div className="text-6xl">📁</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t("onboarding_files_title")}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("onboarding_files_description")}
      </p>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>{t("onboarding_files_usecase")}</strong>{" "}
          {t("onboarding_files_usecase_text")}
        </p>
      </div>
    </div>
  );
}
