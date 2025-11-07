import { Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../lib/i18n";

const languages = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "PT", name: "Português", flag: "🇵🇹" },
  { code: "BR", name: "Português (Brasil)", flag: "🇧🇷", langCode: "pt-BR" },
  { code: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "ZH", name: "中文", flag: "🇨🇳" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "RU", name: "Русский", flag: "🇷🇺" },
];

export function LanguageToggleButton() {
  const { i18n, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Use i18n.language directly - it will automatically update when language changes
  // via react-i18next's React Context
  const currentLangCode = i18n.language || localStorage.getItem("lang") || "en";

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

  return (
    <div className="relative" ref={langDropdownRef}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
        aria-label={t("aria_change_language")}
      >
        <Languages className="w-5 h-5" />
      </button>

      {/* Language Dropdown */}
      {isLangOpen && (
        <div className="absolute left-0 bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] min-w-[180px] max-h-[320px] overflow-y-auto">
          {languages.map((lang) => {
            const actualLangCode = lang.langCode || lang.code.toLowerCase();
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(actualLangCode);
                  setIsLangOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                  currentLangCode === actualLangCode
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
