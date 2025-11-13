import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountForm } from "../DeleteAccountForm";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DeleteAccountForm", () => {
  const mockOnPasswordChange = vi.fn();
  const mockOnConfirmChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders password field", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByLabelText(/settings_delete_account_password_label/i),
      ).toBeInTheDocument();
    });

    it("renders confirmation checkbox", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const checkbox = screen.getByLabelText(
        /settings_delete_account_confirm_text/i,
      );
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("renders cancel and submit buttons", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/common_cancel/i)).toBeInTheDocument();
      expect(
        screen.getByText(/settings_delete_account_button/i),
      ).toBeInTheDocument();
    });

    it("displays password value", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const passwordInput = screen.getByLabelText(
        /settings_delete_account_password_label/i,
      ) as HTMLInputElement;
      expect(passwordInput.value).toBe("testpassword");
    });

    it("displays checkbox checked state", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const checkbox = screen.getByLabelText(
        /settings_delete_account_confirm_text/i,
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("User Interactions", () => {
    it("calls onPasswordChange when password is typed", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const passwordInput = screen.getByLabelText(
        /settings_delete_account_password_label/i,
      );
      await user.type(passwordInput, "newpassword");

      // user.type sends each character individually
      // Verify that onPasswordChange was called multiple times (once per character)
      expect(mockOnPasswordChange).toHaveBeenCalled();
      expect(mockOnPasswordChange.mock.calls.length).toBeGreaterThan(0);

      // Verify the last call contains the last character typed
      const lastCall =
        mockOnPasswordChange.mock.calls[
          mockOnPasswordChange.mock.calls.length - 1
        ];
      expect(lastCall[0]).toBe("d"); // Last character of "newpassword"

      // Update the component with the new password value to verify it displays correctly
      rerender(
        <DeleteAccountForm
          password="newpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const updatedPasswordInput = screen.getByLabelText(
        /settings_delete_account_password_label/i,
      ) as HTMLInputElement;
      expect(updatedPasswordInput.value).toBe("newpassword");
    });

    it("calls onConfirmChange when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const checkbox = screen.getByLabelText(
        /settings_delete_account_confirm_text/i,
      );
      await user.click(checkbox);

      expect(mockOnConfirmChange).toHaveBeenCalledWith(true);
    });

    it("calls onSubmit when form is submitted", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByText(/common_cancel/i);
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("disables submit button when form is not valid", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when form is valid", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      expect(submitButton).not.toBeDisabled();
    });

    it("disables submit button when password is empty but checkbox is checked", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when password is filled but checkbox is not checked", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when error is provided", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error="Invalid password"
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });

    it("does not display error message when error is null", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      // Error container should not be visible
      const errorContainer = screen.queryByRole("alert");
      expect(errorContainer).not.toBeInTheDocument();
    });

    it("displays error in red styling", () => {
      render(
        <DeleteAccountForm
          password=""
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error="Test error"
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const errorMessage = screen.getByText("Test error");
      expect(errorMessage.closest("div")).toHaveClass("bg-red-50");
    });
  });

  describe("Loading States", () => {
    it("disables form fields when loading", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={true}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const passwordInput = screen.getByLabelText(
        /settings_delete_account_password_label/i,
      );
      const checkbox = screen.getByLabelText(
        /settings_delete_account_confirm_text/i,
      );
      const submitButton = screen.getByText(/settings_delete_account_button/i);
      const cancelButton = screen.getByText(/common_cancel/i);

      expect(passwordInput).toBeDisabled();
      expect(checkbox).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("shows loading spinner when loading", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={true}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      // Check for Loader2 icon (spinner)
      const submitButton = screen.getByText(/settings_delete_account_button/i);
      const spinner = submitButton.querySelector("svg");
      expect(spinner).toBeInTheDocument();
    });

    it("does not show loading spinner when not loading", () => {
      render(
        <DeleteAccountForm
          password="testpassword"
          onPasswordChange={mockOnPasswordChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByText(/settings_delete_account_button/i);
      const spinner = submitButton.querySelector("svg");
      expect(spinner).not.toBeInTheDocument();
    });
  });
});
