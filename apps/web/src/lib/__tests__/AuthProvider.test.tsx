import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../AuthProvider";
import { supabase } from "../supabase";

vi.mock("../supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOtp: vi.fn(),
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
});
