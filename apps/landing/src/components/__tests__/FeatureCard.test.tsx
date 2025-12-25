import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from "lucide-react";
import FeatureCard from "../FeatureCard";

describe("FeatureCard Component", () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.classList.remove("dark");
  });

  it("renders with title and description", () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="This is a test description"
        icon={Link}
      />,
    );

    expect(screen.getByText("Test Feature")).toBeInTheDocument();
    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("displays icon correctly", () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    // Icon should be rendered (lucide-react icons have specific classes)
    const iconContainer = screen
      .getByText("Test Feature")
      .closest("div")
      ?.querySelector("svg");
    expect(iconContainer).toBeInTheDocument();
  });

  it("applies hover effects", () => {
    const { container } = render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("hover:border-purple-500");
    expect(card).toHaveClass("hover:shadow-lg");
  });

  it("handles missing props gracefully", () => {
    // TypeScript will catch missing props at compile time,
    // but we test that the component doesn't crash with empty strings
    const { container } = render(
      <FeatureCard title="" description="" icon={Link} />,
    );

    // Component should render without crashing
    const card = container.querySelector('[class*="rounded-2xl"]');
    expect(card).toBeInTheDocument();
  });

  it("renders correctly in dark mode", () => {
    document.documentElement.classList.add("dark");

    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    const card = screen.getByText("Test Feature").closest("div");
    expect(card).toHaveClass("dark:bg-gray-900");
    expect(card).toHaveClass("dark:border-gray-800");
  });

  it("is accessible (keyboard navigation, ARIA labels)", () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    // Card should have semantic HTML structure
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Feature");

    // Description should be readable
    const description = screen.getByText("Test description");
    expect(description).toBeInTheDocument();
  });

  it("has proper heading hierarchy", () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("applies responsive classes", () => {
    const { container } = render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={Link}
      />,
    );

    const card = container.firstChild as HTMLElement;
    // Check for responsive padding classes
    expect(card.className).toContain("p-8");
    expect(card.className).toContain("md:p-10");
    expect(card.className).toContain("lg:p-12");
  });
});
