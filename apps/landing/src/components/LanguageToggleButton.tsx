import { Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageDropdown } from "@/components/language/LanguageDropdown";
import { languages } from "@/data/languages";

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
        className="p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 cursor-pointer"
        aria-label={t("aria_change_language")}
      >
        <Languages className="w-5 h-5" />
      </button>

      <LanguageDropdown
        isOpen={isLangOpen}
        currentLangCode={currentLangCode}
        onLanguageSelect={() => {}}
        onClose={() => setIsLangOpen(false)}
        languages={languages}
      />
    </div>
  );
}
