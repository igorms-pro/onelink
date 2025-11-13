import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportForm } from "../DataExportForm";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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
    expect(screen.getByText("settings_export_format")).toBeInTheDocument();
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
    expect(
      screen.getByText("settings_export_data_to_include"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("settings_export_data_profile"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_export_data_links")).toBeInTheDocument();
    expect(screen.getByText("settings_export_data_drops")).toBeInTheDocument();
    expect(
      screen.getByText("settings_export_data_submissions"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("settings_export_data_analytics"),
    ).toBeInTheDocument();
  });

  it("displays checked state for selected data types", () => {
    const selectedData = new Set<
      "profile" | "links" | "drops" | "submissions" | "analytics"
    >(["profile", "links"]);
    render(<DataExportForm {...defaultProps} selectedData={selectedData} />);
    const profileCheckbox = screen
      .getByText("settings_export_data_profile")
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    const linksCheckbox = screen
      .getByText("settings_export_data_links")
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
      .getByText("settings_export_data_drops")
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
      .getByText("settings_export_data_drops")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(dropsCheckbox);
    expect(onToggleDataType).toHaveBeenCalledWith("drops");
  });

  it("displays GDPR notice", () => {
    render(<DataExportForm {...defaultProps} />);
    expect(screen.getByText("settings_export_gdpr_notice")).toBeInTheDocument();
  });
});
