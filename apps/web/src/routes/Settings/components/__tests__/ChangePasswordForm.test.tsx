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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

      expect(
        screen.getByLabelText(/settings_change_password_current_label/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/settings_change_password_new_label/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/settings_change_password_confirm_label/i),
      ).toBeInTheDocument();
    });

    it("renders cancel and submit buttons", () => {
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText(/common_cancel/i)).toBeInTheDocument();
      expect(
        screen.getByText(/settings_change_password_submit/i),
      ).toBeInTheDocument();
    });

    it("shows password hint for new password field", () => {
      render(
        <ChangePasswordForm
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(
        screen.getByText(/settings_change_password_min_length_hint/i),
      ).toBeInTheDocument();
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
        /settings_change_password_current_label/i,
      ) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
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
        /settings_change_password_current_label/i,
      ) as HTMLInputElement;
      const resetNewPassword = screen.getByLabelText(
        /settings_change_password_new_label/i,
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

      const submitButton = screen.getByText(/settings_change_password_submit/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_current_required/i),
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "old123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_new_required/i),
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "short");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(
          /settings_change_password_min_length/i,
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "samepassword123");
      await user.type(newPasswordInput, "samepassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_different/i),
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_confirm_required/i),
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "old123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "different123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_match/i),
        ).toBeInTheDocument();
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

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
          "settings_change_password_success",
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "wrongpassword");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_current_invalid/i),
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "settings_change_password_update_failed",
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

      await user.type(currentPasswordInput, "oldpassword123");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings_change_password_updating/i),
        ).toBeInTheDocument();
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);

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

      const cancelButton = screen.getByText(/common_cancel/i);
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

      const currentPasswordInput = screen.getByLabelText(
        /settings_change_password_current_label/i,
      );
      const newPasswordInput = screen.getByLabelText(
        /settings_change_password_new_label/i,
      );
      const confirmPasswordInput = screen.getByLabelText(
        /settings_change_password_confirm_label/i,
      );
      const submitButton = screen.getByText(/settings_change_password_submit/i);
      const cancelButton = screen.getByText(/common_cancel/i);

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
