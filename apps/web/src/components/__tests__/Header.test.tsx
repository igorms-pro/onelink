import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { Header } from "../Header";
import { useAuth } from "@/lib/AuthProvider";

// Mock child components
vi.mock("../HeaderMobileDashboard", () => ({
  HeaderMobileDashboard: ({
    onSettingsClick,
  }: {
    onSettingsClick?: () => void;
  }) => (
    <div data-testid="header-mobile-dashboard">
      <button onClick={onSettingsClick} data-testid="settings-button">
        Settings
      </button>
    </div>
  ),
}));

vi.mock("../HeaderMobileSignIn", () => ({
  HeaderMobileSignIn: () => (
    <div data-testid="header-mobile-signin">Sign In Header</div>
  ),
}));

// Mock AuthProvider
const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

vi.mock("@/lib/AuthProvider", () => {
  const mockUseAuth = vi.fn(() => ({
    user: mockUser,
    session: { user: mockUser } as Session,
    loading: false,
    signOut: vi.fn(),
    signInWithEmail: vi.fn(),
  }));
  return {
    useAuth: mockUseAuth,
  };
});

// Mock useLocation to return different pathnames per test
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  const mockUseLocation = vi.fn(() => ({
    pathname: "/",
    search: "",
    hash: "",
    state: null,
    key: "default",
  }));
  return {
    ...actual,
    useLocation: mockUseLocation,
  };
});

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default authenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as Session,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });
  });

  it("renders HeaderMobileDashboard for dashboard route when authenticated", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-mobile-dashboard")).toBeInTheDocument();
    expect(
      screen.queryByTestId("header-mobile-signin"),
    ).not.toBeInTheDocument();
  });

  it("renders HeaderMobileDashboard for settings route when authenticated", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/settings",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-mobile-dashboard")).toBeInTheDocument();
    expect(
      screen.queryByTestId("header-mobile-signin"),
    ).not.toBeInTheDocument();
  });

  it("renders HeaderMobileSignIn for non-dashboard routes", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-mobile-signin")).toBeInTheDocument();
    expect(
      screen.queryByTestId("header-mobile-dashboard"),
    ).not.toBeInTheDocument();
  });

  it("renders HeaderMobileSignIn when not authenticated", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    // Reset mock to return null user
    vi.mocked(useAuth).mockReturnValueOnce({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-mobile-signin")).toBeInTheDocument();
    expect(
      screen.queryByTestId("header-mobile-dashboard"),
    ).not.toBeInTheDocument();
  });

  it("passes onSettingsClick callback to HeaderMobileDashboard", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const onSettingsClick = vi.fn();

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Header onSettingsClick={onSettingsClick} />
      </MemoryRouter>,
    );

    const settingsButton = screen.getByTestId("settings-button");
    settingsButton.click();

    expect(onSettingsClick).toHaveBeenCalled();
  });
});
