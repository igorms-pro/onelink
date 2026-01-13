import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { AuthProvider } from "../AuthProvider";
import { supabase } from "../supabase";

vi.mock("../supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(),
        listFactors: vi.fn(),
      },
    },
  },
}));

vi.mock("../sessionTracking", () => ({
  createUserSession: vi.fn(() => Promise.resolve()),
  logLoginAttempt: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/components/MFAChallenge", () => ({
  MFAChallenge: ({ onVerified }: { onVerified?: () => void }) => (
    <div data-testid="mfa-challenge-component">
      <button onClick={onVerified}>Verify</button>
    </div>
  ),
}));

describe("AuthProvider", () => {
  let unsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    unsubscribe = vi.fn();

    // Mock onAuthStateChange to return subscription
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as any);

    // Mock getSession to return no session initially
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children without MFA challenge when no session", async () => {
    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(
      screen.queryByTestId("mfa-challenge-container"),
    ).not.toBeInTheDocument();
  });

  it("shows MFA challenge when session is aal1 and user has MFA factors", async () => {
    // Mock session with user
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "token",
    };

    // Mock getSession to return session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    // Mock AAL check - needs MFA (aal1 -> aal2)
    vi.mocked(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel,
    ).mockResolvedValue({
      data: {
        currentLevel: "aal1",
        nextLevel: "aal2",
      },
      error: null,
    } as any);

    // Mock listFactors - user has TOTP factors
    vi.mocked(supabase.auth.mfa.listFactors).mockResolvedValue({
      data: { totp: [{ id: "factor-1", factor_type: "totp" }] },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    // Simulate SIGNED_IN event
    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0][0];
    await callback("SIGNED_IN", mockSession as any);

    await waitFor(() => {
      expect(screen.getByTestId("mfa-challenge-container")).toBeInTheDocument();
    });
  });

  it("does not show MFA challenge when session is already aal2", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "token",
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    // Mock AAL check - already aal2, no MFA needed
    vi.mocked(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel,
    ).mockResolvedValue({
      data: {
        currentLevel: "aal2",
        nextLevel: "aal2",
      },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0][0];
    await callback("SIGNED_IN", mockSession as any);

    await waitFor(() => {
      expect(
        screen.queryByTestId("mfa-challenge-container"),
      ).not.toBeInTheDocument();
    });
  });

  it("does not show MFA challenge when user has no MFA factors", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "token",
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    // Mock AAL check - needs MFA
    vi.mocked(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel,
    ).mockResolvedValue({
      data: {
        currentLevel: "aal1",
        nextLevel: "aal2",
      },
      error: null,
    } as any);

    // Mock listFactors - no TOTP factors
    vi.mocked(supabase.auth.mfa.listFactors).mockResolvedValue({
      data: { totp: [] },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0][0];
    await callback("SIGNED_IN", mockSession as any);

    await waitFor(() => {
      expect(
        screen.queryByTestId("mfa-challenge-container"),
      ).not.toBeInTheDocument();
    });
  });

  it("handles MFA check errors gracefully", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "token",
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    // Mock AAL check error
    vi.mocked(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel,
    ).mockResolvedValue({
      data: null,
      error: { message: "Error checking AAL" },
    } as any);

    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0][0];
    await callback("SIGNED_IN", mockSession as any);

    // Should not crash, just not show MFA challenge
    await waitFor(() => {
      expect(
        screen.queryByTestId("mfa-challenge-container"),
      ).not.toBeInTheDocument();
    });
  });

  it("hides MFA challenge when onVerified is called", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "token",
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    vi.mocked(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel,
    ).mockResolvedValue({
      data: {
        currentLevel: "aal1",
        nextLevel: "aal2",
      },
      error: null,
    } as any);

    vi.mocked(supabase.auth.mfa.listFactors).mockResolvedValue({
      data: { totp: [{ id: "factor-1", factor_type: "totp" }] },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );

    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
      .calls[0][0];
    await callback("SIGNED_IN", mockSession as any);

    await waitFor(() => {
      expect(screen.getByTestId("mfa-challenge-container")).toBeInTheDocument();
    });

    // Click verify button (which calls onVerified)
    const verifyButton = screen.getByText("Verify");
    verifyButton.click();

    await waitFor(() => {
      expect(
        screen.queryByTestId("mfa-challenge-container"),
      ).not.toBeInTheDocument();
    });
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>,
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  describe("signInWithOAuth", () => {
    it("successfully initiates OAuth flow", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: "https://google.com/oauth", provider: "google" },
        error: null,
      } as any);

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        React.useEffect(() => {
          signInWithOAuth("google");
        }, [signInWithOAuth]);
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
          options: {
            redirectTo: expect.stringContaining("/dashboard"),
          },
        });
      });
    });

    it("handles OAuth configuration errors", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: null,
        error: { message: "OAuth provider is not configured" },
      } as any);

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          signInWithOAuth("google").then((res) => {
            if (res.error) setError(res.error);
          });
        }, [signInWithOAuth]);

        return <div>{error && <span data-testid="error">{error}</span>}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "OAuth provider is not configured. Please contact support.",
        );
      });
    });

    it("handles network errors", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: null,
        error: { message: "Network error: fetch failed" },
      } as any);

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          signInWithOAuth("google").then((res) => {
            if (res.error) setError(res.error);
          });
        }, [signInWithOAuth]);

        return <div>{error && <span data-testid="error">{error}</span>}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Network error. Please check your connection and try again.",
        );
      });
    });

    it("handles user cancellation", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: null,
        error: { message: "User cancelled the sign in" },
      } as any);

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          signInWithOAuth("google").then((res) => {
            if (res.error) setError(res.error);
          });
        }, [signInWithOAuth]);

        return <div>{error && <span data-testid="error">{error}</span>}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Sign in was cancelled.",
        );
      });
    });

    it("handles email conflict errors", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: null,
        error: { message: "Email already exists" },
      } as any);

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          signInWithOAuth("google").then((res) => {
            if (res.error) {
              setError(res.error);
            }
          });
        }, [signInWithOAuth]);

        return <div>{error && <span data-testid="error">{error}</span>}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(
        () => {
          const errorElement = screen.getByTestId("error");
          expect(errorElement).toHaveTextContent(
            "An account with this email already exists. Please sign in with email instead.",
          );
        },
        { timeout: 3000 },
      );
    });

    it("handles unexpected errors", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const { useAuth } = await import("../AuthProvider");
      const TestComponent = () => {
        const { signInWithOAuth } = useAuth();
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          signInWithOAuth("google").then((res) => {
            if (res.error) setError(res.error);
          });
        }, [signInWithOAuth]);

        return <div>{error && <span data-testid="error">{error}</span>}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Unexpected error",
        );
      });
    });

    it("handles OAuth errors in URL after callback", async () => {
      // Mock window.location to include error params
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...originalLocation,
          href: "http://localhost:3000/dashboard?error=access_denied&error_description=User%20cancelled",
          pathname: "/dashboard",
          search: "?error=access_denied&error_description=User%20cancelled",
        },
      });

      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        access_token: "token",
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const { toast } = await import("sonner");
      const toastErrorSpy = vi.spyOn(toast, "error");

      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>,
      );

      // Simulate SIGNED_IN event with error in URL
      const callback = vi.mocked(supabase.auth.onAuthStateChange).mock
        .calls[0][0];
      await callback("SIGNED_IN", mockSession as any);

      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith(
          "Sign in with Google was cancelled.",
        );
      });

      // Restore window.location
      Object.defineProperty(window, "location", {
        writable: true,
        value: originalLocation,
      });
    });
  });
});
