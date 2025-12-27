import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HeaderLogo } from "@/components/header/HeaderLogo";
import { HeaderNavigation } from "@/components/header/HeaderNavigation";
import { HeaderMobileMenu } from "@/components/header/HeaderMobileMenu";
import { HeaderActions } from "@/components/header/HeaderActions";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleAnchorClick =
    (anchor: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isHomePage) {
        e.preventDefault();
        window.location.href = `/#${anchor}`;
      }
    };

  return (
    <header
      data-testid="header"
      className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
      <Layout>
        <div className="flex h-16 items-center justify-between">
          <HeaderLogo />
          <HeaderNavigation
            isHomePage={isHomePage}
            handleAnchorClick={handleAnchorClick}
          />
          <HeaderActions
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>

        <HeaderMobileMenu
          isOpen={mobileMenuOpen}
          isHomePage={isHomePage}
          onClose={() => setMobileMenuOpen(false)}
          handleAnchorClick={handleAnchorClick}
        />
      </Layout>
    </header>
  );
}
