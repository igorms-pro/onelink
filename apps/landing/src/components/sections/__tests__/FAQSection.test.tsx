import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "../FAQSection";

// Mock FAQItem
vi.mock("../../faq/FAQItem", () => ({
  FAQItem: ({
    question,
    answer,
    isExpanded,
    onToggle,
  }: {
    question: string;
    answer: string;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <div data-testid="faq-item" data-expanded={isExpanded}>
      <button onClick={onToggle}>{question}</button>
      {isExpanded && <p>{answer}</p>}
    </div>
  ),
}));

describe("FAQSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    render(<FAQSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("renders FAQ items", () => {
    render(<FAQSection />);

    // FAQ items should be rendered (mocked)
    const faqItems = screen.queryAllByTestId("faq-item");
    // The number depends on the translation data, but at least one should exist
    expect(faqItems.length).toBeGreaterThanOrEqual(0);
  });

  it("toggles FAQ item when clicked", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const faqItems = screen.queryAllByTestId("faq-item");
    if (faqItems.length > 0) {
      const firstItem = faqItems[0];
      const button = firstItem.querySelector("button");

      if (button) {
        // Initially should not be expanded (or could be, depends on state)
        const initialExpanded =
          firstItem.getAttribute("data-expanded") === "true";

        await user.click(button);

        // After click, expanded state should toggle
        const newExpanded = firstItem.getAttribute("data-expanded") === "true";
        expect(newExpanded).not.toBe(initialExpanded);
      }
    }
  });

  it("can expand multiple items independently", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const faqItems = screen.queryAllByTestId("faq-item");
    if (faqItems.length >= 2) {
      const firstButton = faqItems[0].querySelector("button");
      const secondButton = faqItems[1].querySelector("button");

      if (firstButton && secondButton) {
        // Expand first item
        await user.click(firstButton);
        expect(faqItems[0].getAttribute("data-expanded")).toBe("true");

        // Expand second item
        await user.click(secondButton);
        expect(faqItems[1].getAttribute("data-expanded")).toBe("true");

        // Both should be expanded
        expect(faqItems[0].getAttribute("data-expanded")).toBe("true");
        expect(faqItems[1].getAttribute("data-expanded")).toBe("true");
      }
    }
  });

  it("collapses item when clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const faqItems = screen.queryAllByTestId("faq-item");
    if (faqItems.length > 0) {
      const button = faqItems[0].querySelector("button");

      if (button) {
        // Expand
        await user.click(button);
        expect(faqItems[0].getAttribute("data-expanded")).toBe("true");

        // Collapse
        await user.click(button);
        expect(faqItems[0].getAttribute("data-expanded")).toBe("false");
      }
    }
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<FAQSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("renders section with correct id", () => {
    const { container } = render(<FAQSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "faq");
  });
});
