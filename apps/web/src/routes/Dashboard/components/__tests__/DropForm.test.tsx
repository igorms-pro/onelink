import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropForm } from "../DropForm";
import { toast } from "sonner";
import type { DropRow } from "../../types";

// Mock supabase
const mockFrom = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe("DropForm", () => {
  const mockOnDropCreated = vi.fn();
  const defaultProps = {
    profileId: "profile-1",
    onDropCreated: mockOnDropCreated,
    isFree: false,
    freeLimit: 3,
    totalItems: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with input and submit button", () => {
    render(<DropForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Label (e.g. Upload assets)"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Drop" }),
    ).toBeInTheDocument();
  });

  it("disables form when limit is reached for free plan", () => {
    render(<DropForm {...defaultProps} isFree={true} totalItems={3} />);
    const input = screen.getByPlaceholderText("Label (e.g. Upload assets)");
    const button = screen.getByRole("button", { name: "Add Drop" });
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByText(/Free plan limit reached/)).toBeInTheDocument();
  });

  it("shows error when submitting empty label", async () => {
    const user = userEvent.setup();
    render(<DropForm {...defaultProps} />);
    const button = screen.getByRole("button", { name: "Add Drop" });
    await user.click(button);

    // The handler checks for empty label and shows toast error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Label is required");
    });
  });

  it("shows error when free limit is reached on submit", async () => {
    // When limit is reached, form is disabled (pointer-events-none)
    // So we can't actually submit. The test should verify the form is disabled.
    render(<DropForm {...defaultProps} isFree={true} totalItems={3} />);
    const button = screen.getByRole("button", { name: "Add Drop" });
    const form = button.closest("form");
    expect(form).toHaveClass("pointer-events-none");
    expect(button).toBeDisabled();
    expect(screen.getByText(/Free plan limit reached/)).toBeInTheDocument();
  });

  it("creates drop successfully", async () => {
    const user = userEvent.setup();
    const mockDrop: DropRow = {
      id: "drop-1",
      label: "Test Drop",
      emoji: null,
      order: 1,
      is_active: true,
    };

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockDrop, error: null });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));

    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    render(<DropForm {...defaultProps} />);
    const input = screen.getByPlaceholderText("Label (e.g. Upload assets)");
    const button = screen.getByRole("button", { name: "Add Drop" });

    await user.type(input, "Test Drop");
    await user.click(button);

    await waitFor(() => {
      expect(mockOnDropCreated).toHaveBeenCalledWith(mockDrop);
      expect(toast.success).toHaveBeenCalledWith("Drop created successfully");
    });
    expect(input).toHaveValue("");
  });

  it("handles creation error", async () => {
    const user = userEvent.setup();
    const mockError = { message: "Database error" };

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: mockError });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));

    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    render(<DropForm {...defaultProps} />);
    const input = screen.getByPlaceholderText("Label (e.g. Upload assets)");
    const button = screen.getByRole("button", { name: "Add Drop" });

    await user.type(input, "Test Drop");
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create drop");
    });
  });

  it("does not submit when profileId is null", async () => {
    const user = userEvent.setup();
    render(<DropForm {...defaultProps} profileId={null} />);
    const input = screen.getByPlaceholderText("Label (e.g. Upload assets)");
    const button = screen.getByRole("button", { name: "Add Drop" });

    // Button is not disabled by default, but submission is prevented in handler
    await user.type(input, "Test Drop");
    await user.click(button);

    // The handler checks profileId and returns early, so onDropCreated is never called
    await waitFor(
      () => {
        expect(mockOnDropCreated).not.toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });
});
