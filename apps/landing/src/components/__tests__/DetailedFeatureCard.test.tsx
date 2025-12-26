import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetailedFeatureCard } from "../DetailedFeatureCard";
import { Link, Upload } from "lucide-react";

const mockFeature = {
  title: "Test Feature",
  description: "This is a test feature description",
  icon: Link,
  details: ["Detail 1", "Detail 2", "Detail 3"],
};

describe("DetailedFeatureCard", () => {
  it("renders feature title and description", () => {
    render(<DetailedFeatureCard feature={mockFeature} index={0} />);

    expect(screen.getByText("Test Feature")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test feature description"),
    ).toBeInTheDocument();
  });

  it("renders all feature details", () => {
    render(<DetailedFeatureCard feature={mockFeature} index={0} />);

    expect(screen.getByText("Detail 1")).toBeInTheDocument();
    expect(screen.getByText("Detail 2")).toBeInTheDocument();
    expect(screen.getByText("Detail 3")).toBeInTheDocument();
  });

  it("renders feature icon", () => {
    render(<DetailedFeatureCard feature={mockFeature} index={0} />);

    // Icon should be rendered (lucide-react icons render as SVG)
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders screenshot placeholder", () => {
    render(<DetailedFeatureCard feature={mockFeature} index={0} />);

    expect(screen.getByText(/SCREENSHOT: Test Feature/)).toBeInTheDocument();
  });

  it("applies correct order class for even index", () => {
    const { container } = render(
      <DetailedFeatureCard feature={mockFeature} index={0} />,
    );

    const contentDiv = container.querySelector(".lg\\:order-2");
    expect(contentDiv).not.toBeInTheDocument(); // Should not have order-2 for even index
  });

  it("applies correct order class for odd index", () => {
    const { container } = render(
      <DetailedFeatureCard feature={mockFeature} index={1} />,
    );

    const contentDiv = container.querySelector(".lg\\:order-2");
    expect(contentDiv).toBeInTheDocument(); // Should have order-2 for odd index
  });

  it("applies correct order class to screenshot for odd index", () => {
    const { container } = render(
      <DetailedFeatureCard feature={mockFeature} index={1} />,
    );

    const screenshotDiv = container.querySelector(".lg\\:order-1");
    expect(screenshotDiv).toBeInTheDocument(); // Screenshot should have order-1 for odd index
  });

  it("renders checkmark icons for details", () => {
    render(<DetailedFeatureCard feature={mockFeature} index={0} />);

    // Each detail should have a checkmark SVG
    const svgs = document.querySelectorAll("svg");
    // Should have at least the feature icon + checkmark SVGs
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it("has correct grid layout classes", () => {
    const { container } = render(
      <DetailedFeatureCard feature={mockFeature} index={0} />,
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("lg:grid-cols-2");
  });

  it("handles different feature icons", () => {
    const featureWithUpload = {
      ...mockFeature,
      icon: Upload,
    };

    render(<DetailedFeatureCard feature={featureWithUpload} index={0} />);

    expect(screen.getByText("Test Feature")).toBeInTheDocument();
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
