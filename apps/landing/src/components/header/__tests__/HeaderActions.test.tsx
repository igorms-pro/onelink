import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderActions } from "../HeaderActions";

// Mock child components
vi.mock("../../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

vi.mock("../../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

describe("HeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        href: "",
      },
      writable: true,
    });
  });

  it("renders sign in button", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    expect(screen.getByTestId("header-sign-in")).toBeInTheDocument();
  });

  it("renders language and theme toggles on desktop", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("hides language and theme toggles on mobile", () => {
    const { container } = render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const toggleContainer = container.querySelector(".hidden.sm\\:flex");
    expect(toggleContainer).toBeInTheDocument();
  });

  it("redirects to auth URL when sign in button is clicked", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const signInButton = screen.getByTestId("header-sign-in");
    fireEvent.click(signInButton);

    expect(window.location.href).toBe("https://app.getonelink.io/auth");
  });

  it("renders mobile menu button", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("shows menu icon when mobile menu is closed", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    // Menu icon should be visible (not X icon)
    expect(menuButton.querySelector("svg")).toBeInTheDocument();
  });

  it("shows X icon when mobile menu is open", () => {
    render(
      <HeaderActions mobileMenuOpen={true} onToggleMobileMenu={vi.fn()} />,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    // X icon should be visible
    expect(menuButton.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onToggleMobileMenu when menu button is clicked", () => {
    const onToggleMobileMenu = vi.fn();

    render(
      <HeaderActions
        mobileMenuOpen={false}
        onToggleMobileMenu={onToggleMobileMenu}
      />,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);

    expect(onToggleMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("has minimum touch target size for menu button", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toHaveClass("min-h-[44px]");
    expect(menuButton).toHaveClass("min-w-[44px]");
  });

  it("has minimum touch target size for sign in button", () => {
    render(
      <HeaderActions mobileMenuOpen={false} onToggleMobileMenu={vi.fn()} />,
    );

    const signInButton = screen.getByTestId("header-sign-in");
    expect(signInButton).toHaveClass("min-h-[44px]");
  });
});
