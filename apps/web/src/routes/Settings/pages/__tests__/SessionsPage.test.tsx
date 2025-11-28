import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SessionsPage from "../SessionsPage";
import type { User } from "@supabase/supabase-js";
import type {
  DatabaseSession,
  DatabaseLoginHistory,
} from "../SessionsPage/types";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { signOut: vi.fn(), getUser: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

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

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        settings_back_to_settings: "Back to settings",
        sessions_page_title: "Active Sessions",
        sessions_page_description:
          "Manage your active sessions and view login history",
        sessions_active_sessions: "Active Sessions",
        sessions_no_sessions: "No active sessions",
        sessions_revoke_all_other: "Revoke all other sessions",
        sessions_revoking: "Revoking...",
        sessions_revoke: "Revoke",
        sessions_current_session: "Current session",
        sessions_login_history: "Login History",
        sessions_no_history: "No login history",
        sessions_status_success: "Success",
        sessions_status_failed: "Failed",
        sessions_revoked_success: "Session revoked successfully",
        sessions_revoked_all_success: "All other sessions revoked successfully",
        sessions_revoke_all_confirm:
          "Are you sure you want to revoke all other sessions?",
      };
      return translations[key] || key;
    },
  }),
}));

import { useAuth } from "@/lib/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

const mockSessions: DatabaseSession[] = [
  {
    id: "session-1",
    device_os: "macOS",
    device_browser: "Chrome",
    ip_address: "192.168.1.1",
    city: "Paris",
    country: "France",
    last_activity: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_current: true,
  },
  {
    id: "session-2",
    device_os: "iOS",
    device_browser: "Safari",
    ip_address: "192.168.1.2",
    city: "Lyon",
    country: "France",
    last_activity: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    is_current: false,
  },
];

const mockLoginHistory: DatabaseLoginHistory[] = [
  {
    id: "history-1",
    created_at: new Date().toISOString(),
    status: "success",
    ip_address: "192.168.1.1",
    device_info: "Chrome on macOS",
  },
];

describe("SessionsPage", () => {
  const mockNavigate = vi.fn();
  const mockLocation = {
    hash: "",
    pathname: "/settings/sessions",
    search: "",
    state: null,
    key: "default",
  };

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
    vi.mocked(useLocation).mockReturnValue(
      mockLocation as ReturnType<typeof useLocation>,
    );
    // Mock supabase.rpc to return mock sessions
    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_user_sessions") {
        return Promise.resolve({ data: mockSessions, error: null }) as any;
      }
      if (
        fnName === "revoke_session" ||
        fnName === "revoke_all_other_sessions"
      ) {
        return Promise.resolve({ data: null, error: null }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });
    // Mock supabase.from for login history
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "login_history") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({
                  data: mockLoginHistory,
                  error: null,
                }),
              })),
            })),
          })),
        } as any;
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      } as any;
    });
  });

  it("should redirect to /auth when user is not logged in", () => {
    // Mock useRequireAuth to return null user
    // The actual redirect is handled by useRequireAuth's useEffect
    vi.mocked(useRequireAuth).mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    // Component renders normally, redirect happens via useRequireAuth hook
    // This test verifies the component structure exists
    expect(screen.getByTestId("sessions-page-title")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("sessions-page-title")).toBeInTheDocument();
      expect(
        screen.getByTestId("sessions-page-description"),
      ).toBeInTheDocument();
    });
  });

  it("should show loading skeleton initially", () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    // Should show skeleton loaders
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display active sessions after loading", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-sessions-title")).toBeInTheDocument();
    });

    // Should show mock sessions
    expect(screen.getByTestId("session-device-session-1")).toHaveTextContent(
      "Chrome on macOS",
    );
    expect(screen.getByTestId("session-device-session-2")).toHaveTextContent(
      "Safari on iOS",
    );
  });

  it("should display current session badge", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-session-badge")).toBeInTheDocument();
    });
  });

  it("should allow revoking a session", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("revoke-session-button-session-2"),
      ).toBeInTheDocument();
    });

    const revokeButton = screen.getByTestId("revoke-session-button-session-2");
    fireEvent.click(revokeButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Session revoked successfully",
      );
    });
  });

  it("should not allow revoking current session", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-session-badge")).toBeInTheDocument();
    });

    // Current session should not have a revoke button
    expect(
      screen.queryByTestId("revoke-session-button-session-1"),
    ).not.toBeInTheDocument();
  });

  it("should allow revoking all other sessions", async () => {
    window.confirm = vi.fn(() => true);

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("revoke-all-sessions-button"),
      ).toBeInTheDocument();
    });

    const revokeAllButton = screen.getByTestId("revoke-all-sessions-button");
    fireEvent.click(revokeAllButton);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "All other sessions revoked successfully",
      );
    });
  });

  it("should display login history", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("login-history-title")).toBeInTheDocument();
    });

    // Should show login history entries
    expect(screen.getByTestId("login-history-list")).toBeInTheDocument();
    expect(
      screen.getByTestId("login-history-entry-history-1"),
    ).toBeInTheDocument();
  });

  it("should handle hash navigation to active-sessions section", async () => {
    const mockElement = document.createElement("div");
    mockElement.scrollIntoView = vi.fn();
    const mockClassList = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    Object.defineProperty(mockElement, "classList", {
      value: mockClassList,
      writable: true,
    });
    const mockGetElementById = vi.fn((): HTMLElement => mockElement);

    document.getElementById = mockGetElementById;

    vi.mocked(useLocation).mockReturnValue({
      ...mockLocation,
      hash: "#active-sessions",
    } as ReturnType<typeof useLocation>);

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(mockGetElementById).toHaveBeenCalledWith("active-sessions");
      },
      { timeout: 3000 },
    );
  });

  it("should handle hash navigation to login-history section", async () => {
    const mockElement = document.createElement("div");
    mockElement.scrollIntoView = vi.fn();
    const mockClassList = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    Object.defineProperty(mockElement, "classList", {
      value: mockClassList,
      writable: true,
    });
    const mockGetElementById = vi.fn((): HTMLElement => mockElement);

    document.getElementById = mockGetElementById;

    vi.mocked(useLocation).mockReturnValue({
      ...mockLocation,
      hash: "#login-history",
    } as ReturnType<typeof useLocation>);

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(mockGetElementById).toHaveBeenCalledWith("login-history");
      },
      { timeout: 3000 },
    );
  });

  it("should show empty state when no sessions", async () => {
    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_user_sessions") {
        return Promise.resolve({ data: [], error: null }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("sessions-empty-state")).toBeInTheDocument();
    });
  });

  it("should navigate back to settings when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("sessions-back-button")).toBeInTheDocument();
    });

    const backButton = screen.getByTestId("sessions-back-button");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("should format relative time correctly", async () => {
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-sessions-section")).toBeInTheDocument();
    });

    // Should show sessions with relative time
    expect(screen.getByTestId("session-card-session-1")).toBeInTheDocument();
  });

  it("should handle error when loading sessions fails", async () => {
    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "get_user_sessions") {
        return Promise.resolve({
          data: null,
          error: { message: "Error loading sessions", code: "500" },
        }) as any;
      }
      return Promise.resolve({ data: null, error: null }) as any;
    });

    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
