import type { Language } from "@/data/languages";
import { setLanguage } from "@/lib/i18n";

interface LanguageDropdownProps {
  isOpen: boolean;
  currentLangCode: string;
  onLanguageSelect: (langCode: string) => void;
  onClose: () => void;
  languages: Language[];
}

export function LanguageDropdown({
  isOpen,
  currentLangCode,
  onLanguageSelect,
  onClose,
  languages,
}: LanguageDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px] max-h-[320px] overflow-y-auto pointer-events-auto">
      {languages.map((lang) => {
        const actualLangCode = lang.langCode || lang.code.toLowerCase();
        return (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(actualLangCode);
              onLanguageSelect(actualLangCode);
              onClose();
            }}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer ${
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
  );
}
