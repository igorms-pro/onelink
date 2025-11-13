import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataExportReadyState } from "../DataExportReadyState";

describe("DataExportReadyState", () => {
  it("renders ready state message", () => {
    render(<DataExportReadyState />);
    expect(screen.getByText("Export ready!")).toBeInTheDocument();
  });

  it("displays expiration notice", () => {
    render(<DataExportReadyState />);
    expect(
      screen.getByText("Download link valid for 24 hours"),
    ).toBeInTheDocument();
  });

  it("renders check icon", () => {
    render(<DataExportReadyState />);
    // CheckCircle2 icon should be present
    expect(screen.getByTestId("data-export-ready-icon")).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    const { container } = render(<DataExportReadyState />);
    const wrapper = container.querySelector(".rounded-lg.border");
    expect(wrapper).toHaveClass("border-green-200", "bg-green-50");
  });
});
