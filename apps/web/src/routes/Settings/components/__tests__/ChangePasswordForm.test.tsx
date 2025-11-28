import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "../ChangePasswordForm";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Using global i18n mock from vitest.setup.ts that returns English translations

import { supabase } from "@/lib/supabase";

describe("ChangePasswordForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnLoadingChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all form fields", () => {
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    });

    it("renders cancel and submit buttons", () => {
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });

    it("shows password validation rules for new password field", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const newPasswordInput = screen.getByTestId("new-password-input");
      await user.type(newPasswordInput, "test");

      await waitFor(() => {
        expect(
          screen.getByTestId("password-validation-rules"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("password-rule-min_length"),
        ).toBeInTheDocument();
      });
    });

    it("resets form when open changes to false", () => {
      const { rerender } = render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onLoadingChange={mockOnLoadingChange}
        />,
      );

      const currentPasswordInput = screen.getByLabelText(
        "Current Password",
      ) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(
        "New Password",
      ) as HTMLInputElement;

      fireEvent.change(currentPasswordInput, { target: { value: "old123" } });
      fireEvent.change(newPasswordInput, { target: { value: "new123456" } });

      expect(currentPasswordInput.value).toBe("old123");
      expect(newPasswordInput.value).toBe("new123456");

      rerender(
        <ChangePasswordForm
          open={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onLoadingChange={mockOnLoadingChange}
        />,
      );

      rerender(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onLoadingChange={mockOnLoadingChange}
        />,
      );

      const resetCurrentPassword = screen.getByLabelText(
        "Current Password",
      ) as HTMLInputElement;
      const resetNewPassword = screen.getByLabelText(
        "New Password",
      ) as HTMLInputElement;

      expect(resetCurrentPassword.value).toBe("");
      expect(resetNewPassword.value).toBe("");
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Validation", () => {
    it("shows error when current password is empty", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const submitButton = screen.getByText("Change Password");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Current password is required"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when new password is empty", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "old123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("New password is required"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when new password is less than 8 characters", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "short");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(
          "Password must be at least 8 characters",
        );
        // Should have both error and hint, but error should be in red
        const errorMessage = errorMessages.find((el) =>
          el.classList.contains("text-red-600"),
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it("shows error when new password matches current password", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "samepassword123");
      await user.type(newPasswordInput, "samepassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "New password must be different from current password",
          ),
        ).toBeInTheDocument();
      });
    });

    it("shows error when confirm password is empty", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please confirm your new password"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "different123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("calls onSuccess when password is changed successfully", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: { email: "test@example.com", id: "user-1" },
        },
        error: null,
      } as any);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "oldpassword123",
        });
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({
          password: "newpassword123",
        });
        expect(toast.success).toHaveBeenCalledWith(
          "Password changed successfully",
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("shows error when current password is incorrect", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: { email: "test@example.com", id: "user-1" },
        },
        error: null,
      } as any);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid password" } as any,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "wrongpassword");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Current password is incorrect"),
        ).toBeInTheDocument();
      });
    });

    it("shows error toast when update fails", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: { email: "test@example.com", id: "user-1" },
        },
        error: null,
      } as any);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: { message: "Update failed" } as any,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to update password. Please try again.",
        );
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it("shows error when user is not found", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      // The error is thrown and toast.error should be called
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("Loading States", () => {
    it("disables form fields when loading", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: {
                    user: { email: "test@example.com", id: "user-1" },
                  },
                  error: null,
                } as any),
              100,
            );
          }),
      );
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onLoadingChange={mockOnLoadingChange}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(currentPasswordInput).toBeDisabled();
        expect(newPasswordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
        expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
      });
    });

    it("shows updating text on submit button when loading", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: {
                    user: { email: "test@example.com", id: "user-1" },
                  },
                  error: null,
                } as any),
              100,
            );
          }),
      );
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Updating...")).toBeInTheDocument();
      });
    });

    it("calls onLoadingChange when loading state changes", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: { email: "test@example.com", id: "user-1" },
        },
        error: null,
      } as any);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any);

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onLoadingChange={mockOnLoadingChange}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
        expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Cancel Button", () => {
    it("calls onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not call onClose when cancel is clicked during loading", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.getUser).mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to keep loading
          }),
      );

      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const currentPasswordInput = screen.getByLabelText("Current Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm New Password",
      );
      const submitButton = screen.getByText("Change Password");
      const cancelButton = screen.getByText("Cancel");

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(cancelButton).toBeDisabled();
      });

      await user.click(cancelButton);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
