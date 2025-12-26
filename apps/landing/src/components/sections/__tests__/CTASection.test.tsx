import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CTASection } from "../CTASection";
import * as analytics from "@/lib/analytics";

// Mock analytics
vi.mock("@/lib/analytics");

describe("CTASection", () => {
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

  it("renders headline", () => {
    render(<CTASection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("primary CTA works and tracks analytics", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const primaryButton = screen.getByRole("button", {
      name: /create your free account|get started/i,
    });
    await user.click(primaryButton);

    expect(analytics.trackSignUpClick).toHaveBeenCalledWith("cta_section");
    expect(window.location.href).toBe("https://app.getonelink.io/auth");
  });

  it("renders secondary link", () => {
    render(<CTASection />);

    const secondaryLink = screen.getByTestId("cta-section-secondary");
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute("href", "#pricing");
  });

  it("secondary link works", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const secondaryLink = screen.getByTestId("cta-section-secondary");
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute("href", "#pricing");

    await user.click(secondaryLink);
    // Link navigation is handled by router, so we just verify the href
    expect(secondaryLink).toHaveAttribute("href", "#pricing");
  });

  it("renders section element", () => {
    const { container } = render(<CTASection />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<CTASection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("is accessible", () => {
    render(<CTASection />);

    const button = screen.getByTestId("cta-section-primary");
    const secondaryLink = screen.getByTestId("cta-section-secondary");

    expect(button).toBeInTheDocument();
    expect(secondaryLink).toBeInTheDocument();

    // Check heading hierarchy
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("updates username input value", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const input = screen.getByPlaceholderText("username");
    await user.type(input, "testuser");

    expect(input).toHaveValue("testuser");
  });

  it("includes username in auth URL when provided", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const input = screen.getByPlaceholderText("username");
    await user.type(input, "testuser");

    const button = screen.getByTestId("cta-section-primary");
    await user.click(button);

    expect(window.location.href).toBe(
      "https://app.getonelink.io/auth?username=testuser",
    );
  });

  it("submits on Enter key press", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const input = screen.getByPlaceholderText("username");
    await user.type(input, "testuser{Enter}");

    expect(analytics.trackSignUpClick).toHaveBeenCalledWith("cta_section");
    expect(window.location.href).toBe(
      "https://app.getonelink.io/auth?username=testuser",
    );
  });

  it("trims whitespace from username", async () => {
    const user = userEvent.setup();
    render(<CTASection />);

    const input = screen.getByPlaceholderText("username");
    await user.type(input, "  testuser  ");

    const button = screen.getByTestId("cta-section-primary");
    await user.click(button);

    expect(window.location.href).toBe(
      "https://app.getonelink.io/auth?username=testuser",
    );
  });
});
