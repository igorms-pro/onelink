import { Languages } from "lucide-react";
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

export function LanguageToggleButton() {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Force re-render when language changes
  const [langKey, setLangKey] = useState(() => {
    return localStorage.getItem("lang") || i18n.language || "en";
  });

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLangKey(lng);
    };
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Sync with i18n on mount
  useEffect(() => {
    if (i18n.language && i18n.language !== langKey) {
      setLangKey(i18n.language);
    }
  }, [i18n.language, langKey]);

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

  const currentLang = languages.find((l) => l.code === langKey) || languages[0];

  return (
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
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px] max-w-[calc(100vw-2rem)] overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setLangKey(lang.code);
                setIsLangOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                langKey === lang.code
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
  );
}
