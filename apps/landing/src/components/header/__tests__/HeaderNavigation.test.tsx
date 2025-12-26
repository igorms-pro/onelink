import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderNavigation } from "../HeaderNavigation";

describe("HeaderNavigation", () => {
  const mockHandleAnchorClick = vi.fn(
    (_anchor: string) => (e: React.MouseEvent) => {
      e.preventDefault();
    },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation links", () => {
    render(
      <HeaderNavigation
        isHomePage={true}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("uses anchor links when on home page", () => {
    render(
      <HeaderNavigation
        isHomePage={true}
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
      <HeaderNavigation
        isHomePage={false}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveAttribute("href", "/#features");

    const pricingLink = screen.getByText("Pricing");
    expect(pricingLink).toHaveAttribute("href", "/#pricing");
  });

  it("calls handleAnchorClick when link is clicked", () => {
    const handleAnchorClick = vi.fn(
      (_anchor: string) => (e: React.MouseEvent) => {
        e.preventDefault();
      },
    );

    render(
      <HeaderNavigation
        isHomePage={true}
        handleAnchorClick={handleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    fireEvent.click(featuresLink);

    expect(handleAnchorClick).toHaveBeenCalledWith("features");

    const pricingLink = screen.getByText("Pricing");
    fireEvent.click(pricingLink);

    expect(handleAnchorClick).toHaveBeenCalledWith("pricing");
  });

  it("has minimum touch target size", () => {
    render(
      <HeaderNavigation
        isHomePage={true}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveClass("min-h-[44px]");
  });

  it("has correct styling classes", () => {
    render(
      <HeaderNavigation
        isHomePage={true}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const nav = screen.getByText("Features").closest("nav");
    expect(nav).toHaveClass("hidden");
    expect(nav).toHaveClass("md:flex");
  });

  it("applies hover styles", () => {
    render(
      <HeaderNavigation
        isHomePage={true}
        handleAnchorClick={mockHandleAnchorClick}
      />,
    );

    const featuresLink = screen.getByText("Features");
    expect(featuresLink).toHaveClass("hover:text-purple-600");
  });
});
