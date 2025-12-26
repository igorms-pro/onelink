import { useTranslation } from "react-i18next";

export function ComparisonTableHeader() {
  const { t } = useTranslation();

  return (
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
  );
}
