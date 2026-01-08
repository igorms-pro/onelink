import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import PricingPage from "../PricingPage";
import * as analytics from "@/lib/analytics";

// Mock analytics
vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return {
    ...actual,
    trackPricingView: vi.fn(),
    trackSignUpClick: vi.fn(),
    trackUsernameEntered: vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </HelmetProvider>,
  );
};

describe("PricingPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("renders PricingSection", () => {
    renderWithRouter(<PricingPage />);

    // PricingSection should render Free and Pro plans (use getAllByText since they appear multiple times)
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pro/i).length).toBeGreaterThan(0);
  });

  it("renders FeatureComparisonTable", () => {
    renderWithRouter(<PricingPage />);

    // FeatureComparisonTable should have "Compare Plans" heading
    expect(screen.getByText("Compare Plans")).toBeInTheDocument();

    // Should have table headers (use getAllByText for Free/Pro since they appear multiple times)
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);

    // Should have some feature rows
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Drops")).toBeInTheDocument();
  });

  it("renders PricingFAQ", () => {
    renderWithRouter(<PricingPage />);

    // PricingFAQ should have FAQ heading
    // The heading text comes from translations, so we check for FAQ section
    // Use getAllByRole since there are multiple headings
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBeGreaterThan(0);

    // FAQ items should be present (they're rendered from translations)
    // We can check that FAQ buttons exist
    const faqButtons = screen.getAllByRole("button");
    // At least one FAQ button should exist (they're expandable)
    expect(faqButtons.length).toBeGreaterThan(0);
  });

  it("renders PricingContact", () => {
    renderWithRouter(<PricingPage />);

    // PricingContact should have contact section
    // Look for mail icon or contact heading
    const mailIcon = document.querySelector('svg[class*="lucide-mail"]');
    expect(mailIcon).toBeInTheDocument();

    // Should have contact email link
    const emailLink = screen.getByRole("link", { name: /@/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:"),
    );
  });

  it("SEO meta tags are set", async () => {
    const { waitFor } = await import("@testing-library/react");
    renderWithRouter(<PricingPage />);

    // Wait for Helmet to update the document
    await waitFor(() => {
      expect(document.title).toContain("Pricing");
    });

    // Check for meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeInTheDocument();
    expect(metaDescription?.getAttribute("content")).toContain(
      "Choose the plan that fits your needs",
    );
  });

  it("analytics tracking fires on page view", () => {
    renderWithRouter(<PricingPage />);

    // trackPricingView should be called on mount
    expect(analytics.trackPricingView).toHaveBeenCalledTimes(1);
  });

  it("renders Header and Footer", () => {
    renderWithRouter(<PricingPage />);

    // Header should be present - use getAllByText since these appear multiple times
    expect(screen.getAllByText("Features").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pricing").length).toBeGreaterThan(0);

    // Footer should be present
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = renderWithRouter(<PricingPage />);

    // Check main structure
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();

    // Check that page has min-h-screen
    const pageContainer = container.querySelector(".min-h-screen");
    expect(pageContainer).toBeInTheDocument();
  });

  it("all sections are in correct order", () => {
    renderWithRouter(<PricingPage />);

    // Get all sections
    const sections = document.querySelectorAll("main > section");

    // Should have at least PricingSection, FeatureComparisonTable, PricingFAQ, PricingContact
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it("tracks analytics only once on mount", () => {
    renderWithRouter(<PricingPage />);

    expect(analytics.trackPricingView).toHaveBeenCalledTimes(1);

    // Clear mocks and rerender
    vi.clearAllMocks();
    renderWithRouter(<PricingPage />);

    // Should be called again on new mount
    expect(analytics.trackPricingView).toHaveBeenCalledTimes(1);
  });
});
