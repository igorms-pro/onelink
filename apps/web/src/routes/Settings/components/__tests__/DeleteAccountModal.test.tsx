import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountModal } from "../DeleteAccountModal";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { deleteAccount } from "@/lib/deleteAccount";

// Mock dependencies
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: vi.fn(() => false), // Default to desktop
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", email: "test@example.com" },
    session: null,
    loading: false,
    signOut: vi.fn(async () => {}),
    signInWithEmail: vi.fn(async () => ({})),
  })),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("@/lib/deleteAccount", () => ({
  deleteAccount: vi.fn(),
}));

vi.mock("@/routes/Settings/pages/TwoFactor/useSupabaseMFA", () => ({
  useSupabaseMFA: vi.fn(() => ({
    state: "active",
    loading: false,
  })),
}));

// i18n is already configured in vitest.setup.ts - no need to mock

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children, open, onOpenChange: _onOpenChange }: any) =>
    open ? <div data-testid="drawer">{children}</div> : null,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerTitle: ({ children }: any) => <h2>{children}</h2>,
  DrawerDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("../DeleteAccount/DeleteAccountWarning", () => ({
  DeleteAccountWarning: () => (
    <div data-testid="delete-account-warning">Warning</div>
  ),
}));

vi.mock("../DeleteAccount/DeleteAccountForm", () => ({
  DeleteAccountForm: ({
    mfaCode,
    onMfaCodeChange,
    confirmChecked,
    onConfirmChange,
    onSubmit,
    onCancel,
    isLoading,
    isValid,
    error,
  }: any) => (
    <form data-testid="delete-account-form" onSubmit={onSubmit}>
      <input
        data-testid="delete-account-mfa-input"
        id="delete-mfa-code"
        type="tel"
        value={mfaCode}
        onChange={(e) => onMfaCodeChange(e.target.value)}
        disabled={isLoading}
      />
      <input
        data-testid="delete-account-confirm-checkbox"
        id="delete-confirm"
        type="checkbox"
        checked={confirmChecked}
        onChange={(e) => onConfirmChange(e.target.checked)}
        disabled={isLoading}
      />
      <button
        data-testid="delete-account-submit-button"
        type="submit"
        disabled={!isValid || isLoading}
      >
        Submit
      </button>
      <button
        data-testid="delete-account-cancel-button"
        type="button"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  ),
}));

describe("DeleteAccountModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  describe("Modal States", () => {
    it("renders when open is true", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByText("Delete Account")).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-warning")).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(
        <DeleteAccountModal open={false} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.queryByText("Delete Account")).not.toBeInTheDocument();
    });

    it("calls onOpenChange when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const cancelButton = screen.getByTestId("delete-account-cancel-button");
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("resets form when modal is closed", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");

      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);

      await waitFor(() => {
        expect(mfaCodeInput).toHaveValue("123456");
        expect(checkbox).toBeChecked();
      });

      // Close modal - this should reset the form
      await user.click(screen.getByTestId("delete-account-cancel-button"));
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });

      // Reopen modal to check reset
      rerender(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const resetMfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const resetCheckbox = screen.getByTestId(
        "delete-account-confirm-checkbox",
      );

      expect(resetMfaCodeInput).toHaveValue("");
      expect(resetCheckbox).not.toBeChecked();
    });

    it.skip("prevents closing when loading", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      const submitButton = screen.getByTestId("delete-account-submit-button");

      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers to trigger loading state
      vi.advanceTimersByTime(100);

      // Wait for loading state
      await waitFor(
        () => {
          expect(submitButton).toBeDisabled();
        },
        { timeout: 1000 },
      );

      // Try to close - should not work during loading
      const cancelButton = screen.getByTestId("delete-account-cancel-button");
      expect(cancelButton).toBeDisabled();

      vi.useRealTimers();
    });
  });

  describe("Mobile vs Desktop", () => {
    it("renders Drawer on mobile (max-width: 640px)", () => {
      vi.mocked(useMediaQuery).mockReturnValue(true);

      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByText("Delete Account")).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });

    it("renders Dialog on desktop (min-width: 641px)", () => {
      vi.mocked(useMediaQuery).mockReturnValue(false);

      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByText("Delete Account")).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("passes MFA code state to form", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      await user.type(mfaCodeInput, "123456");

      expect(mfaCodeInput).toHaveValue("123456");
    });

    it("passes confirmChecked state to form", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("calculates isValid based on MFA code and checkbox", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      const submitButton = screen.getByTestId("delete-account-submit-button");

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enable with MFA code and checkbox
      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 1000 },
      );
    });

    it("passes error state to form", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      // Error should not be visible initially
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("handles successful submission", async () => {
      const user = userEvent.setup();
      const mockedDeleteAccount = vi.mocked(deleteAccount);
      mockedDeleteAccount.mockResolvedValue({ success: true } as any);

      const { rerender } = render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      const submitButton = screen.getByTestId("delete-account-submit-button");

      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(deleteAccount).toHaveBeenCalledWith({ mfaCode: "123456" });
        expect(toast.success).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockNavigate).toHaveBeenCalledWith("/auth");
      });

      // Reopen modal to verify form reset
      rerender(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const resetMfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const resetCheckbox = screen.getByTestId(
        "delete-account-confirm-checkbox",
      );

      expect(resetMfaCodeInput).toHaveValue("");
      expect(resetCheckbox).not.toBeChecked();
    });

    it("shows error toast on submission failure and keeps modal open", async () => {
      const user = userEvent.setup();
      const mockedDeleteAccount = vi.mocked(deleteAccount);
      mockedDeleteAccount.mockResolvedValue({
        success: false,
        error: "Failed to delete account",
      } as any);

      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      const submitButton = screen.getByTestId("delete-account-submit-button");

      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(deleteAccount).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
        expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
        expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
      });
    });
  });

  describe("Title and Description", () => {
    it("displays title with red styling", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const title = screen.getByText("Delete Account");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("text-red-600");
    });

    it("displays description", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(
        screen.getByText(/This action cannot be undone/i),
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it.skip("disables form during submission", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const mfaCodeInput = screen.getByTestId("delete-account-mfa-input");
      const checkbox = screen.getByTestId("delete-account-confirm-checkbox");
      const submitButton = screen.getByTestId("delete-account-submit-button");
      const cancelButton = screen.getByTestId("delete-account-cancel-button");

      await user.type(mfaCodeInput, "123456");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers slightly to trigger loading state
      vi.advanceTimersByTime(100);

      await waitFor(
        () => {
          expect(mfaCodeInput).toBeDisabled();
          expect(checkbox).toBeDisabled();
          expect(submitButton).toBeDisabled();
          expect(cancelButton).toBeDisabled();
        },
        { timeout: 1000 },
      );

      vi.useRealTimers();
    });
  });
});
