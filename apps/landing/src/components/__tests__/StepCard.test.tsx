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
    const { rerender } = render(
      <StepCard {...defaultProps} stepNumber={1} isLast={false} />,
    );

    // Should show connector line when not last
    expect(
      screen.getByTestId("step-card-connector-mobile-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("step-card-connector-desktop-1"),
    ).toBeInTheDocument();

    // Rerender as last step
    rerender(<StepCard {...defaultProps} stepNumber={4} isLast={true} />);

    // Connector should not be present when isLast is true
    expect(
      screen.queryByTestId("step-card-connector-mobile-4"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("step-card-connector-desktop-4"),
    ).not.toBeInTheDocument();
  });

  it("renders correctly in dark mode", () => {
    document.documentElement.classList.add("dark");

    render(<StepCard {...defaultProps} />);

    // Component should render without errors in dark mode
    const card = screen.getByTestId("step-card-1");
    expect(card).toBeInTheDocument();
    expect(screen.getByText("This is the first step")).toBeInTheDocument();
  });

  it("displays step number in a circle", () => {
    render(<StepCard {...defaultProps} />);

    const stepNumber = screen.getByTestId("step-card-number-1");
    expect(stepNumber).toBeInTheDocument();
    expect(stepNumber).toHaveTextContent("1");
  });

  it("shows icon overlay on desktop", () => {
    render(<StepCard {...defaultProps} />);

    // Icon overlay should exist (hidden on mobile, visible on desktop)
    const iconOverlay = screen.getByTestId("step-card-icon-overlay-1");
    expect(iconOverlay).toBeInTheDocument();
  });

  it("shows icon with title on mobile", () => {
    render(<StepCard {...defaultProps} />);

    // Mobile icon should exist (visible on mobile, hidden on desktop)
    const mobileIcon = screen.getByTestId("step-card-mobile-icon-1");
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
    render(<StepCard {...defaultProps} stepNumber={2} isLast={false} />);

    // Should have connector line
    expect(
      screen.getByTestId("step-card-connector-mobile-2"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("step-card-connector-desktop-2"),
    ).toBeInTheDocument();
  });

  it("does not render connector line for last step", () => {
    render(<StepCard {...defaultProps} stepNumber={4} isLast={true} />);

    // Last step should not have the connector line
    expect(
      screen.queryByTestId("step-card-connector-mobile-4"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("step-card-connector-desktop-4"),
    ).not.toBeInTheDocument();
  });
});
