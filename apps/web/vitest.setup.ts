import "@testing-library/jest-dom";
import enTranslations from "./src/lib/locales/en.json";

// Helper function to get nested translation value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTranslation = (key: string, translations: any): string => {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  // If value is an object (like nested sections), return the key
  // Otherwise return the string value
  return typeof value === "string" ? value : key;
};

// Mock react-i18next to return English translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translation = getTranslation(key, enTranslations);
      // Simple interpolation for {{param}} patterns
      if (params && typeof translation === "string") {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }
      return translation;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: "en",
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
