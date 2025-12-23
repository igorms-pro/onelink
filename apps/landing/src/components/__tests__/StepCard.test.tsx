import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckCircle } from "lucide-react";
import StepCard from "../StepCard";

describe("StepCard Component", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  const defaultProps = {
    stepNumber: 1,
    title: "Step One",
    description: "This is the first step",
    icon: CheckCircle,
  };

  it("renders step number correctly", () => {
    render(<StepCard {...defaultProps} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("displays title and description", () => {
    render(<StepCard {...defaultProps} />);

    // Title appears multiple times (mobile and desktop), so use getAllByText
    const titles = screen.getAllByText("Step One");
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText("This is the first step")).toBeInTheDocument();
  });

  it("shows icon correctly", () => {
    const { container } = render(<StepCard {...defaultProps} />);

    // Icon should be rendered (check for SVG in the component)
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("handles different step positions (first, middle, last)", () => {
    const { container, rerender } = render(
      <StepCard {...defaultProps} isLast={false} />,
    );

    // Should show connector line when not last
    const connectors = container.querySelectorAll('[class*="bg-linear"]');
    expect(connectors.length).toBeGreaterThan(0);

    // Rerender as last step
    rerender(<StepCard {...defaultProps} isLast={true} />);

    // Connector should not be present when isLast is true
    // The step number circle still has bg-linear-to-r, so we check for connector lines specifically
    const connectorLines = container.querySelectorAll(
      '[class*="absolute"][class*="bg-linear"]',
    );
    // Last step should not have connector lines
    expect(connectorLines.length).toBe(0);
  });

  it("renders correctly in dark mode", () => {
    document.documentElement.classList.add("dark");

    render(<StepCard {...defaultProps} />);

    // Check for dark mode classes in description
    const description = screen.getByText("This is the first step");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("displays step number in a circle", () => {
    render(<StepCard {...defaultProps} />);

    const stepNumber = screen.getByText("1");
    const circle = stepNumber.closest("div");
    expect(circle).toHaveClass("rounded-full");
    expect(circle).toHaveClass("bg-linear-to-r");
  });

  it("shows icon overlay on desktop", () => {
    const { container } = render(<StepCard {...defaultProps} />);

    // Icon overlay should exist (hidden on mobile, visible on desktop)
    const iconOverlay = container.querySelector('[class*="hidden md:flex"]');
    expect(iconOverlay).toBeInTheDocument();
  });

  it("shows icon with title on mobile", () => {
    const { container } = render(<StepCard {...defaultProps} />);

    // Mobile icon should exist (visible on mobile, hidden on desktop)
    const mobileIcon = container.querySelector('[class*="md:hidden"]');
    expect(mobileIcon).toBeInTheDocument();
  });

  it("has proper heading hierarchy", () => {
    render(<StepCard {...defaultProps} />);

    // Title appears multiple times, but should be in h3 headings
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toHaveTextContent("Step One");
  });

  it("renders connector line for non-last steps", () => {
    const { container } = render(
      <StepCard {...defaultProps} stepNumber={2} isLast={false} />,
    );

    // Should have connector line (absolute positioned line)
    const connectorLines = container.querySelectorAll(
      '[class*="absolute"][class*="bg-linear"]',
    );
    expect(connectorLines.length).toBeGreaterThan(0);
  });

  it("does not render connector line for last step", () => {
    const { container } = render(
      <StepCard {...defaultProps} stepNumber={4} isLast={true} />,
    );

    // Last step should not have the connector line (absolute positioned)
    const connectorLines = container.querySelectorAll(
      '[class*="absolute"][class*="bg-linear"]',
    );
    expect(connectorLines.length).toBe(0);
  });
});
