import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountModal } from "../DeleteAccountModal";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: vi.fn(() => false), // Default to mobile
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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
    password,
    onPasswordChange,
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
        data-testid="password-input"
        id="delete-password"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        disabled={isLoading}
      />
      <input
        data-testid="confirm-checkbox"
        id="delete-confirm"
        type="checkbox"
        checked={confirmChecked}
        onChange={(e) => onConfirmChange(e.target.checked)}
        disabled={isLoading}
      />
      <button
        data-testid="submit-button"
        type="submit"
        disabled={!isValid || isLoading}
      >
        Submit
      </button>
      <button
        data-testid="cancel-button"
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

import { useMediaQuery } from "@/hooks/use-media-query";

describe("DeleteAccountModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal States", () => {
    it("renders when open is true", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByText(/Delete Account/i)).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-warning")).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(
        <DeleteAccountModal open={false} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.queryByText(/Delete Account/i)).not.toBeInTheDocument();
    });

    it("calls onOpenChange when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("resets form when modal is closed", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");

      await user.type(passwordInput, "testpassword");
      await user.click(checkbox);

      await waitFor(() => {
        expect(passwordInput).toHaveValue("testpassword");
        expect(checkbox).toBeChecked();
      });

      // Close modal - this should reset the form
      await user.click(screen.getByTestId("cancel-button"));
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });

      // Reopen modal to check reset
      rerender(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const resetPasswordInput = screen.getByTestId("password-input");
      const resetCheckbox = screen.getByTestId("confirm-checkbox");

      expect(resetPasswordInput).toHaveValue("");
      expect(resetCheckbox).not.toBeChecked();
    });

    it.skip("prevents closing when loading", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "testpassword");
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
      const cancelButton = screen.getByTestId("cancel-button");
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

      expect(screen.getByText(/Delete Account/i)).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });

    it("renders Dialog on desktop (min-width: 641px)", () => {
      vi.mocked(useMediaQuery).mockReturnValue(false);

      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByText(/Delete Account/i)).toBeInTheDocument();
      expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("passes password state to form", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      await user.type(passwordInput, "testpassword");

      expect(passwordInput).toHaveValue("testpassword");
    });

    it("passes confirmChecked state to form", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const checkbox = screen.getByTestId("confirm-checkbox");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("calculates isValid based on password and checkbox", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enable with password and checkbox
      await user.type(passwordInput, "testpassword");
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
    it.skip("handles successful submission", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "testpassword");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers to complete submission (1500ms delay in component)
      vi.advanceTimersByTime(1500);

      // Wait for async operation
      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });

      vi.useRealTimers();
    });

    it.skip("shows error toast on submission failure", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "testpassword");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers - the component will handle the submission
      vi.advanceTimersByTime(1500);

      // The modal should handle errors internally
      // We verify the form is still present (error doesn't close modal)
      await waitFor(
        () => {
          expect(screen.getByTestId("delete-account-form")).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      vi.useRealTimers();
    });

    it.skip("resets form after successful submission", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const { rerender } = render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "testpassword");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers to complete submission (1500ms delay in component)
      vi.advanceTimersByTime(1500);

      // Wait for submission to complete
      await waitFor(
        () => {
          expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        },
        { timeout: 1000 },
      );

      // Reopen modal to check reset
      rerender(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const resetPasswordInput = screen.getByTestId("password-input");
      const resetCheckbox = screen.getByTestId("confirm-checkbox");

      expect(resetPasswordInput).toHaveValue("");
      expect(resetCheckbox).not.toBeChecked();

      vi.useRealTimers();
    });
  });

  describe("Title and Description", () => {
    it("displays title with red styling", () => {
      render(
        <DeleteAccountModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const title = screen.getByText(/Delete Account/i);
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

      const passwordInput = screen.getByTestId("password-input");
      const checkbox = screen.getByTestId("confirm-checkbox");
      const submitButton = screen.getByTestId("submit-button");
      const cancelButton = screen.getByTestId("cancel-button");

      await user.type(passwordInput, "testpassword");
      await user.click(checkbox);
      await user.click(submitButton);

      // Advance timers slightly to trigger loading state
      vi.advanceTimersByTime(100);

      await waitFor(
        () => {
          expect(passwordInput).toBeDisabled();
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
