import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportModal } from "../DataExportModal";

// i18n is already configured in vitest.setup.ts - no need to mock

// Mock use-media-query
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: () => false, // Desktop by default
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(globalThis, "URL", {
  value: {
    ...URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

describe("DataExportModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
    // Restore any document mocks
    vi.restoreAllMocks();
  });

  it("renders modal when open", () => {
    render(<DataExportModal {...defaultProps} />);
    expect(screen.getByText("settings_data_export")).toBeInTheDocument();
    expect(screen.getByText("settings_export_description")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<DataExportModal {...defaultProps} open={false} />);
    expect(screen.queryByText("settings_data_export")).not.toBeInTheDocument();
  });

  it("renders DataExportForm", () => {
    render(<DataExportModal {...defaultProps} />);
    expect(screen.getByText("settings_export_format")).toBeInTheDocument();
    expect(
      screen.getByText("settings_export_data_to_include"),
    ).toBeInTheDocument();
  });

  it("renders generate button initially", () => {
    render(<DataExportModal {...defaultProps} />);
    expect(screen.getByText("settings_export_generate")).toBeInTheDocument();
  });

  it("calls onOpenChange when modal is closed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DataExportModal {...defaultProps} onOpenChange={onOpenChange} />);
    const cancelButton = screen.getByText("common_cancel");
    await user.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.skip("shows progress when generating", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DataExportModal {...defaultProps} />);
    const generateButton = screen.getByText("settings_export_generate");

    await act(async () => {
      await user.click(generateButton);
    });

    // Advance timers to trigger progress updates (progress interval is 200ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Generating export...")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    vi.useRealTimers();
  });

  it.skip("shows ready state after generation completes", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DataExportModal {...defaultProps} />);
    const generateButton = screen.getByText("settings_export_generate");

    await act(async () => {
      await user.click(generateButton);
    });

    // Advance timers to complete generation (2000ms delay + progress intervals)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Export ready!")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    vi.useRealTimers();
  });

  it.skip("shows download button when ready", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DataExportModal {...defaultProps} />);
    const generateButton = screen.getByText("settings_export_generate");

    await act(async () => {
      await user.click(generateButton);
    });

    // Advance timers to complete generation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Download")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    vi.useRealTimers();
  });

  it.skip("handles download click", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    // Mock document.createElement and appendChild
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
    const appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => mockLink as unknown as Node);
    const removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation(() => mockLink as unknown as Node);

    render(<DataExportModal {...defaultProps} />);
    const generateButton = screen.getByText("settings_export_generate");

    await act(async () => {
      await user.click(generateButton);
    });

    // Advance timers to complete generation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Download")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const downloadButton = screen.getByText("Download");
    await act(async () => {
      await user.click(downloadButton);
    });
    expect(mockLink.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    vi.useRealTimers();
  });

  it.skip("revokes object URL on close", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const onOpenChange = vi.fn();
    render(<DataExportModal {...defaultProps} onOpenChange={onOpenChange} />);
    const generateButton = screen.getByText("settings_export_generate");

    await act(async () => {
      await user.click(generateButton);
    });

    // Advance timers to complete generation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Close")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const closeButton = screen.getByText("Close");
    await act(async () => {
      await user.click(closeButton);
    });
    expect(mockRevokeObjectURL).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("disables generate button when no data selected", async () => {
    const user = userEvent.setup();
    render(<DataExportModal {...defaultProps} />);
    // Uncheck all checkboxes
    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      if (checkbox instanceof HTMLInputElement && checkbox.checked) {
        await user.click(checkbox);
      }
    }
    const generateButton = screen.getByText("settings_export_generate");
    expect(generateButton.closest("button")).toBeDisabled();
  });
});
