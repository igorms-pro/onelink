import { useTranslation } from "react-i18next";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

interface HeaderMobileMenuProps {
  isOpen: boolean;
  isHomePage: boolean;
  onClose: () => void;
  handleAnchorClick: (
    anchor: string,
  ) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function HeaderMobileMenu({
  isOpen,
  isHomePage,
  onClose,
  handleAnchorClick,
}: HeaderMobileMenuProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      data-testid="header-mobile-menu"
      className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4"
    >
      <nav className="flex flex-col gap-4">
        <a
          href={isHomePage ? "#features" : "/#features"}
          onClick={(e) => {
            handleAnchorClick("features")(e);
            onClose();
          }}
          className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center px-2 cursor-pointer"
        >
          {t("landing.header.features")}
        </a>
        <a
          href={isHomePage ? "#pricing" : "/#pricing"}
          onClick={(e) => {
            handleAnchorClick("pricing")(e);
            onClose();
          }}
          className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center px-2 cursor-pointer"
        >
          {t("landing.header.pricing")}
        </a>
        <div className="flex items-center gap-2 px-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          <LanguageToggleButton />
          <ThemeToggleButton />
        </div>
      </nav>
    </div>
  );
}
