import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@supabase/supabase-js";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow, SubmissionRow } from "@/routes/Dashboard/types";
import CustomDomainPage from "../CustomDomainPage";

// Mock dependencies
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase: any = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
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

vi.mock("@/routes/Dashboard/hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  plan: "pro",
  loading: false,
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

describe.skip("CustomDomainPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createAuthValue());
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDashboardData).mockReturnValue(createDashboardData());
    mockSupabase.from.mockReset();
  });

  it("should redirect to /settings when not pro plan", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: "free" }),
    );

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/settings", { replace: true });
    });
  });

  it("should redirect to /auth when user is not logged in", async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthValue({ user: null }));

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
    });
  });

  it("should render page title and description", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("settings_custom_domain")).toBeInTheDocument();
      expect(
        screen.getByText("settings_domain_page_description"),
      ).toBeInTheDocument();
    });
  });

  it("should show loading skeleton initially", () => {
    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    // Should show skeleton
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display domain form", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("settings_domain_add_title")).toBeInTheDocument();
    });
  });

  it("should validate domain input", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("settings_domain_placeholder");
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });

    const addButton = screen.getByText("common_add");

    // Try to submit empty domain
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("settings_domain_required")).toBeInTheDocument();
    });
  });

  it("should add domain successfully", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];
    const newDomain = {
      id: "domain-1",
      domain: "example.com",
      verified: false,
      created_at: new Date().toISOString(),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: newDomain }),
        })),
      })),
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [newDomain] }),
        })),
      })),
    });

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("settings_domain_placeholder");
      fireEvent.change(input, { target: { value: "example.com" } });
    });

    const addButton = screen.getByText("common_add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("settings_domain_added");
    });
  });

  it("should show error when domain already exists", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockRejectedValue({ code: "23505" }),
        })),
      })),
    });

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("settings_domain_placeholder");
      fireEvent.change(input, { target: { value: "example.com" } });
    });

    const addButton = screen.getByText("common_add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "settings_domain_already_exists",
      );
    });
  });

  it("should display domain list", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains = [
      {
        id: "domain-1",
        domain: "example.com",
        verified: true,
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("example.com")).toBeInTheDocument();
    });
  });

  it("should delete domain with confirmation", async () => {
    window.confirm = vi.fn(() => true);

    const mockProfile = { id: "profile-1" };
    const mockDomains = [
      {
        id: "domain-1",
        domain: "example.com",
        verified: true,
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    });

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const deleteButton = screen.getByLabelText("common_delete");
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("settings_domain_deleted");
    });
  });

  it("should toggle DNS help section", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const helpButton = screen.getByLabelText("settings_domain_help_toggle");
      expect(helpButton).toBeInTheDocument();
    });

    const helpButton = screen.getByLabelText("settings_domain_help_toggle");
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText("settings_domain_dns_title")).toBeInTheDocument();
    });
  });

  it("should navigate back to settings when back button is clicked", async () => {
    const mockProfile = { id: "profile-1" };
    const mockDomains: unknown[] = [];

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile }),
        })),
      })),
    } as any);

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: mockDomains }),
        })),
      })),
    } as any);

    render(
      <MemoryRouter>
        <CustomDomainPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByText("settings_back_to_dashboard");
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
