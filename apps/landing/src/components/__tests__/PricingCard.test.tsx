import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PricingCard } from "../PricingCard";
import * as analytics from "@/lib/analytics";
import React from "react";

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  trackSignUpClick: vi.fn(),
  trackCTAClick: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PricingCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  const defaultProps = {
    name: "Free",
    price: "$0",
    description: "Perfect to get started",
    cta: "Get Started Free",
    features: ["5 links", "3 drops", "Basic analytics"],
    ctaUrl: "/auth",
  };

  it("renders Free plan correctly", () => {
    renderWithRouter(<PricingCard {...defaultProps} />);

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("Perfect to get started")).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
  });

  it("renders Pro plan correctly", () => {
    const proProps = {
      ...defaultProps,
      name: "Pro",
      price: "$12/month",
      description: "For professionals",
      cta: "Upgrade to Pro",
      features: ["Unlimited links", "Unlimited drops", "Advanced analytics"],
      ctaUrl: "/pricing",
    };

    renderWithRouter(<PricingCard {...proProps} />);

    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("$12/month")).toBeInTheDocument();
    expect(screen.getByText("For professionals")).toBeInTheDocument();
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("highlights Pro plan when highlighted={true}", () => {
    const { container } = renderWithRouter(
      <PricingCard {...defaultProps} highlight={true} />,
    );

    // Find the card wrapper (the outermost div with rounded-2xl)
    const card = container.querySelector('[class*="rounded-2xl"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("border-purple-500");
    expect(card).toHaveClass("ring-2");
    expect(card).toHaveClass("ring-purple-500");
  });

  it("displays all features correctly", () => {
    const features = ["Feature 1", "Feature 2", "Feature 3"];
    renderWithRouter(<PricingCard {...defaultProps} features={features} />);

    features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it("CTA button works and tracks analytics", () => {
    renderWithRouter(<PricingCard {...defaultProps} ctaUrl="/auth" />);

    const ctaButton = screen.getByText("Get Started Free");
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(analytics.trackSignUpClick).toHaveBeenCalledWith("pricing");
  });

  it("tracks upgrade CTA click correctly", () => {
    renderWithRouter(
      <PricingCard {...defaultProps} ctaUrl="/pricing" cta="Upgrade to Pro" />,
    );

    const ctaButton = screen.getByText("Upgrade to Pro");
    fireEvent.click(ctaButton);
    expect(analytics.trackCTAClick).toHaveBeenCalledWith("upgrade", "pricing");
  });

  it("handles click events correctly", () => {
    renderWithRouter(<PricingCard {...defaultProps} />);

    const ctaLink = screen.getByText("Get Started Free");
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.tagName).toBe("A");
    expect(ctaLink).toHaveAttribute("href", "/auth");
  });

  it("renders correctly in dark mode", () => {
    document.documentElement.classList.add("dark");

    const { container } = renderWithRouter(<PricingCard {...defaultProps} />);

    // Find the card wrapper
    const card = container.querySelector('[class*="rounded-2xl"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("dark:bg-gray-900");
    expect(card).toHaveClass("dark:border-gray-800");
  });

  it("is accessible", () => {
    const { container } = renderWithRouter(<PricingCard {...defaultProps} />);

    // CTA should be accessible
    const cta = screen.getByText("Get Started Free");
    expect(cta).toBeInTheDocument();

    // Features should be in a list
    const featuresList = container.querySelector("ul");
    expect(featuresList).toBeInTheDocument();

    // Check that features are list items
    const listItems = featuresList?.querySelectorAll("li");
    expect(listItems?.length).toBeGreaterThan(0);
  });

  it("displays 'Most popular' badge when highlighted", () => {
    renderWithRouter(<PricingCard {...defaultProps} highlight={true} />);

    // Check for the badge text (translated via i18n mock)
    // The translation key is "pricing.most_popular" which should return "Most popular" from en.json
    const badge = screen.getByText("Most popular");
    expect(badge).toBeInTheDocument();
  });

  it("handles external URLs correctly", () => {
    renderWithRouter(
      <PricingCard {...defaultProps} ctaUrl="https://example.com" />,
    );

    const ctaLink = screen.getByText("Get Started Free");
    expect(ctaLink).toHaveAttribute("href", "https://example.com");
    expect(ctaLink).toHaveAttribute("target", "_blank");
    expect(ctaLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders features with check icons", () => {
    renderWithRouter(<PricingCard {...defaultProps} />);

    // Each feature should have a check icon
    const features = screen.getAllByRole("listitem");
    expect(features.length).toBeGreaterThan(0);

    // Check icons should be present
    features.forEach((feature) => {
      const icon = feature.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  it("has minimum touch target size for CTA", () => {
    renderWithRouter(<PricingCard {...defaultProps} />);

    const cta = screen.getByText("Get Started Free");
    expect(cta).toHaveClass("min-h-[44px]");
  });
});
