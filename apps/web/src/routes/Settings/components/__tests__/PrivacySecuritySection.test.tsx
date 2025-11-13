import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { PrivacySecuritySection } from "../PrivacySecuritySection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock ChangePasswordModal
vi.mock("../ChangePasswordModal", () => ({
  ChangePasswordModal: ({
    open,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="change-password-modal">Change Password Modal</div>
    ) : null,
}));

// Mock DeleteAccountModal
vi.mock("../DeleteAccountModal", () => ({
  DeleteAccountModal: ({
    open,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="delete-account-modal">Delete Account Modal</div>
    ) : null,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PrivacySecuritySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    renderWithRouter(<PrivacySecuritySection />);
    expect(
      screen.getByTestId("settings-privacy-security-section"),
    ).toBeInTheDocument();
    expect(screen.getByText("settings_privacy_security")).toBeInTheDocument();
  });

  it("renders all action buttons", () => {
    renderWithRouter(<PrivacySecuritySection />);
    expect(screen.getByTestId("settings-change-password")).toBeInTheDocument();
    expect(screen.getByTestId("settings-two-factor")).toBeInTheDocument();
    expect(screen.getByTestId("settings-delete-account")).toBeInTheDocument();
  });

  it("opens change password modal when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PrivacySecuritySection />);
    const changePasswordButton = screen.getByTestId("settings-change-password");
    await user.click(changePasswordButton);
    expect(screen.getByTestId("change-password-modal")).toBeInTheDocument();
  });

  it("opens delete account modal when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PrivacySecuritySection />);
    const deleteAccountButton = screen.getByTestId("settings-delete-account");
    await user.click(deleteAccountButton);
    expect(screen.getByTestId("delete-account-modal")).toBeInTheDocument();
  });

  it("navigates to 2FA page when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PrivacySecuritySection />);
    const twoFactorButton = screen.getByTestId("settings-two-factor");
    await user.click(twoFactorButton);
    expect(mockNavigate).toHaveBeenCalledWith("/settings/2fa");
  });
});
