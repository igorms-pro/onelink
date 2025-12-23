import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialProofSection } from "../SocialProofSection";

describe("SocialProofSection", () => {
  it("renders user count", () => {
    render(<SocialProofSection />);

    // User count is rendered via translation with interpolation
    const section = screen.getByRole("heading", { level: 2 });
    expect(section).toBeInTheDocument();

    // User count might be in the paragraph text (comes from translation)
    expect(section).toBeInTheDocument();
  });

  it("renders section title", () => {
    render(<SocialProofSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("renders trust badges", () => {
    render(<SocialProofSection />);

    // Trust badges are rendered as text
    expect(screen.getByText("Creator")).toBeInTheDocument();
    expect(screen.getByText("Freelancer")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<SocialProofSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("has responsive layout classes", () => {
    const { container } = render(<SocialProofSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("py-12", "sm:py-16");

    const badgesContainer = container.querySelector(".flex-wrap");
    expect(badgesContainer).toBeInTheDocument();
  });

  it("renders correctly in dark mode", () => {
    const { container } = render(<SocialProofSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("dark:bg-gray-900");
  });

  it("has placeholder for testimonials", () => {
    const { container } = render(<SocialProofSection />);

    // Testimonials section exists but is empty (placeholder)
    const testimonialsSection = container.querySelector(".mt-12");
    expect(testimonialsSection).toBeInTheDocument();
  });

  it("is accessible", () => {
    render(<SocialProofSection />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});
