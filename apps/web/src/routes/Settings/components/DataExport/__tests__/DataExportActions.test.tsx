import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportActions } from "../DataExportActions";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DataExportActions", () => {
  const defaultProps = {
    isGenerating: false,
    isReady: false,
    hasSelectedData: true,
    onGenerate: vi.fn(),
    onDownload: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders generate button when not ready", () => {
    render(<DataExportActions {...defaultProps} />);
    expect(screen.getByText("settings_export_generate")).toBeInTheDocument();
  });

  it("renders download button when ready", () => {
    render(<DataExportActions {...defaultProps} isReady={true} />);
    expect(screen.getByText("settings_export_download")).toBeInTheDocument();
    expect(
      screen.queryByText("settings_export_generate"),
    ).not.toBeInTheDocument();
  });

  it("calls onGenerate when generate button is clicked", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<DataExportActions {...defaultProps} onGenerate={onGenerate} />);
    const generateButton = screen.getByText("settings_export_generate");
    await user.click(generateButton);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("calls onDownload when download button is clicked", async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    render(
      <DataExportActions
        {...defaultProps}
        isReady={true}
        onDownload={onDownload}
      />,
    );
    const downloadButton = screen.getByText("settings_export_download");
    await user.click(downloadButton);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel/close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DataExportActions {...defaultProps} onClose={onClose} />);
    const cancelButton = screen.getByText("common_cancel");
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows close button text when ready", () => {
    render(<DataExportActions {...defaultProps} isReady={true} />);
    expect(screen.getByText("common_close")).toBeInTheDocument();
    expect(screen.queryByText("common_cancel")).not.toBeInTheDocument();
  });

  it("shows cancel button text when not ready", () => {
    render(<DataExportActions {...defaultProps} isReady={false} />);
    expect(screen.getByText("common_cancel")).toBeInTheDocument();
    expect(screen.queryByText("common_close")).not.toBeInTheDocument();
  });

  it("disables generate button when generating", () => {
    render(<DataExportActions {...defaultProps} isGenerating={true} />);
    const generateButton = screen.getByText("settings_export_generating");
    expect(generateButton.closest("button")).toBeDisabled();
  });

  it("disables generate button when no data selected", () => {
    render(<DataExportActions {...defaultProps} hasSelectedData={false} />);
    const generateButton = screen.getByText("settings_export_generate");
    expect(generateButton.closest("button")).toBeDisabled();
  });

  it("shows loading spinner when generating", () => {
    render(<DataExportActions {...defaultProps} isGenerating={true} />);
    expect(screen.getByText("settings_export_generating")).toBeInTheDocument();
    // Check for spinner icon
    const button = screen
      .getByText("settings_export_generating")
      .closest("button");
    const spinner = button?.querySelector("svg");
    expect(spinner).toBeInTheDocument();
  });

  it("enables generate button when data is selected and not generating", () => {
    render(
      <DataExportActions
        {...defaultProps}
        hasSelectedData={true}
        isGenerating={false}
      />,
    );
    const generateButton = screen.getByText("settings_export_generate");
    expect(generateButton.closest("button")).not.toBeDisabled();
  });
});
