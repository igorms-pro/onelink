import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlanType } from "@/lib/types/plan";
import type { PlanTypeValue } from "@/lib/types/plan";
import Settings from "../index";

// Mock dependencies - use the same structure as vitest.setup.ts but with getUser
vi.mock("@/lib/supabase", () => {
  const mockEq = vi.fn(() => ({
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn(() => ({
      data: [],
      error: null,
    })),
    data: [],
    error: null,
  }));
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
    order: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
      })),
      data: [],
      error: null,
    })),
    data: [],
    error: null,
  }));
  return {
    supabase: {
      auth: {
        signOut: vi.fn(),
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-1",
                email: "test@example.com",
              },
            },
          },
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: mockSelect,
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "profile-1",
                user_id: "user-1",
                slug: "user-12345678",
                display_name: null,
                bio: null,
                avatar_url: null,
              },
              error: null,
            }),
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: PlanType.FREE, error: null }),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn((callback) => {
          setTimeout(() => callback("SUBSCRIBED"), 0);
          return { unsubscribe: vi.fn() };
        }),
      })),
      removeChannel: vi.fn(),
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: "https://example.com/file.pdf" },
          })),
        })),
      },
    },
  };
});

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

const mockUseDashboardData = vi.fn();
vi.mock("../Dashboard/hooks/useDashboardData", () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

vi.mock("../components", () => ({
  NotificationsSection: () => (
    <section data-testid="settings-notifications-section">
      Notifications
    </section>
  ),
  EmailPreferencesSection: () => (
    <section data-testid="settings-email-preferences-section">
      Email Preferences
    </section>
  ),
  BillingSection: ({ plan }: { plan: PlanTypeValue | null }) => (
    <section data-testid="settings-billing-section">Billing {plan}</section>
  ),
  CustomDomainSection: () => (
    <section data-testid="settings-custom-domain-section">
      Custom Domain
    </section>
  ),
  ActiveSessionsSection: () => (
    <section data-testid="settings-active-sessions-section">
      Active Sessions
    </section>
  ),
  DataExportSection: () => (
    <section data-testid="settings-data-export-section">Data Export</section>
  ),
  ApiIntegrationsSection: () => (
    <section data-testid="settings-api-integrations-section">
      API Integrations
    </section>
  ),
  PrivacySecuritySection: () => (
    <section data-testid="settings-privacy-security-section">
      Privacy & Security
    </section>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

import type { User, Session } from "@supabase/supabase-js";
import { useAuth } from "@/lib/AuthProvider";
import { useNavigate } from "react-router-dom";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

describe("Settings", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as Session,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: null,
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: PlanType.FREE,
      loading: false,
    });
  });

  it("should redirect to /auth when user is not logged in", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
    });
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const titles = screen.getAllByText("Settings");
      expect(titles.length).toBeGreaterThan(0);
      expect(screen.getByText(/manage your account/i)).toBeInTheDocument();
    });
  });

  it("should render all core sections for free plan", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("settings-notifications-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-email-preferences-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-billing-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-active-sessions-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-data-export-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-api-integrations-section"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("settings-privacy-security-section"),
      ).toBeInTheDocument();
    });
  });

  it("should not render custom domain section for free plan", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("settings-custom-domain-section"),
      ).not.toBeInTheDocument();
    });
  });

  it.skip("should render custom domain section for pro plan", async () => {
    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: null,
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: PlanType.PRO,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("settings-custom-domain-section"),
      ).toBeInTheDocument();
    });
  });

  it.skip("should pass plan prop to BillingSection", async () => {
    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: null,
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: PlanType.PRO,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Billing pro")).toBeInTheDocument();
    });
  });

  it("should navigate back to dashboard when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByText(/back to dashboard/i);
      expect(backButton).toBeInTheDocument();
    });

    const backButton = screen.getByText(/back to dashboard/i);
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("should not render when user is null (redirecting)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});
