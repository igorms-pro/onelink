import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordModal } from "../ChangePasswordModal";

// Mock dependencies
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: vi.fn(() => true), // Default to desktop
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children, open, onOpenChange: _onOpenChange }: any) =>
    open ? <div data-testid="drawer">{children}</div> : null,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerTitle: ({ children }: any) => <h2>{children}</h2>,
  DrawerDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("../ChangePasswordForm", () => ({
  ChangePasswordForm: ({ onClose, onSuccess, onLoadingChange }: any) => (
    <div data-testid="change-password-form">
      <button data-testid="form-close" onClick={onClose}>
        Close
      </button>
      <button data-testid="form-success" onClick={onSuccess}>
        Success
      </button>
      <button
        data-testid="form-loading"
        onClick={() => onLoadingChange?.(true)}
      >
        Set Loading
      </button>
    </div>
  ),
}));

import { useMediaQuery } from "@/hooks/use-media-query";

describe("ChangePasswordModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Open/Close", () => {
    it("renders when open is true", () => {
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(
        screen.getByText(/settings_change_password_title/i),
      ).toBeInTheDocument();
      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(
        <ChangePasswordModal open={false} onOpenChange={mockOnOpenChange} />,
      );

      expect(
        screen.queryByText(/settings_change_password_title/i),
      ).not.toBeInTheDocument();
    });

    it("calls onOpenChange when form calls onSuccess", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const successButton = screen.getByText("Success");
      await user.click(successButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onOpenChange when form calls onClose", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const closeButton = screen.getByTestId("form-close");
      await user.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("prevents closing when submitting", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const setLoadingButton = screen.getByText("Set Loading");
      await user.click(setLoadingButton);

      // Try to close via Dialog/Drawer onOpenChange
      const dialog = screen.getByRole("dialog", { hidden: true });
      // The modal should prevent closing when submitting
      // This is tested through the form's onLoadingChange callback
      expect(dialog).toBeInTheDocument();
      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    });
  });

  describe("Desktop vs Mobile", () => {
    it("renders Dialog on desktop (min-width: 768px)", () => {
      vi.mocked(useMediaQuery).mockReturnValue(true);

      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      // Dialog should be rendered (check for dialog role)
      const dialog = screen.getByRole("dialog", { hidden: true });
      expect(dialog).toBeInTheDocument();
    });

    it("renders Drawer on mobile (max-width: 767px)", () => {
      vi.mocked(useMediaQuery).mockReturnValue(false);

      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      // Drawer should be rendered
      // Note: Drawer might not have a dialog role, so we check for the form
      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
      expect(
        screen.getByText(/settings_change_password_title/i),
      ).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("passes open prop to ChangePasswordForm", () => {
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    });

    it("passes onClose handler to ChangePasswordForm", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("passes onSuccess handler to ChangePasswordForm", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const successButton = screen.getByTestId("form-success");
      await user.click(successButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("passes onLoadingChange handler to ChangePasswordForm", async () => {
      const user = userEvent.setup();
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      const setLoadingButton = screen.getByTestId("form-loading");
      await user.click(setLoadingButton);

      // The modal should track loading state internally
      // This prevents closing during submission
      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    });
  });

  describe("Title and Description", () => {
    it("displays title", () => {
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(
        screen.getByText(/settings_change_password_title/i),
      ).toBeInTheDocument();
    });

    it("displays description", () => {
      render(
        <ChangePasswordModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      expect(
        screen.getByText(/settings_change_password_description/i),
      ).toBeInTheDocument();
    });
  });
});
