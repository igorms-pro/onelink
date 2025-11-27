import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlanType } from "@/lib/types/plan";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@supabase/supabase-js";
import type { LinkRow } from "@/components/LinksList";
import type { DropRow, SubmissionRow } from "@/routes/Dashboard/types";
import BillingPage from "../BillingPage";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { signOut: vi.fn(), getUser: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
  goToCheckout: vi.fn(),
  goToPortal: vi.fn(),
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
import { goToCheckout, goToPortal } from "@/lib/billing";
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

const createLink = (overrides: Partial<LinkRow> = {}): LinkRow => ({
  id: "link-1",
  label: "Link",
  emoji: null,
  url: "https://example.com",
  order: 0,
  ...overrides,
});

const createDrop = (overrides: Partial<DropRow> = {}): DropRow => ({
  id: "drop-1",
  label: "Drop",
  emoji: null,
  order: 0,
  is_active: true,
  is_public: true,
  share_token: "token-123",
  ...overrides,
});

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
  plan: PlanType.FREE,
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

describe("BillingPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createAuthValue());
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ loading: true }),
    );
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should redirect to /auth when user is not logged in", async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthValue({ user: null }));

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
    });
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("billing_title")).toBeInTheDocument();
      expect(screen.getByText("billing_description")).toBeInTheDocument();
    });
  });

  it("should show loading skeleton when loading", () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ loading: true }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    // Should show skeleton loaders
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display free plan badge for free users", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Free")).toBeInTheDocument();
    });
  });

  it("should display pro plan badge for pro users", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Pro")).toBeInTheDocument();
    });
  });

  it("should show usage progress bar for free plan", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({
        links: [
          createLink({ id: "link-1", order: 0 }),
          createLink({ id: "link-2", order: 1 }),
        ],
        drops: [createDrop({ id: "drop-1" })],
      }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("billing_usage")).toBeInTheDocument();
    });
  });

  it("should show upgrade button for free users", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const upgradeButton = screen.getByText("settings_upgrade_to_pro");
      expect(upgradeButton).toBeInTheDocument();
    });
  });

  it("should call goToCheckout when upgrade button is clicked", async () => {
    vi.mocked(goToCheckout).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const upgradeButton = screen.getByText("settings_upgrade_to_pro");
      fireEvent.click(upgradeButton);
    });

    await waitFor(() => {
      expect(goToCheckout).toHaveBeenCalled();
    });
  });

  it("should show error toast when upgrade fails", async () => {
    vi.mocked(goToCheckout).mockRejectedValue(new Error("Failed"));

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const upgradeButton = screen.getByText("settings_upgrade_to_pro");
      fireEvent.click(upgradeButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("billing_upgrade_error");
    });
  });

  it("should show payment method section for pro users", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("billing_payment_method")).toBeInTheDocument();
    });
  });

  it("should show no payment method message when no card is on file", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("billing_no_payment_method")).toBeInTheDocument();
    });
  });

  it("should call goToPortal when add card button is clicked", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );
    vi.mocked(goToPortal).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      const addCardButton = screen.getByText("billing_add_card");
      fireEvent.click(addCardButton);
    });

    await waitFor(() => {
      expect(goToPortal).toHaveBeenCalled();
    });
  });

  it("should show cancel subscription button for pro users", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("billing_cancel_subscription"),
      ).toBeInTheDocument();
    });
  });

  it("should show coming soon message when cancel subscription is clicked", async () => {
    window.confirm = vi.fn(() => true);

    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const cancelButton = screen.getByText("billing_cancel_subscription");
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("billing_cancel_coming_soon");
    });
  });

  it("should show billing history section for pro users", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("settings_billing_history")).toBeInTheDocument();
    });
  });

  it("should show no invoices message when no invoices exist", async () => {
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ plan: PlanType.PRO }),
    );

    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("billing_no_invoices")).toBeInTheDocument();
    });
  });

  it("should navigate back to settings when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByText("settings_back_to_settings");
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
