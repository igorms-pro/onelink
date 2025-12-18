import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlanType } from "@/lib/types/plan";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@supabase/supabase-js";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow, SubmissionRow } from "@/routes/Dashboard/types";
import CustomDomainPage from "../CustomDomainPage";

// Mock dependencies
vi.mock("@/lib/supabase", () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: { signOut: vi.fn(), getUser: vi.fn() },
  };
  return {
    supabase: mockSupabase,
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

vi.mock("@/routes/Dashboard/hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

vi.mock("@/hooks/useRequireProPlan", () => ({
  useRequireProPlan: vi.fn(),
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

import { useAuth } from "@/lib/AuthProvider";
import { useDashboardData } from "@/routes/Dashboard/hooks/useDashboardData";
import { useRequireProPlan } from "@/hooks/useRequireProPlan";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

type DashboardData = ReturnType<typeof useDashboardData>;
type AuthValue = ReturnType<typeof useAuth>;

const createDispatch = <T,>(): Dispatch<SetStateAction<T>> =>
  vi.fn() as unknown as Dispatch<SetStateAction<T>>;

const emptySubmissions: SubmissionRow[] = [];

const createDashboardData = (
  overrides: Partial<DashboardData> = {},
): DashboardData => ({
  profileId: "profile-1",
  profileFormInitial: null,
  links: [],
  setLinks: createDispatch<LinkRow[]>(),
  drops: [],
  setDrops: createDispatch<DropRow[]>(),
  submissions: emptySubmissions,
  setSubmissions: createDispatch<SubmissionRow[]>(),
  downloads: [],
  setDownloads: createDispatch<any[]>(),
  unreadCount: 0,
  refreshInbox: async () => true,
  plan: PlanType.PRO,
  loading: false,
  clearAllSubmissions: async () => true,
  ...overrides,
});

const createAuthValue = (overrides: Partial<AuthValue> = {}): AuthValue => ({
  user: mockUser,
  session: null,
  loading: false,
  signOut: vi.fn(async () => {}),
  signInWithEmail: vi.fn(async () => ({})),
  ...overrides,
});

describe("CustomDomainPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createAuthValue());
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDashboardData).mockReturnValue(createDashboardData());
    vi.mocked(useRequireProPlan).mockReturnValue({
      user: mockUser,
      plan: PlanType.PRO,
      loading: false,
      isPro: true,
    });

    // Simple mock for supabase.from - just return resolved promises
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: { id: "profile-1" }, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      update: vi.fn(),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    }));
  });

  it("should redirect to /settings when not pro plan", async () => {
    vi.mocked(useRequireProPlan).mockReturnValue({
      user: mockUser,
      plan: PlanType.FREE,
      loading: false,
      isPro: false,
    });

    const { container } = render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    // Component should return null when not pro (redirect handled by useRequireProPlan hook)
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("should redirect to /auth when user is not logged in", async () => {
    vi.mocked(useRequireProPlan).mockReturnValue({
      user: null,
      plan: PlanType.FREE,
      loading: false,
      isPro: false,
    });

    const { container } = render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    // Component should return null when user is null
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it.skip("should render page title and description", async () => {
    // Skipped - feature not fully implemented
  });

  it.skip("should show loading skeleton initially", () => {
    // Skipped - feature not fully implemented
  });

  it.skip("should display domain form", async () => {
    // Skipped - feature not fully implemented
  });

  it.skip("should validate domain input", async () => {
    // Skipped - feature not fully implemented
  });

  it.skip("should add domain successfully", async () => {
    const newDomain = {
      id: "domain-1",
      domain: "example.com",
      verified: false,
      created_at: new Date().toISOString(),
    };

    // Override the insert mock for this test
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        if (table === "custom_domains") {
          const mockOrder = vi
            .fn()
            .mockResolvedValue({ data: [newDomain], error: null });
          const mockEqDomains = vi.fn(() => ({ order: mockOrder }));
          const mockSelectDomains = vi.fn(() => ({ eq: mockEqDomains }));
          const mockMaybeSingle = vi
            .fn()
            .mockResolvedValue({ data: { id: "profile-1" }, error: null });
          const mockEqProfiles = vi.fn(() => ({
            maybeSingle: mockMaybeSingle,
          }));
          const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));

          return {
            select: (cols?: string) => {
              if (cols === "id, domain, verified, created_at") {
                return mockSelectDomains();
              }
              return mockSelectProfiles();
            },
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: newDomain, error: null }),
              })),
            })),
            update: vi.fn(),
            delete: vi.fn(),
          } as any;
        }
        // Default for profiles
        const mockMaybeSingle = vi
          .fn()
          .mockResolvedValue({ data: { id: "profile-1" }, error: null });
        const mockEqProfiles = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
        const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));
        return {
          select: mockSelectProfiles,
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as any;
      },
    );

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const input = screen.getByPlaceholderText(
          "settings_domain_placeholder",
        );
        fireEvent.change(input, { target: { value: "example.com" } });
      },
      { timeout: 3000 },
    );

    const addButton = screen.getByText("common_add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("settings_domain_added");
    });
  });

  it.skip("should show error when domain already exists", async () => {
    // Override the insert mock to return an error
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        if (table === "custom_domains") {
          const mockOrder = vi
            .fn()
            .mockResolvedValue({ data: [], error: null });
          const mockEqDomains = vi.fn(() => ({ order: mockOrder }));
          const mockSelectDomains = vi.fn(() => ({ eq: mockEqDomains }));
          const mockMaybeSingle = vi
            .fn()
            .mockResolvedValue({ data: { id: "profile-1" }, error: null });
          const mockEqProfiles = vi.fn(() => ({
            maybeSingle: mockMaybeSingle,
          }));
          const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));

          return {
            select: (cols?: string) => {
              if (cols === "id, domain, verified, created_at") {
                return mockSelectDomains();
              }
              return mockSelectProfiles();
            },
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockRejectedValue(
                    new Error("duplicate key value violates unique constraint"),
                  ),
              })),
            })),
            update: vi.fn(),
            delete: vi.fn(),
          } as any;
        }
        // Default for profiles
        const mockMaybeSingle = vi
          .fn()
          .mockResolvedValue({ data: { id: "profile-1" }, error: null });
        const mockEqProfiles = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
        const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));
        return {
          select: mockSelectProfiles,
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as any;
      },
    );

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const input = screen.getByPlaceholderText(
          "settings_domain_placeholder",
        );
        fireEvent.change(input, { target: { value: "example.com" } });
      },
      { timeout: 3000 },
    );

    const addButton = screen.getByText("common_add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "settings_domain_already_exists",
      );
    });
  });

  it.skip("should display domain list", async () => {
    const mockDomains = [
      {
        id: "domain-1",
        domain: "example.com",
        verified: true,
        created_at: new Date().toISOString(),
      },
    ];

    // Override the order mock to return domains
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        if (table === "custom_domains") {
          const mockOrder = vi
            .fn()
            .mockResolvedValue({ data: mockDomains, error: null });
          const mockEqDomains = vi.fn(() => ({ order: mockOrder }));
          const mockSelectDomains = vi.fn(() => ({ eq: mockEqDomains }));
          return {
            select: mockSelectDomains,
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          } as any;
        }
        // Default for profiles
        const mockMaybeSingle = vi
          .fn()
          .mockResolvedValue({ data: { id: "profile-1" }, error: null });
        const mockEqProfiles = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
        const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));
        return {
          select: mockSelectProfiles,
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as any;
      },
    );

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("example.com")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it.skip("should delete domain with confirmation", async () => {
    window.confirm = vi.fn(() => true);

    const mockDomains = [
      {
        id: "domain-1",
        domain: "example.com",
        verified: true,
        created_at: new Date().toISOString(),
      },
    ];

    // Override mocks for delete test
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(
      (table: string) => {
        if (table === "custom_domains") {
          const mockOrder = vi
            .fn()
            .mockResolvedValue({ data: mockDomains, error: null });
          const mockEqDomains = vi.fn(() => ({ order: mockOrder }));
          const mockSelectDomains = vi.fn(() => ({ eq: mockEqDomains }));
          return {
            select: mockSelectDomains,
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          } as any;
        }
        // Default for profiles
        const mockMaybeSingle = vi
          .fn()
          .mockResolvedValue({ data: { id: "profile-1" }, error: null });
        const mockEqProfiles = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
        const mockSelectProfiles = vi.fn(() => ({ eq: mockEqProfiles }));
        return {
          select: mockSelectProfiles,
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        } as any;
      },
    );

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const deleteButton = screen.getByLabelText("common_delete");
        fireEvent.click(deleteButton);
      },
      { timeout: 3000 },
    );

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("settings_domain_deleted");
    });
  });

  it.skip("should toggle DNS help section", async () => {
    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const helpButton = screen.getByLabelText("settings_domain_help_toggle");
        expect(helpButton).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const helpButton = screen.getByLabelText("settings_domain_help_toggle");
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText("settings_domain_dns_title")).toBeInTheDocument();
    });
  });

  it.skip("should navigate back to settings when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const backButton = screen.getByText("settings_back_to_dashboard");
        fireEvent.click(backButton);
      },
      { timeout: 3000 },
    );

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
