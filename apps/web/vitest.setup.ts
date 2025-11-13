import "@testing-library/jest-dom";
import { vi } from "vitest";
import enTranslations from "./src/lib/locales/en.json";

// Helper function to get nested translation value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTranslation = (key: string, translations: any): any => {
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
  // Return the value as-is (could be string, object, or array)
  return value;
};

// Mock react-i18next to return English translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number | boolean>) => {
      const translation = getTranslation(key, enTranslations);

      // Handle returnObjects option
      if (params && params.returnObjects === true) {
        // Return the translation as-is if it's an object/array
        if (typeof translation === "object" && translation !== null) {
          return translation;
        }
        // If translation is a string but returnObjects is true, return the key
        return key;
      }

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

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
