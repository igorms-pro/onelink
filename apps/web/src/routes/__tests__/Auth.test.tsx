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

  it("renders email sign-in form", () => {
    renderAuth();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send link/i }),
    ).toBeInTheDocument();
  });

  it("renders Google OAuth button", () => {
    renderAuth();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("shows divider between email form and OAuth button", () => {
    renderAuth();
    expect(screen.getByText(/or/i)).toBeInTheDocument();
  });

  it("handles email sign-in successfully", async () => {
    const user = userEvent.setup();
    mockSignInWithEmail.mockResolvedValue({});

    renderAuth();
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send link/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("handles email sign-in error", async () => {
    const user = userEvent.setup();
    mockSignInWithEmail.mockResolvedValue({
      error: "Invalid email address",
    });

    renderAuth();
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send link/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email address");
      expect(logLoginAttempt).toHaveBeenCalledWith({
        email: "invalid-email",
        status: "failed",
      });
    });
  });

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

  it("disables buttons during loading", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    renderAuth();
    const emailInput = screen.getByPlaceholderText(/email/i);
    const emailButton = screen.getByRole("button", { name: /send link/i });
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await user.click(googleButton);

    await waitFor(() => {
      expect(emailButton).toBeDisabled();
      expect(googleButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });
  });
});
