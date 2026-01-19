import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HowItWorksSection from "../HowItWorksSection";

describe("HowItWorksSection", () => {
  it("renders all 4 steps", () => {
    render(<HowItWorksSection />);

    const stepTitles = ["Sign Up", "Create Your Link", "Share", "Track"];

    stepTitles.forEach((title) => {
      // May appear multiple times due to mobile/desktop views
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
  });

  it("renders section header with title and description", () => {
    render(<HowItWorksSection />);

    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText(/Get started in minutes/)).toBeInTheDocument();
  });

  it("displays step numbers correctly", () => {
    render(<HowItWorksSection />);

    // Check that step numbers 1-4 are rendered
    for (let i = 1; i <= 4; i++) {
      const stepNumbers = screen.getAllByText(i.toString());
      expect(stepNumbers.length).toBeGreaterThan(0);
    }
  });

  it("renders step descriptions", () => {
    render(<HowItWorksSection />);

    // Descriptions come from translations
    const descriptions = [
      /Create account \(free\)/,
      /Add links, upload files/,
      /One link to share everywhere/,
      /See analytics in real-time/,
    ];

    descriptions.forEach((description) => {
      const matches = screen.queryAllByText(description);
      // Each description should appear at least once (may appear twice for mobile/desktop)
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("has correct timeline layout classes", () => {
    const { container } = render(<HowItWorksSection />);

    // Mobile: vertical timeline
    const mobileTimeline = container.querySelector(".md\\:hidden");
    expect(mobileTimeline).toBeInTheDocument();

    // Desktop: horizontal timeline
    const desktopTimeline = container.querySelector(".hidden.md\\:grid");
    expect(desktopTimeline).toBeInTheDocument();
    expect(desktopTimeline).toHaveClass("md:grid-cols-4");
  });

  it("handles different step positions correctly", () => {
    render(<HowItWorksSection />);

    // Check that all 4 step titles are rendered (may appear multiple times due to mobile/desktop views)
    expect(screen.getAllByText("Sign Up").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Create Your Link").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Share").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Track").length).toBeGreaterThan(0);
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<HowItWorksSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("has responsive padding classes", () => {
    const { container } = render(<HowItWorksSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("py-16", "md:py-24");
  });

  it("renders icons correctly", () => {
    const { container } = render(<HowItWorksSection />);

    // Icons are rendered as SVG elements
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it("renders YouTube iframe when video ID is provided", () => {
    // Mock environment variable with a test video ID
    const originalEnv = import.meta.env.VITE_YOUTUBE_HOW_IT_WORKS_ID;
    (import.meta.env as any).VITE_YOUTUBE_HOW_IT_WORKS_ID = "test-video-id-123";

    const { container } = render(<HowItWorksSection />);

    // Check that iframe is rendered
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/test-video-id-123?rel=0&modestbranding=1&showinfo=0",
    );
    expect(iframe).toHaveAttribute("title", "How It Works");

    // Restore original env
    if (originalEnv) {
      (import.meta.env as any).VITE_YOUTUBE_HOW_IT_WORKS_ID = originalEnv;
    } else {
      delete (import.meta.env as any).VITE_YOUTUBE_HOW_IT_WORKS_ID;
    }
  });

  it("does not render YouTube iframe when video ID is not provided", () => {
    // Ensure no video ID is set
    const originalEnv = import.meta.env.VITE_YOUTUBE_HOW_IT_WORKS_ID;
    delete (import.meta.env as any).VITE_YOUTUBE_HOW_IT_WORKS_ID;

    const { container } = render(<HowItWorksSection />);

    // Check that iframe is NOT rendered
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeInTheDocument();

    // Restore original env
    if (originalEnv) {
      (import.meta.env as any).VITE_YOUTUBE_HOW_IT_WORKS_ID = originalEnv;
    }
  });
});
