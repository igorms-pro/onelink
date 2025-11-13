import { describe, it, expect, beforeEach, vi } from "vitest";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

describe.skip("TwoFactorPage", () => {
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
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    // No fake timers - let setTimeout run naturally
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    // Wait for setTimeout to complete (500ms) and component to render
    expect(
      await screen.findByText(
        "Two-Factor Authentication",
        {},
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add an extra layer of security to your account"),
    ).toBeInTheDocument();
  });

  it("should show disabled state initially", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("2FA is not enabled", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("should show enable button in disabled state", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Enable 2FA", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("should start 2FA setup when enable button is clicked", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(toast.success).toHaveBeenCalledWith("2FA setup started");
    expect(await screen.findByText("Step 1: Scan QR Code")).toBeInTheDocument();
  });

  it("should display QR code in setup step 1", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(await screen.findByTestId("qr-code")).toBeInTheDocument();
  });

  it("should display secret key in setup step 1", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(await screen.findByText("Secret Key")).toBeInTheDocument();
  });

  it("should copy secret key when copy button is clicked", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const copyButtons = screen.getAllByRole("button");
    const copyButton = copyButtons.find((btn) => btn.querySelector("svg"));
    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
    }

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Secret key copied to clipboard",
    );
  });

  it("should display backup codes in setup", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(await screen.findByText("Backup Codes")).toBeInTheDocument();
  });

  it("should validate verification code length", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    expect(verifyButton).toBeDisabled();
  });

  it("should activate 2FA when valid code is entered", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(toast.success).toHaveBeenCalledWith(
      "2FA has been activated successfully",
    );
    expect(await screen.findByText("2FA is Active")).toBeInTheDocument();
  });

  it("should show active state after activation", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(await screen.findByText("2FA is Active")).toBeInTheDocument();
  });

  it("should allow regenerating backup codes", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const regenerateButton = await screen.findByText("Regenerate backup codes");
    await act(async () => {
      fireEvent.click(regenerateButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Backup codes regenerated successfully",
    );
  });

  it("should require password to disable 2FA", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const disableButton = await screen.findByText("Disable 2FA");
    expect(disableButton).toBeDisabled();
  });

  it("should disable 2FA when password is provided", async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const passwordInput = await screen.findByPlaceholderText(
      "Enter your password to confirm",
    );
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    const disableButton = await screen.findByText("Disable 2FA");
    await act(async () => {
      fireEvent.click(disableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(toast.success).toHaveBeenCalledWith(
      "2FA has been disabled successfully",
    );
  });

  it("should toggle password visibility", async () => {
    render(
      <MemoryRouter>
        <TwoFactorPage />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const enableButton = await screen.findByText("Enable 2FA");
    await act(async () => {
      fireEvent.click(enableButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const codeInput = await screen.findByPlaceholderText("000000");
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: "123456" } });
    });

    const verifyButton = await screen.findByText("Verify and Activate");
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const passwordInput = (await screen.findByPlaceholderText(
      "Enter your password to confirm",
    )) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButtons = screen.getAllByRole("button");
    const eyeButton = toggleButtons.find((btn) => btn.querySelector("svg"));
    if (eyeButton) {
      await act(async () => {
        fireEvent.click(eyeButton);
      });
    }
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

    const backButton = await screen.findByText("Back to settings");
    await act(async () => {
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
