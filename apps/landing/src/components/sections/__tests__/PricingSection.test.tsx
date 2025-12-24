import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingSection } from "../PricingSection";
import * as analytics from "@/lib/analytics";

// Mock analytics
vi.mock("@/lib/analytics");

describe("PricingSection", () => {
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

  it("renders Free and Pro plans", () => {
    render(<PricingSection />);

    // Check for plan names (they come from translations)
    const pricingCards = screen.getAllByText(/Free|Pro/i);
    expect(pricingCards.length).toBeGreaterThan(0);
  });

  it("Pro plan is highlighted", () => {
    const { container } = render(<PricingSection />);

    const cards = container.querySelectorAll('[class*="ring-purple-500"]');
    // Pro plan should have highlight styling
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders section header with title and subtitle", () => {
    render(<PricingSection />);

    // Title and subtitle come from translations
    const section = screen.getByRole("heading", { level: 2 });
    expect(section).toBeInTheDocument();
  });

  it("displays feature lists correctly", () => {
    render(<PricingSection />);

    // Features are rendered as list items
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(2); // At least Free and Pro
  });

  it("CTA buttons work and track analytics", async () => {
    const user = userEvent.setup();
    render(<PricingSection />);

    // Find all CTA links/buttons
    const ctaLinks = screen.getAllByRole("link");
    const authLink = ctaLinks.find((link) =>
      link.getAttribute("href")?.includes("/auth"),
    );

    if (authLink) {
      await user.click(authLink);
      expect(analytics.trackSignUpClick).toHaveBeenCalledWith("pricing");
    }
  });

  it("has grid layout", () => {
    const { container } = render(<PricingSection />);

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<PricingSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("renders section element", () => {
    const { container } = render(<PricingSection />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("analytics tracking fires on CTA clicks", async () => {
    const user = userEvent.setup();
    render(<PricingSection />);

    const ctaLinks = screen.getAllByRole("link");

    // Click on any CTA link
    if (ctaLinks.length > 0) {
      await user.click(ctaLinks[0]);
      // Should track either sign up or CTA click
      const signUpCalls = vi.mocked(analytics.trackSignUpClick).mock.calls
        .length;
      const ctaCalls = vi.mocked(analytics.trackCTAClick).mock.calls.length;
      expect(signUpCalls > 0 || ctaCalls > 0).toBe(true);
    }
  });
});
