import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LanguageToggleButton } from "@/components/LanguageToggleButton";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 min-h-[44px] min-w-[44px]"
          >
            <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              OneLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/features"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center"
            >
              Pricing
            </Link>
          </nav>

          {/* Actions */}
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
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <nav className="flex flex-col gap-4">
              <Link
                to="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center px-2"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors min-h-[44px] flex items-center px-2"
              >
                Pricing
              </Link>
              <div className="flex items-center gap-2 px-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <LanguageToggleButton />
                <ThemeToggleButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
