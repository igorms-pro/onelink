import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Auth from "../Auth";
import { useAuth } from "@/lib/AuthProvider";
import { logLoginAttempt } from "@/lib/sessionTracking";
import { toast } from "sonner";

const mockSignInWithEmail = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/sessionTracking", () => ({
  logLoginAttempt: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

const mockUseAuth = vi.mocked(useAuth);

describe("Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      checkingMFA: false,
      signInWithEmail: mockSignInWithEmail,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: vi.fn(),
    });
  });

  const renderAuth = () => {
    return render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>,
    );
  };

  // Note: Email form tests require i18n setup - focusing on OAuth tests

  it("handles Google OAuth sign-in successfully", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValue({});

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
    });
  });

  it("handles Google OAuth cancellation error", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValue({
      error: "Sign in was cancelled",
    });

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(logLoginAttempt).toHaveBeenCalledWith({
        email: "oauth_google",
        status: "failed",
      });
    });
  });

  it("handles Google OAuth generic error", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValue({
      error: "OAuth provider is not configured",
    });

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(logLoginAttempt).toHaveBeenCalledWith({
        email: "oauth_google",
        status: "failed",
      });
    });
  });

  it("handles unexpected OAuth errors", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockRejectedValue(new Error("Network error"));

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(logLoginAttempt).toHaveBeenCalledWith({
        email: "oauth_google",
        status: "failed",
      });
    });
  });

  it("shows loading state during OAuth", async () => {
    const user = userEvent.setup();
    // Don't resolve immediately to test loading state
    mockSignInWithOAuth.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
      expect(googleButton).toBeDisabled();
    });
  });

  it("clears localStorage username when submitting email form", async () => {
    const user = userEvent.setup();
    const USERNAME_STORAGE_KEY = "onelink_pending_username";

    // Set a username in localStorage first
    localStorage.setItem(USERNAME_STORAGE_KEY, "testuser");
    mockSignInWithEmail.mockResolvedValue({});

    renderAuth();

    // Use placeholder text to find the email input
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const submitButton = screen.getByRole("button", { name: /send link/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem(USERNAME_STORAGE_KEY)).toBeNull();
      expect(mockSignInWithEmail).toHaveBeenCalled();
    });
  });

  it("clears localStorage username when clicking Google OAuth", async () => {
    const user = userEvent.setup();
    const USERNAME_STORAGE_KEY = "onelink_pending_username";

    // Set a username in localStorage first
    localStorage.setItem(USERNAME_STORAGE_KEY, "testuser");
    mockSignInWithOAuth.mockResolvedValue({});

    renderAuth();
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(localStorage.getItem(USERNAME_STORAGE_KEY)).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
    });
  });

  it("clears localStorage username when clicking Facebook OAuth", async () => {
    const user = userEvent.setup();
    const USERNAME_STORAGE_KEY = "onelink_pending_username";

    // Set a username in localStorage first
    localStorage.setItem(USERNAME_STORAGE_KEY, "testuser");
    mockSignInWithOAuth.mockResolvedValue({});

    renderAuth();
    const facebookButton = screen.getByRole("button", {
      name: /continue with facebook/i,
    });

    await user.click(facebookButton);

    await waitFor(() => {
      expect(localStorage.getItem(USERNAME_STORAGE_KEY)).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith("facebook");
    });
  });
});
