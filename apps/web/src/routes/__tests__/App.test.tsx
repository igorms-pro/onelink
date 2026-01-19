import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import App from "../App";
import { useAuth } from "@/lib/AuthProvider";
import { isLandingDomain, isAppDomain } from "@/lib/domain";
import { getOrCreateProfile } from "@/lib/profile";
import { trackEvent, isPostHogLoaded } from "@/lib/posthog";

// Mock dependencies
vi.mock("@/lib/AuthProvider");
vi.mock("@/lib/domain");
vi.mock("@/lib/profile");
vi.mock("@/lib/posthog");
vi.mock("@/components/OnboardingCarousel", () => ({
  OnboardingCarousel: ({
    onComplete: _onComplete,
  }: {
    onComplete: () => void;
  }) => <div data-testid="onboarding-carousel">Onboarding</div>,
}));

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

describe("App", () => {
  const originalLocation = window.location;
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
    });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "app.getonelink.io",
        hostname: "app.getonelink.io",
        replace: mockReplace,
      },
      writable: true,
    });

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(isAppDomain).mockReturnValue(true);
    vi.mocked(isLandingDomain).mockReturnValue(false);
    vi.mocked(isPostHogLoaded).mockReturnValue(false);
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("renders onboarding carousel when user is not authenticated", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("onboarding-carousel")).toBeInTheDocument();
  });

  it("does not render onboarding when user is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("onboarding-carousel")).not.toBeInTheDocument();
  });

  it("does not render onboarding when checking MFA", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      checkingMFA: true,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("onboarding-carousel")).not.toBeInTheDocument();
  });

  it("skips redirect logic on localhost", () => {
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "localhost:5173",
        hostname: "localhost",
        replace: mockReplace,
      },
      writable: true,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("skips redirect logic when on app domain", () => {
    vi.mocked(isAppDomain).mockReturnValue(true);
    vi.mocked(isLandingDomain).mockReturnValue(false);

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "app.getonelink.io",
        hostname: "app.getonelink.io",
        replace: mockReplace,
      },
      writable: true,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    // Should not redirect when on app domain
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects landing domain root to landing", () => {
    vi.mocked(isAppDomain).mockReturnValue(false);
    vi.mocked(isLandingDomain).mockReturnValue(true);

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "getonelink.io",
        hostname: "getonelink.io",
        replace: mockReplace,
      },
      writable: true,
    });

    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(mockReplace).toHaveBeenCalledWith("https://getonelink.io/");
  });

  it("redirects authenticated user with profile to dashboard", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(getOrCreateProfile).mockResolvedValue({
      id: "profile-1",
      slug: "test",
      user_id: "user-1",
    } as any);

    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("redirects authenticated user without profile to welcome", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(getOrCreateProfile).mockResolvedValue(null);

    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/welcome", { replace: true });
    });
  });

  it("does not redirect if already on /welcome", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseLocation.mockReturnValue({
      pathname: "/welcome",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    // Should not navigate away from /welcome
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not redirect if already on /auth", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseLocation.mockReturnValue({
      pathname: "/auth",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    // Should not navigate away from /auth
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects landing domain landing routes to landing", () => {
    vi.mocked(isAppDomain).mockReturnValue(false);
    vi.mocked(isLandingDomain).mockReturnValue(true);

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "getonelink.io",
        hostname: "getonelink.io",
        replace: mockReplace,
      },
      writable: true,
    });

    mockUseLocation.mockReturnValue({
      pathname: "/auth",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(mockReplace).toHaveBeenCalledWith("https://getonelink.io/auth");
  });

  it("redirects landing domain app routes to app domain", () => {
    vi.mocked(isAppDomain).mockReturnValue(false);
    vi.mocked(isLandingDomain).mockReturnValue(true);

    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        host: "getonelink.io",
        hostname: "getonelink.io",
        replace: mockReplace,
        search: "?tab=inbox",
      },
      writable: true,
    });

    mockUseLocation.mockReturnValue({
      pathname: "/dashboard",
      search: "?tab=inbox",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(mockReplace).toHaveBeenCalledWith(
      "https://app.getonelink.io/dashboard?tab=inbox",
    );
  });

  it("tracks app loaded event when PostHog is loaded", () => {
    vi.mocked(isPostHogLoaded).mockReturnValue(true);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(trackEvent).toHaveBeenCalledWith("app_loaded", {
      has_user: false,
      path: "/",
    });
  });

  it("redirects to welcome on error when checking profile", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      checkingMFA: false,
      session: null,
      signInWithEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(getOrCreateProfile).mockRejectedValue(
      new Error("Profile check failed"),
    );

    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/welcome", { replace: true });
    });
  });
});
