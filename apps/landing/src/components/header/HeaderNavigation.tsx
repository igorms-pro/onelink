import { useTranslation } from "react-i18next";

interface HeaderNavigationProps {
  isHomePage: boolean;
  handleAnchorClick: (
    anchor: string,
  ) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function HeaderNavigation({
  isHomePage,
  handleAnchorClick,
}: HeaderNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav
      data-testid="header-navigation"
      className="hidden md:flex items-center gap-6"
    >
      <a
        href={isHomePage ? "#features" : "/#features"}
        onClick={handleAnchorClick("features")}
        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center cursor-pointer"
      >
        {t("landing.header.features")}
      </a>
      <a
        href={isHomePage ? "#pricing" : "/#pricing"}
        onClick={handleAnchorClick("pricing")}
        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center cursor-pointer"
      >
        {t("landing.header.pricing")}
      </a>
    </nav>
  );
}
