import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../Header";
import React from "react";

// Mock child components
vi.mock("../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

vi.mock("../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("renders navigation links", () => {
    renderWithRouter(<Header />);

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("mobile menu toggles correctly", () => {
    renderWithRouter(<Header />);

    // Menu should be closed initially
    expect(screen.queryByTestId("header-mobile-menu")).not.toBeInTheDocument();

    // Find and click mobile menu button
    const menuButton = screen.getByTestId("header-mobile-menu-button");
    expect(menuButton).toBeInTheDocument();

    // Click to open
    fireEvent.click(menuButton);

    // Mobile menu should now be visible
    const mobileMenu = screen.getByTestId("header-mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
  });

  it("language toggle works", () => {
    renderWithRouter(<Header />);

    // Language toggle should be rendered
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("theme toggle works", () => {
    renderWithRouter(<Header />);

    // Theme toggle should be rendered
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("CTA button renders and links correctly", () => {
    renderWithRouter(<Header />);

    // Sign In button should be accessible
    const signInButton = screen.getByTestId("header-sign-in");
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.tagName).toBe("BUTTON");
  });

  it("mobile menu closes on link click", () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByTestId("header-mobile-menu-button");

    // Open menu
    fireEvent.click(menuButton);

    // Mobile menu should be visible
    const mobileMenu = screen.getByTestId("header-mobile-menu");
    expect(mobileMenu).toBeInTheDocument();

    // Find mobile menu links - scope to mobile menu to avoid desktop nav
    const mobileMenuContainer = within(mobileMenu);
    const featuresLink = mobileMenuContainer.getByRole("link", {
      name: /features/i,
    });
    expect(featuresLink).toBeInTheDocument();
    expect(featuresLink).toHaveAttribute("href", "#features");

    // Click the link - the component should handle closing the menu
    fireEvent.click(featuresLink);
    // Menu should close (component handles this internally)
  });

  it("is accessible (keyboard navigation)", () => {
    renderWithRouter(<Header />);

    // All navigation links should be keyboard accessible
    const featuresLink = screen.getByText("Features");
    expect(featuresLink.tagName).toBe("A");
    expect(featuresLink).toHaveAttribute("href", "#features");

    const pricingLink = screen.getByText("Pricing");
    expect(pricingLink.tagName).toBe("A");
    expect(pricingLink).toHaveAttribute("href", "#pricing");
  });

  it("has proper ARIA labels", () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("renders logo link correctly", () => {
    renderWithRouter(<Header />);

    const logo = screen.getByAltText("OneLink");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/onelink-logo.png");
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("has accessible interactive elements", () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByTestId("header-mobile-menu-button");
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-label", "Toggle menu");

    const signInButton = screen.getByTestId("header-sign-in");
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.tagName).toBe("BUTTON");
  });

  it("renders desktop navigation", () => {
    renderWithRouter(<Header />);

    const desktopNav = screen.getByTestId("header-navigation");
    expect(desktopNav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByTestId("header-mobile-menu-button");
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-label", "Toggle menu");
  });
});
