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

// Mock supabase globally to prevent real client creation in CI
// This must be before any modules import @/lib/supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      upsert: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
    rpc: vi.fn(() => ({
      data: [],
      error: null,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        setTimeout(() => callback("SUBSCRIBED"), 0);
        return { unsubscribe: vi.fn() };
      }),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: "https://example.com/file.pdf" },
        })),
      })),
    },
  },
}));
