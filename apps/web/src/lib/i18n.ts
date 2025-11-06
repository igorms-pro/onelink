import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "./locales/en.json";
import frTranslations from "./locales/fr.json";
import esTranslations from "./locales/es.json";
import ptTranslations from "./locales/pt.json";
import ptBRTranslations from "./locales/pt-BR.json";
import jaTranslations from "./locales/ja.json";
import zhTranslations from "./locales/zh.json";
import deTranslations from "./locales/de.json";
import itTranslations from "./locales/it.json";
import ruTranslations from "./locales/ru.json";

// Configure i18next
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Available languages (same as neodash-ui)
      supportedLngs: [
        "en",
        "fr",
        "es",
        "pt",
        "pt-BR",
        "ja",
        "zh",
        "de",
        "it",
        "ru",
      ],

      // Default language
      fallbackLng: "en",

      // Language detection options
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "lang", // Use "lang" key in localStorage
      },

      // Interpolation options
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      // Translation resources
      resources: {
        en: {
          translation: enTranslations,
        },
        fr: {
          translation: frTranslations,
        },
        es: {
          translation: esTranslations,
        },
        pt: {
          translation: ptTranslations,
        },
        "pt-BR": {
          translation: ptBRTranslations,
        },
        ja: {
          translation: jaTranslations,
        },
        zh: {
          translation: zhTranslations,
        },
        de: {
          translation: deTranslations,
        },
        it: {
          translation: itTranslations,
        },
        ru: {
          translation: ruTranslations,
        },
      },

      // React integration
      react: {
        useSuspense: false,
      },
    });
}

export function setLanguage(lang: string) {
  // Save to localStorage first (before changeLanguage)
  localStorage.setItem("lang", lang);
  // Change language - this will automatically trigger re-renders in all components
  // using useTranslation() via react-i18next's React Context
  // The promise resolves when the language change is complete
  i18n.changeLanguage(lang).catch((err) => {
    console.error("Error changing language:", err);
  });
}

export default i18n;
