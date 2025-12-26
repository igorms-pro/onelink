import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderMobileMenu } from "../HeaderMobileMenu";

// Mock child components
vi.mock("../../LanguageToggleButton", () => ({
  LanguageToggleButton: () => <div data-testid="language-toggle">Language</div>,
}));

vi.mock("../../ThemeToggleButton", () => ({
  ThemeToggleButton: () => <div data-testid="theme-toggle">Theme</div>,
}));

describe("HeaderMobileMenu", () => {
  const mockHandleAnchorClick = vi.fn(
    (_anchor: string) => (e: React.MouseEvent) => {
      e.preventDefault();
    },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <HeaderMobileMenu
        isOpen={false}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    expect(screen.queryByText("Features")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("renders language and theme toggles", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("uses anchor links when on home page", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveAttribute("href", "#features");

    const pricingLink = screen.getByText("Pricing");
    expect(pricingLink).toHaveAttribute("href", "#pricing");
  });

  it("uses full path links when not on home page", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={false}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveAttribute("href", "/#features");

    const pricingLink = screen.getByText("Pricing");
    expect(pricingLink).toHaveAttribute("href", "/#pricing");
  });

  it("calls handleAnchorClick and onClose when link is clicked", () => {
    const onClose = vi.fn();
    const handleAnchorClick = vi.fn(
      (_anchor: string) => (e: React.MouseEvent) => {
        e.preventDefault();
      },
    );

    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={onClose}
        handleAnchorClick={handleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    fireEvent.click(featuresLink);

    expect(handleAnchorClick).toHaveBeenCalledWith("features");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has minimum touch target size for links", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveClass("min-h-[44px]");
  });

  it("has correct styling classes", () => {
    render(
      <HeaderMobileMenu
        isOpen={true}
        isHomePage={true}
        onClose={vi.fn()}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const container = screen.getByText("Features").closest("div");
    expect(container).toHaveClass("md:hidden");
  });
});
