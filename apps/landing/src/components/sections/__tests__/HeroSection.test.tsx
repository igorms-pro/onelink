import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeroSection from "../HeroSection";
import * as analytics from "@/lib/analytics";

// Mock analytics
vi.mock("@/lib/analytics");

describe("HeroSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        href: "",
      },
      writable: true,
    });
  });

  it("renders headline and subheadline", () => {
    render(<HeroSection />);

    expect(screen.getByTestId("hero-headline")).toBeInTheDocument();
    expect(screen.getByTestId("hero-subtitle")).toBeInTheDocument();
    expect(screen.getByTestId("hero-description")).toBeInTheDocument();
  });

  it("renders primary CTA button", () => {
    render(<HeroSection />);

    const primaryButton = screen.getByRole("button", {
      name: /get started free/i,
    });
    expect(primaryButton).toBeInTheDocument();
  });

  it("primary CTA button works and tracks analytics", async () => {
    const user = userEvent.setup();
    render(<HeroSection />);

    const primaryButton = screen.getByRole("button", {
      name: /get started free/i,
    });
    await user.click(primaryButton);

    expect(analytics.trackSignUpClick).toHaveBeenCalledWith("hero");
    expect(window.location.href).toBe("https://app.getonelink.io/auth");
  });

  it("renders secondary CTA button", () => {
    render(<HeroSection />);

    const secondaryButton = screen.getByRole("button", { name: /view demo/i });
    expect(secondaryButton).toBeInTheDocument();
  });

  it("secondary CTA button scrolls to demo section and tracks analytics", async () => {
    const user = userEvent.setup();
    // Create a mock demo section element
    const mockDemoSection = document.createElement("div");
    mockDemoSection.id = "demo";
    mockDemoSection.scrollIntoView = vi.fn();
    document.body.appendChild(mockDemoSection);

    // Mock getElementById to return our mock element
    const getElementByIdSpy = vi
      .spyOn(document, "getElementById")
      .mockReturnValue(mockDemoSection);

    render(<HeroSection />);

    const secondaryButton = screen.getByRole("button", { name: /view demo/i });
    await user.click(secondaryButton);

    expect(getElementByIdSpy).toHaveBeenCalledWith("demo");
    expect(mockDemoSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });
    expect(analytics.trackCTAClick).toHaveBeenCalledWith("view_demo", "hero");

    getElementByIdSpy.mockRestore();
    document.body.removeChild(mockDemoSection);
  });

  it("renders hero images carousel", () => {
    render(<HeroSection />);

    const images = screen.getAllByTestId(/hero-marketing-image-\d+/);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toBeInTheDocument();
  });

  it("renders section with correct structure", () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();

    const headline = screen.getByTestId("hero-headline");
    expect(headline).toBeInTheDocument();
  });

  it("is accessible", () => {
    render(<HeroSection />);

    // Check that buttons are accessible
    const primaryButton = screen.getByRole("button", {
      name: /get started free/i,
    });
    const secondaryButton = screen.getByRole("button", { name: /view demo/i });

    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();

    // Check heading hierarchy
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
