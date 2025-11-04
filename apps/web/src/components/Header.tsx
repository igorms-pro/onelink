import { Moon, Sun, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../lib/i18n";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export function Header() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("theme") || "system",
  );
  const [isDark, setIsDark] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: string) => {
      let actualTheme = t;
      if (t === "system") {
        actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      setIsDark(actualTheme === "dark");
      if (actualTheme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      }
    };
    apply(theme);
    localStorage.setItem("theme", theme);
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    const current = localStorage.getItem("theme") || "system";
    if (current === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "light" : "dark");
    } else if (current === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isLangOpen]);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <header className="w-full flex items-center justify-between p-4 md:p-6">
      <div className="flex-1" /> {/* Spacer */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language Toggle */}
        <div className="relative" ref={langDropdownRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-1"
            aria-label="Change language"
          >
            <span className="text-base">{currentLang.flag}</span>
            <Languages className="w-4 h-4" />
          </button>

          {/* Language Dropdown */}
          {isLangOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    i18n.language === lang.code
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
