import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
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

vi.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
  goToCheckout: vi.fn(),
  goToPortal: vi.fn(),
  getSubscriptionDetails: vi.fn().mockResolvedValue(null),
  getInvoices: vi.fn().mockResolvedValue([]),
  getPaymentMethods: vi.fn().mockResolvedValue([]),
  BillingError: class BillingError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.name = "BillingError";
      this.code = code;
    }
  },
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
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDashboardData } from "@/routes/Dashboard/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import {
  goToPortal,
  getSubscriptionDetails,
  getInvoices,
  getPaymentMethods,
} from "@/lib/billing";

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
    vi.mocked(useRequireAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDashboardData).mockReturnValue(
      createDashboardData({ loading: false }),
    );
    vi.mocked(getSubscriptionDetails).mockResolvedValue(null);
    vi.mocked(getInvoices).mockResolvedValue([]);
    vi.mocked(getPaymentMethods).mockResolvedValue([]);
  });

  it("should redirect to /auth when user is not logged in", () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    // Component should return null when user is null
    expect(container.firstChild).toBeNull();
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /billing/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /manage your subscription, payment methods, and billing history/i,
        ),
      ).toBeInTheDocument();
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

  describe("FREE Plan Tests", () => {
    it("should display free plan badge for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const badge = screen.getByTestId("plan-badge");
        expect(badge).toHaveTextContent("Free");
      });
    });

    it("should NOT show renewal date row for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("renewal-date-row"),
        ).not.toBeInTheDocument();
      });
    });

    it("should NOT show payment method section for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("payment-method-section"),
        ).not.toBeInTheDocument();
      });
    });

    it("should NOT show invoices section for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("invoices-section"),
        ).not.toBeInTheDocument();
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
        expect(screen.getByText(/links usage/i)).toBeInTheDocument();
        expect(screen.getByText(/drops usage/i)).toBeInTheDocument();
      });
    });

    it("should show upgrade button for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const upgradeButton = screen.getByTestId("upgrade-to-pro-button");
        expect(upgradeButton).toBeInTheDocument();
      });
    });

    it("should NOT show manage on stripe button for free users", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("manage-on-stripe-button"),
        ).not.toBeInTheDocument();
      });
    });

    it("should navigate to pricing when upgrade button is clicked", async () => {
      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const upgradeButton = screen.getByTestId("upgrade-to-pro-button");
        fireEvent.click(upgradeButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/pricing");
    });
  });

  describe("PAID Plan Tests", () => {
    const mockSubscription = {
      status: "active",
      renewalDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancelAtPeriodEnd: false,
    };

    const mockPaymentMethod = {
      id: "pm_123",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
      },
    };

    const mockInvoices = [
      {
        id: "inv_123",
        amount: 999,
        currency: "eur",
        status: "paid",
        created: Math.floor(Date.now() / 1000) - 86400,
        invoicePdf: "https://pay.stripe.com/invoice/inv_123.pdf",
        hostedInvoiceUrl: "https://invoice.stripe.com/i/inv_123",
      },
    ];

    beforeEach(() => {
      vi.mocked(getSubscriptionDetails).mockResolvedValue(mockSubscription);
      vi.mocked(getPaymentMethods).mockResolvedValue([mockPaymentMethod]);
      vi.mocked(getInvoices).mockResolvedValue(mockInvoices);
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
        const badge = screen.getByTestId("plan-badge");
        expect(badge).toHaveTextContent("Pro");
      });
    });

    it("should display starter plan badge for starter users", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.STARTER }),
      );

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const badge = screen.getByTestId("plan-badge");
        expect(badge).toHaveTextContent("Starter");
      });
    });

    it("should show renewal date row for paid users", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.PRO }),
      );

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const renewalDateRow = screen.getByTestId("renewal-date-row");
        expect(renewalDateRow).toBeInTheDocument();
        const renewalDate = screen.getByTestId("renewal-date");
        expect(renewalDate).toBeInTheDocument();
        expect(renewalDate).not.toHaveTextContent("N/A");
      });
    });

    it("should show payment method section for paid users", async () => {
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
          screen.getByTestId("payment-method-section"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("payment-method-title")).toBeInTheDocument();
        expect(screen.getByTestId("payment-method-card")).toBeInTheDocument();
        expect(screen.getByTestId("payment-method-last4")).toHaveTextContent(
          "4242",
        );
      });
    });

    it("should show invoices section for paid users", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.PRO }),
      );

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("invoices-section")).toBeInTheDocument();
        expect(screen.getByTestId("invoices-title")).toBeInTheDocument();
        expect(screen.getByTestId("invoices-list")).toBeInTheDocument();
        expect(screen.getByTestId("invoice-inv_123")).toBeInTheDocument();
      });
    });

    it("should show empty invoices state for paid users with no invoices", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.PRO }),
      );
      vi.mocked(getInvoices).mockResolvedValue([]);

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("invoices-section")).toBeInTheDocument();
        expect(screen.getByTestId("invoices-title")).toBeInTheDocument();
        expect(screen.getByTestId("invoices-empty-state")).toBeInTheDocument();
        expect(screen.queryByTestId("invoices-list")).not.toBeInTheDocument();
      });
    });

    it("should NOT show usage progress bars for paid users (unlimited)", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({
          plan: PlanType.PRO,
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
        // Paid plans have unlimited links/drops, so progress bars should NOT be visible
        expect(screen.queryByText(/links usage/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/drops usage/i)).not.toBeInTheDocument();
      });
    });

    it("should show manage on stripe button for paid users", async () => {
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
          screen.getByTestId("manage-on-stripe-button"),
        ).toBeInTheDocument();
      });
    });

    it("should NOT show upgrade button for paid users", async () => {
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
          screen.queryByTestId("upgrade-to-pro-button"),
        ).not.toBeInTheDocument();
      });
    });

    it("should call goToPortal when manage on stripe button is clicked", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.PRO }),
      );
      vi.mocked(goToPortal).mockResolvedValue(undefined);

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const manageButton = screen.getByTestId("manage-on-stripe-button");
        fireEvent.click(manageButton);
      });

      await waitFor(() => {
        expect(goToPortal).toHaveBeenCalled();
      });
    });

    it("should NOT fetch subscription data for free users", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.FREE }),
      );

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByTestId("plan-card")).toBeInTheDocument();
      });

      // getSubscriptionDetails should NOT be called for free users
      expect(getSubscriptionDetails).not.toHaveBeenCalled();
      expect(getInvoices).not.toHaveBeenCalled();
      expect(getPaymentMethods).not.toHaveBeenCalled();
    });

    it("should fetch subscription data for paid users", async () => {
      vi.mocked(useDashboardData).mockReturnValue(
        createDashboardData({ plan: PlanType.PRO }),
      );

      render(
        <MemoryRouter>
          <BillingPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getSubscriptionDetails).toHaveBeenCalled();
        expect(getInvoices).toHaveBeenCalled();
        expect(getPaymentMethods).toHaveBeenCalled();
      });
    });
  });

  it("should navigate back to settings when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByTestId("billing-back-button");
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
