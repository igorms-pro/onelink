import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TwoFactorPage from "../TwoFactorPage";
import type { User } from "@supabase/supabase-js";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { signOut: vi.fn(), getUser: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock("../TwoFactor/useTwoFactor", () => ({
  useTwoFactor: vi.fn(),
}));

vi.mock("@/components/Header", () => ({
  Header: ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <header data-testid="mock-header">
      <button onClick={onSettingsClick}>Settings</button>
    </header>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

import { useAuth } from "@/lib/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useNavigate } from "react-router-dom";
import { useTwoFactor } from "../TwoFactor/useTwoFactor";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

describe("TwoFactorPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "disabled",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("two-factor-page-title")).toBeInTheDocument();
    expect(
      screen.getByTestId("two-factor-page-description"),
    ).toBeInTheDocument();
  });

  it("should show disabled state initially", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("two-factor-disabled-state")).toBeInTheDocument();
    expect(
      screen.getByTestId("two-factor-disabled-status"),
    ).toBeInTheDocument();
  });

  it("should show enable button in disabled state", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("enable-2fa-button")).toBeInTheDocument();
  });

  it("should start 2FA setup when enable button is clicked", async () => {
    const mockStartSetup = vi.fn();
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "disabled",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: null,
      startSetup: mockStartSetup,
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = screen.getByTestId("enable-2fa-button");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    expect(mockStartSetup).toHaveBeenCalled();
  });

  it("should display QR code in setup step 1", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "setup",
      loading: false,
      submitting: false,
      secret: "TEST_SECRET_KEY",
      backupCodes: [],
      qrCodeData: "otpauth://totp/test",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("two-factor-setup-state")).toBeInTheDocument();
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should display secret key in setup step 1", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "setup",
      loading: false,
      submitting: false,
      secret: "TEST_SECRET_KEY",
      backupCodes: [],
      qrCodeData: "otpauth://totp/test",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("secret-key-container")).toBeInTheDocument();
    expect(screen.getByTestId("secret-key-value")).toHaveTextContent(
      "TEST_SECRET_KEY",
    );
  });

  it("should copy secret key when copy button is clicked", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "setup",
      loading: false,
      submitting: false,
      secret: "TEST_SECRET_KEY",
      backupCodes: [],
      qrCodeData: "otpauth://totp/test",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const copyButton = screen.getByTestId("copy-secret-button");
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "TEST_SECRET_KEY",
    );
  });

  it.skip("should display backup codes in setup", async () => {
    // Skipped: Feature not fully implemented yet
  });

  it("should validate verification code length", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "setup",
      loading: false,
      submitting: false,
      secret: "TEST_SECRET_KEY",
      backupCodes: [],
      qrCodeData: "otpauth://totp/test",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const verifyButton = screen.getByTestId("verify-and-activate-button");
    expect(verifyButton).toBeDisabled();
  });

  it("should activate 2FA when valid code is entered", async () => {
    const mockVerifyAndEnable = vi.fn().mockResolvedValue(true);
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "setup",
      loading: false,
      submitting: false,
      secret: "TEST_SECRET_KEY",
      backupCodes: [],
      qrCodeData: "otpauth://totp/test",
      twoFactorData: null,
      startSetup: vi.fn(),
      verifyAndEnable: mockVerifyAndEnable,
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const codeInput = screen.getByTestId("verification-code-input");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = screen.getByTestId("verify-and-activate-button");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    expect(mockVerifyAndEnable).toHaveBeenCalledWith("123456");
  });

  it("should show active state after activation", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: { enabled: true, enabled_at: new Date().toISOString() },
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("two-factor-active-state")).toBeInTheDocument();
    expect(screen.getByTestId("two-factor-active-status")).toBeInTheDocument();
  });

  it("should allow regenerating backup codes", async () => {
    const mockRegenerateBackupCodes = vi.fn();
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: { enabled: true, enabled_at: new Date().toISOString() },
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: mockRegenerateBackupCodes,
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const regenerateButton = screen.getByTestId(
      "regenerate-backup-codes-button",
    );
    await act(async () => {
      fireEvent.click(regenerateButton);
    });

    expect(mockRegenerateBackupCodes).toHaveBeenCalled();
  });

  it("should require password to disable 2FA", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: { enabled: true, enabled_at: new Date().toISOString() },
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const disableButton = screen.getByTestId("disable-2fa-button");
    expect(disableButton).toBeDisabled();
  });

  it("should disable 2FA when password is provided", async () => {
    const mockDisable = vi.fn();
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: { enabled: true, enabled_at: new Date().toISOString() },
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: mockDisable,
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const passwordInput = screen.getByTestId("disable-password-input");
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    const disableButton = screen.getByTestId("disable-2fa-button");
    await act(async () => {
      fireEvent.click(disableButton);
    });

    expect(mockDisable).toHaveBeenCalledWith("password123");
  });

  it("should toggle password visibility", async () => {
    vi.mocked(useTwoFactor).mockReturnValue({
      state: "active",
      loading: false,
      submitting: false,
      secret: "",
      backupCodes: [],
      qrCodeData: "",
      twoFactorData: { enabled: true, enabled_at: new Date().toISOString() },
      startSetup: vi.fn(),
      verifyAndEnable: vi.fn(),
      disable: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const passwordInput = screen.getByTestId(
      "disable-password-input",
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = screen.getByTestId(
      "toggle-password-visibility-button",
    );
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput.type).toBe("text");
  });

  it("should navigate back to settings when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const backButton = screen.getByTestId("back-to-settings-button");
    await act(async () => {
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
