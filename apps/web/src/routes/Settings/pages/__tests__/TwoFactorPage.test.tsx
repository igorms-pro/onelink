import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import TwoFactorPage from "../TwoFactorPage";
import type { User } from "@supabase/supabase-js";

// Mock dependencies used by TwoFactorPage
vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock("@/components/Header", () => ({
  Header: ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <header data-testid="mock-header">
      <button onClick={onSettingsClick}>Settings</button>
    </header>
  ),
}));

vi.mock("../TwoFactor/useSupabaseMFA", () => ({
  useSupabaseMFA: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code">{value}</div>
  ),
}));

// Mock clipboard API (used by BackupCodes/secret copy)
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

import { useAuth } from "@/lib/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSupabaseMFA } from "../TwoFactor/useSupabaseMFA";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

describe("TwoFactorPage (Supabase MFA)", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    vi.mocked(useRequireAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "inactive",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });
  });

  it("renders page title and description", () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("two-factor-page-title")).toBeInTheDocument();
    expect(
      screen.getByTestId("two-factor-page-description"),
    ).toBeInTheDocument();
  });

  it("shows disabled state when MFA state is inactive", () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("two-factor-disabled-state")).toBeInTheDocument();
    expect(
      screen.getByTestId("two-factor-disabled-status"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("enable-2fa-button")).toBeInTheDocument();
  });

  it("starts MFA enrollment when enable button is clicked", () => {
    const enrollMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "inactive",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "",
      enroll: enrollMock,
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    const enableButton = screen.getByTestId("enable-2fa-button");
    fireEvent.click(enableButton);

    expect(enrollMock).toHaveBeenCalled();
  });

  it("shows setup state with QR code and secret when enrolling", () => {
    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "enrolling",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "otpauth://totp/OneLink:test?secret=TESTSECRET",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("two-factor-setup-state")).toBeInTheDocument();
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
    expect(screen.getByTestId("secret-key-container")).toBeInTheDocument();
    expect(screen.getByTestId("secret-key-value")).toHaveTextContent(
      "TESTSECRET",
    );
  });

  it("disables verify button when verification code is too short", () => {
    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "enrolling",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "otpauth://totp/OneLink:test?secret=TESTSECRET",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    const verifyButton = screen.getByTestId("verify-and-activate-button");
    expect(verifyButton).toBeDisabled();
  });

  it("verifies enrollment when valid code is submitted", async () => {
    const verifyEnrollmentMock = vi.fn().mockResolvedValue(true);

    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "enrolling",
      loading: false,
      submitting: false,
      factors: { totp: [] },
      qrCodeData: "otpauth://totp/OneLink:test?secret=TESTSECRET",
      enroll: vi.fn(),
      verifyEnrollment: verifyEnrollmentMock,
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    const codeInput = screen.getByTestId(
      "verification-code-input",
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = screen.getByTestId("verify-and-activate-button");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    expect(verifyEnrollmentMock).toHaveBeenCalledWith("123456");
  });

  it("shows active state when MFA is active", () => {
    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      factors: {
        totp: [
          {
            id: "factor-1",
            factor_type: "totp",
          } as any,
        ],
      },
      qrCodeData: "",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: vi.fn(),
      resetEnrollment: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("two-factor-active-state")).toBeInTheDocument();
  });

  it("calls unenroll when disabling MFA", () => {
    const unenrollMock = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useSupabaseMFA).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      factors: {
        totp: [
          {
            id: "factor-1",
            factor_type: "totp",
          } as any,
        ],
      },
      qrCodeData: "",
      enroll: vi.fn(),
      verifyEnrollment: vi.fn(),
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
      unenroll: unenrollMock,
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    const passwordInput = screen.getByTestId(
      "disable-password-input",
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const disableButton = screen.getByTestId("disable-2fa-button");
    fireEvent.click(disableButton);

    expect(unenrollMock).toHaveBeenCalledWith("factor-1");
  });

  it("navigates back to settings when back button is clicked", () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    const backButton = screen.getByTestId("back-to-settings-button");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
