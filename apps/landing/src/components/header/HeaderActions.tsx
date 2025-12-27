import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";

interface HeaderActionsProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function HeaderActions({
  mobileMenuOpen,
  onToggleMobileMenu,
}: HeaderActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2">
        <LanguageToggleButton />
        <ThemeToggleButton />
      </div>
      <Button
        data-testid="header-sign-in"
        size="sm"
        className="bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white min-h-[44px]"
        onClick={() => {
          window.location.href = "https://app.getonelink.io/auth";
        }}
      >
        {t("landing.header.signIn")}
      </Button>

      {/* Mobile Menu Button */}
      <button
        data-testid="header-mobile-menu-button"
        onClick={onToggleMobileMenu}
        className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
