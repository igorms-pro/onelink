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
  const mockOnMfaCodeChange = vi.fn();
  const mockOnConfirmChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders MFA code field", () => {
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
        screen.getByLabelText(/settings_delete_account_mfa_label/i),
      ).toBeInTheDocument();
    });

    it("renders confirmation checkbox", () => {
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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

    it("displays MFA code value", () => {
      render(
        <DeleteAccountForm
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const mfaCodeInput = screen.getByLabelText(
        /settings_delete_account_mfa_label/i,
      ) as HTMLInputElement;
      expect(mfaCodeInput.value).toBe("123456");
    });

    it("displays checkbox checked state", () => {
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
    it("calls onMfaCodeChange when MFA code is typed", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const mfaCodeInput = screen.getByLabelText(
        /settings_delete_account_mfa_label/i,
      );
      await user.type(mfaCodeInput, "123456");

      // user.type sends each character individually
      // Verify that onMfaCodeChange was called multiple times (once per character)
      expect(mockOnMfaCodeChange).toHaveBeenCalled();
      expect(mockOnMfaCodeChange.mock.calls.length).toBeGreaterThan(0);

      // Update the component with the new MFA code value to verify it displays correctly
      rerender(
        <DeleteAccountForm
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const updatedMfaCodeInput = screen.getByLabelText(
        /settings_delete_account_mfa_label/i,
      ) as HTMLInputElement;
      expect(updatedMfaCodeInput.value).toBe("123456");
    });

    it("calls onConfirmChange when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
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

    it("disables submit button when MFA code is empty but checkbox is checked", () => {
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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

    it("disables submit button when MFA code is filled but checkbox is not checked", () => {
      render(
        <DeleteAccountForm
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
          confirmChecked={false}
          onConfirmChange={mockOnConfirmChange}
          error="Invalid MFA code"
          isLoading={false}
          isValid={false}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("Invalid MFA code")).toBeInTheDocument();
    });

    it("does not display error message when error is null", () => {
      render(
        <DeleteAccountForm
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode=""
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
          confirmChecked={true}
          onConfirmChange={mockOnConfirmChange}
          error={null}
          isLoading={true}
          isValid={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const mfaCodeInput = screen.getByLabelText(
        /settings_delete_account_mfa_label/i,
      );
      const checkbox = screen.getByLabelText(
        /settings_delete_account_confirm_text/i,
      );
      const submitButton = screen.getByText(/settings_delete_account_button/i);
      const cancelButton = screen.getByText(/common_cancel/i);

      expect(mfaCodeInput).toBeDisabled();
      expect(checkbox).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("shows loading spinner when loading", () => {
      render(
        <DeleteAccountForm
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
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
          mfaCode="123456"
          onMfaCodeChange={mockOnMfaCodeChange}
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
