import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataExportReadyState } from "../DataExportReadyState";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DataExportReadyState", () => {
  it("renders ready state message", () => {
    render(<DataExportReadyState />);
    expect(screen.getByText("settings_export_ready")).toBeInTheDocument();
  });

  it("displays expiration notice", () => {
    render(<DataExportReadyState />);
    expect(
      screen.getByText("settings_export_download_valid_24h"),
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
