import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage } from "../src/lib/i18n";
import i18n from "../src/lib/i18n";

describe("i18n", () => {
  beforeEach(() => {
    // Reset to English before each test
    setLanguage("en");
  });

  it("changes language correctly", () => {
    setLanguage("fr");
    expect(i18n.language).toBe("fr");

    setLanguage("pt");
    expect(i18n.language).toBe("pt");
  });

  it("persists language in localStorage", () => {
    setLanguage("es");
    const stored = localStorage.getItem("lang");
    expect(stored).toBe("es");
  });

  it("has translations for all supported languages", () => {
    const languages = ["en", "fr", "es", "pt", "pt-BR", "ja", "zh", "de", "it", "ru"];
    
    languages.forEach((lang) => {
      setLanguage(lang);
      expect(i18n.language).toBe(lang);
      // Check that basic translations exist
      expect(i18n.t("app_title")).toBeDefined();
      expect(i18n.t("app_tagline")).toBeDefined();
    });
  });
});

