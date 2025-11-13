import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportActions } from "../DataExportActions";

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
    expect(screen.getByText("Generate Export")).toBeInTheDocument();
  });

  it("renders download button when ready", () => {
    render(<DataExportActions {...defaultProps} isReady={true} />);
    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.queryByText("Generate Export")).not.toBeInTheDocument();
  });

  it("calls onGenerate when generate button is clicked", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<DataExportActions {...defaultProps} onGenerate={onGenerate} />);
    const generateButton = screen.getByText("Generate Export");
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
    const downloadButton = screen.getByText("Download");
    await user.click(downloadButton);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel/close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DataExportActions {...defaultProps} onClose={onClose} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows close button text when ready", () => {
    render(<DataExportActions {...defaultProps} isReady={true} />);
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("shows cancel button text when not ready", () => {
    render(<DataExportActions {...defaultProps} isReady={false} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("disables generate button when generating", () => {
    render(<DataExportActions {...defaultProps} isGenerating={true} />);
    const generateButton = screen.getByText("Generating export...");
    expect(generateButton.closest("button")).toBeDisabled();
  });

  it("disables generate button when no data selected", () => {
    render(<DataExportActions {...defaultProps} hasSelectedData={false} />);
    const generateButton = screen.getByText("Generate Export");
    expect(generateButton.closest("button")).toBeDisabled();
  });

  it("shows loading spinner when generating", () => {
    render(<DataExportActions {...defaultProps} isGenerating={true} />);
    expect(screen.getByText("Generating export...")).toBeInTheDocument();
    // Check for spinner icon
    const button = screen.getByText("Generating export...").closest("button");
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
    const generateButton = screen.getByText("Generate Export");
    expect(generateButton.closest("button")).not.toBeDisabled();
  });
});
