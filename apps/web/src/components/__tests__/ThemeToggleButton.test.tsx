import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeToggleButton } from "../ThemeToggleButton";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the button with moon icon when theme is light", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button", { name: /aria_toggle_theme/i });
    expect(button).toBeInTheDocument();
    // Moon icon should be visible (light mode)
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the button with sun icon when theme is dark", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggleButton />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("toggles from light to dark", async () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button", { name: /aria_toggle_theme/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  it("toggles from dark to light", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggleButton />);
    const button = screen.getByRole("button", { name: /aria_toggle_theme/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  it("toggles from system to light when system prefers dark", async () => {
    localStorage.setItem("theme", "system");
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true, // prefers dark
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock;

    render(<ThemeToggleButton />);
    const button = screen.getByRole("button", { name: /aria_toggle_theme/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  it("toggles from system to dark when system prefers light", async () => {
    localStorage.setItem("theme", "system");
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false, // prefers light
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock;

    render(<ThemeToggleButton />);
    const button = screen.getByRole("button", { name: /aria_toggle_theme/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  it("applies dark theme classes when theme is dark", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggleButton />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  it("applies light theme classes when theme is light", async () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggleButton />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });

  it("uses system preference when theme is system", async () => {
    localStorage.setItem("theme", "system");
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true, // prefers dark
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock;

    render(<ThemeToggleButton />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("listens to system preference changes when theme is system", async () => {
    localStorage.setItem("theme", "system");
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener,
      removeEventListener,
    });
    window.matchMedia = matchMediaMock;

    const { unmount } = render(<ThemeToggleButton />);

    await waitFor(() => {
      expect(addEventListener).toHaveBeenCalled();
    });

    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });

  it("defaults to system theme when no theme is stored", () => {
    render(<ThemeToggleButton />);
    expect(localStorage.getItem("theme")).toBe("system");
  });
});
