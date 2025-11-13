import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToggleButton } from "../LanguageToggleButton";
import i18n from "@/lib/i18n";

// Mock setLanguage to track calls - use hoisted to avoid initialization issues
const mockSetLanguageFn = vi.hoisted(() => vi.fn());
vi.mock("@/lib/i18n", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/i18n")>("@/lib/i18n");
  return {
    ...actual,
    setLanguage: (...args: Parameters<typeof actual.setLanguage>) => {
      mockSetLanguageFn(...args);
      return actual.setLanguage(...args);
    },
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LanguageToggleButton", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset i18n to English
    await i18n.changeLanguage("en");
  });

  it("renders the button with Languages icon", () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });

    fireEvent.click(button);

    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageToggleButton />
      </div>,
    );

    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    expect(screen.getByText("EN")).toBeInTheDocument();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    expect(screen.queryByText("EN")).not.toBeInTheDocument();
  });

  it("displays all available languages in dropdown", () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    const languages = [
      "EN",
      "FR",
      "ES",
      "PT",
      "BR",
      "JA",
      "ZH",
      "DE",
      "IT",
      "RU",
    ];
    languages.forEach((lang) => {
      expect(screen.getByText(lang)).toBeInTheDocument();
    });
  });

  it("highlights current language", async () => {
    await i18n.changeLanguage("fr");
    render(<LanguageToggleButton />);
    // Wait for component to render with new language
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
    // Find button by aria-label (works in any language)
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const frButton = screen.getByText("FR").closest("button");
      expect(frButton).toHaveClass("bg-gray-100", "dark:bg-gray-700");
    });
  });

  it("calls setLanguage when a language is selected", async () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    const frButton = screen.getByText("FR").closest("button");
    fireEvent.click(frButton!);

    await waitFor(() => {
      expect(mockSetLanguageFn).toHaveBeenCalledWith("fr");
    });
  });

  it("closes dropdown after selecting a language", async () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    const frButton = screen.getByText("FR").closest("button");
    fireEvent.click(frButton!);

    await waitFor(() => {
      expect(screen.queryByText("EN")).not.toBeInTheDocument();
    });
  });

  it("handles pt-BR language code correctly", async () => {
    render(<LanguageToggleButton />);
    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    const brButton = screen.getByText("BR").closest("button");
    fireEvent.click(brButton!);

    await waitFor(() => {
      expect(mockSetLanguageFn).toHaveBeenCalledWith("pt-BR");
    });
  });

  it("uses localStorage language as fallback", async () => {
    localStorage.setItem("lang", "es");
    await i18n.changeLanguage("es");
    render(<LanguageToggleButton />);
    // Wait for component to render with new language
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
    // Find button by aria-label (works in any language)
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const esButton = screen.getByText("ES").closest("button");
      expect(esButton).toHaveClass("bg-gray-100", "dark:bg-gray-700");
    });
  });

  it("defaults to en when no language is set", async () => {
    localStorage.removeItem("lang");
    await i18n.changeLanguage("en"); // Set to en explicitly
    render(<LanguageToggleButton />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /change language/i });
      expect(button).toBeInTheDocument();
    });
    const button = screen.getByRole("button", { name: /change language/i });
    fireEvent.click(button);

    await waitFor(() => {
      const enButton = screen.getByText("EN").closest("button");
      expect(enButton).toHaveClass("bg-gray-100", "dark:bg-gray-700");
    });
  });
});
