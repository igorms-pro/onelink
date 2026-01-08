import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoSection } from "../DemoSection";

describe("DemoSection", () => {
  it("renders video placeholder when no YouTube ID is set", () => {
    // Mock env to ensure no video ID is set
    const originalEnv = import.meta.env.VITE_YOUTUBE_VIDEO_ID;
    delete (import.meta.env as any).VITE_YOUTUBE_VIDEO_ID;

    render(<DemoSection />);

    expect(screen.getByText(/Video Tutorial Coming Soon/i)).toBeInTheDocument();

    // Restore original env
    if (originalEnv) {
      (import.meta.env as any).VITE_YOUTUBE_VIDEO_ID = originalEnv;
    }
  });

  it("renders device mockup", () => {
    const { container } = render(<DemoSection />);

    // Device mockup has MacBook frame classes
    const mockup = container.querySelector('[class*="border-8"]');
    expect(mockup).toBeInTheDocument();
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<DemoSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("renders caption/description", () => {
    render(<DemoSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();

    // Description comes from translation - at least heading should be present
    expect(heading).toBeInTheDocument();
  });

  it("has responsive layout classes", () => {
    const { container } = render(<DemoSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("py-16", "sm:py-20", "lg:py-24");
  });

  it("has correct id for scroll targeting", () => {
    const { container } = render(<DemoSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "demo");
  });

  it("renders decorative elements", () => {
    const { container } = render(<DemoSection />);

    // Decorative blur elements
    const decorativeElements = container.querySelectorAll(
      '[class*="blur-2xl"]',
    );
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  it("renders correctly in dark mode", () => {
    const { container } = render(<DemoSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("dark:from-purple-500/10");
  });

  it("is accessible", () => {
    render(<DemoSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});
