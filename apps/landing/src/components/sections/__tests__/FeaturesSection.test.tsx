import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeaturesSection from "../FeaturesSection";

describe("FeaturesSection", () => {
  it("renders all 6 feature cards", () => {
    render(<FeaturesSection />);

    const featureTitles = [
      "One Link for Everything",
      "File Sharing / Drops",
      "Real-time Notifications",
      "Customizable Profile",
      "Privacy & Security",
      "Analytics",
    ];

    featureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders section header with title and description", () => {
    render(<FeaturesSection />);

    expect(screen.getByText("Powerful Features")).toBeInTheDocument();
    expect(
      screen.getByText(/Everything you need to share your content/),
    ).toBeInTheDocument();
  });

  it("has correct grid layout classes", () => {
    const { container } = render(<FeaturesSection />);

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("renders all feature descriptions", () => {
    render(<FeaturesSection />);

    const descriptions = [
      /One link to share everything/,
      /Easy file sharing with multiple uploads/,
      /Real-time notifications for every interaction/,
      /Fully customizable profile/,
      /Full control over your data/,
      /Real-time statistics/,
    ];

    descriptions.forEach((description) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it("has scroll animation data attribute", () => {
    const { container } = render(<FeaturesSection />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-scroll-animate");
  });

  it("has responsive padding classes", () => {
    const { container } = render(<FeaturesSection />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("py-16", "md:py-24");
  });

  it("renders features in correct order", () => {
    render(<FeaturesSection />);

    const features = screen.getAllByRole("heading", { level: 3 });
    expect(features).toHaveLength(6);
    expect(features[0]).toHaveTextContent("One Link for Everything");
    expect(features[5]).toHaveTextContent("Analytics");
  });
});
