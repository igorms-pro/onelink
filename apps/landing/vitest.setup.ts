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
    dismiss: vi.fn(),
  },
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  initAnalytics: vi.fn(),
  trackEvent: vi.fn(),
  trackSignUpClick: vi.fn(),
  trackPricingView: vi.fn(),
  trackCTAClick: vi.fn(),
  trackScrollDepth: vi.fn(),
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  const React = await import("react");
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
    }) => {
      return React.createElement("a", { href: to, ...props }, children);
    },
    useNavigate: () => vi.fn(),
  };
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock scrollAnimation globally
vi.mock("@/lib/scrollAnimation", () => ({
  initScrollAnimations: vi.fn(() => vi.fn()), // Returns cleanup function
}));

// Mock useScrollDepth hook globally
vi.mock("@/hooks/useScrollDepth", () => ({
  useScrollDepth: vi.fn(),
}));
