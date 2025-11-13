import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportForm } from "../DataExportForm";

describe("DataExportForm", () => {
  const defaultProps = {
    format: "json" as const,
    onFormatChange: vi.fn(),
    selectedData: new Set<
      "profile" | "links" | "drops" | "submissions" | "analytics"
    >(["profile", "links"]),
    onToggleDataType: vi.fn(),
  };

  it("renders form with format selection", () => {
    render(<DataExportForm {...defaultProps} />);
    expect(screen.getByText("Export Format")).toBeInTheDocument();
    expect(screen.getByLabelText(/JSON/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CSV/i)).toBeInTheDocument();
  });

  it("displays current format selection", () => {
    render(<DataExportForm {...defaultProps} format="json" />);
    const jsonRadio = screen.getByLabelText(/JSON/i);
    expect(jsonRadio).toBeChecked();
  });

  it("calls onFormatChange when format is changed", async () => {
    const user = userEvent.setup();
    const onFormatChange = vi.fn();
    render(
      <DataExportForm
        {...defaultProps}
        format="json"
        onFormatChange={onFormatChange}
      />,
    );
    const csvRadio = screen.getByLabelText(/CSV/i);
    await user.click(csvRadio);
    expect(onFormatChange).toHaveBeenCalledWith("csv");
  });

  it("renders all data type checkboxes", () => {
    render(<DataExportForm {...defaultProps} />);
    expect(screen.getByText("Data to Include")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Drops")).toBeInTheDocument();
    expect(screen.getByText("Submissions")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("displays checked state for selected data types", () => {
    const selectedData = new Set<
      "profile" | "links" | "drops" | "submissions" | "analytics"
    >(["profile", "links"]);
    render(<DataExportForm {...defaultProps} selectedData={selectedData} />);
    const profileCheckbox = screen
      .getByText("Profile")
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    const linksCheckbox = screen
      .getByText("Links")
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    expect(profileCheckbox).toBeChecked();
    expect(linksCheckbox).toBeChecked();
  });

  it("displays unchecked state for unselected data types", () => {
    const selectedData = new Set<
      "profile" | "links" | "drops" | "submissions" | "analytics"
    >(["profile"]);
    render(<DataExportForm {...defaultProps} selectedData={selectedData} />);
    const dropsCheckbox = screen
      .getByText("Drops")
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    expect(dropsCheckbox).not.toBeChecked();
  });

  it("calls onToggleDataType when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggleDataType = vi.fn();
    render(
      <DataExportForm {...defaultProps} onToggleDataType={onToggleDataType} />,
    );
    const dropsCheckbox = screen
      .getByText("Drops")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(dropsCheckbox);
    expect(onToggleDataType).toHaveBeenCalledWith("drops");
  });

  it("displays GDPR notice", () => {
    render(<DataExportForm {...defaultProps} />);
    expect(
      screen.getByText(
        /This export contains all your personal data stored in OneLink/i,
      ),
    ).toBeInTheDocument();
  });
});
