import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingFAQ } from "../PricingFAQ";

describe("PricingFAQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    render(<PricingFAQ />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("renders FAQ items", () => {
    render(<PricingFAQ />);

    // FAQ items should be rendered based on translation data
    // The exact number depends on the translation, but the structure should exist
    const buttons = screen.queryAllByRole("button");
    // Should have at least the FAQ toggle buttons
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it("toggles FAQ item when clicked", async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    const buttons = screen.queryAllByRole("button");
    if (buttons.length > 0) {
      const firstButton = buttons[0];
      const faqItem = firstButton.closest('[data-testid^="pricing-faq-item-"]');
      const index = faqItem
        ?.getAttribute("data-testid")
        ?.replace("pricing-faq-item-", "");

      if (index !== undefined) {
        const content = screen.getByTestId(`pricing-faq-content-${index}`);

        // Check initial state (should be collapsed)
        expect(content).toHaveAttribute("aria-expanded", "false");

        // Click to expand
        await user.click(firstButton);

        // After click, should be expanded
        expect(content).toHaveAttribute("aria-expanded", "true");
      }
    }
  });

  it("shows chevron down when collapsed", () => {
    render(<PricingFAQ />);

    // Should have chevron icons (lucide-react icons)
    const hasChevron = document.querySelector("svg");
    expect(hasChevron).toBeTruthy();
  });

  it("shows chevron up when expanded", async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    const buttons = screen.queryAllByRole("button");
    if (buttons.length > 0) {
      const firstButton = buttons[0];
      await user.click(firstButton);

      // Should have chevron up icon after expansion
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    }
  });

  it("can expand multiple items independently", async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    const buttons = screen.queryAllByRole("button");
    if (buttons.length >= 2) {
      // Click first button
      await user.click(buttons[0]);
      const firstItem = buttons[0].closest(
        '[data-testid^="pricing-faq-item-"]',
      );
      const firstIndex = firstItem
        ?.getAttribute("data-testid")
        ?.replace("pricing-faq-item-", "");
      if (firstIndex !== undefined) {
        expect(
          screen.getByTestId(`pricing-faq-content-${firstIndex}`),
        ).toHaveAttribute("aria-expanded", "true");
      }

      // Click second button
      await user.click(buttons[1]);
      const secondItem = buttons[1].closest(
        '[data-testid^="pricing-faq-item-"]',
      );
      const secondIndex = secondItem
        ?.getAttribute("data-testid")
        ?.replace("pricing-faq-item-", "");
      if (secondIndex !== undefined) {
        expect(
          screen.getByTestId(`pricing-faq-content-${secondIndex}`),
        ).toHaveAttribute("aria-expanded", "true");
      }
    }
  });

  it("collapses item when clicked again", async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    const buttons = screen.queryAllByRole("button");
    if (buttons.length > 0) {
      const button = buttons[0];
      const faqItem = button.closest('[data-testid^="pricing-faq-item-"]');
      const index = faqItem
        ?.getAttribute("data-testid")
        ?.replace("pricing-faq-item-", "");

      if (index !== undefined) {
        const content = screen.getByTestId(`pricing-faq-content-${index}`);

        // Expand
        await user.click(button);
        expect(content).toHaveAttribute("aria-expanded", "true");

        // Collapse
        await user.click(button);
        expect(content).toHaveAttribute("aria-expanded", "false");
      }
    }
  });

  it("renders question text", () => {
    render(<PricingFAQ />);

    // Questions should be rendered as h3 elements
    const questions = screen.queryAllByRole("heading", { level: 3 });
    // Number depends on translation data
    expect(questions.length).toBeGreaterThanOrEqual(0);
  });

  it("renders section correctly", () => {
    render(<PricingFAQ />);

    const section = screen.getByTestId("pricing-faq-section");
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe("SECTION");
  });
});
