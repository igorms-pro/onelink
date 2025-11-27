import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { DashboardSubHeader } from "../DashboardSubHeader";
import { PlanId } from "@/lib/types/plan";

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock billing functions
vi.mock("@/lib/billing", () => ({
  goToCheckout: vi.fn(),
  goToPortal: vi.fn(),
}));

// Mock useMediaQuery for desktop
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: vi.fn(() => false), // Desktop by default
}));

describe("DashboardSubHeader", () => {
  const mockOnSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it("should render dashboard title", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.FREE} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should display Free badge when plan is free", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.FREE} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display Starter badge when plan is starter", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.STARTER} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Starter")).toBeInTheDocument();
  });

  it("should display Pro badge when plan is pro", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.PRO} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("should show upgrade button when plan is free", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.FREE} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("should show manage billing button when plan is paid", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.STARTER} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Manage billing")).toBeInTheDocument();
  });

  it("should navigate to pricing page when upgrade button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.FREE} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    const upgradeButton = screen.getByText("Upgrade to Pro");
    await user.click(upgradeButton);

    // Should navigate to pricing page
    expect(mockNavigate).toHaveBeenCalledWith("/pricing");
  });

  it("should call goToPortal when manage billing button is clicked", async () => {
    const { goToPortal } = await import("@/lib/billing");
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.PRO} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    const manageButton = screen.getByText("Manage billing");
    await user.click(manageButton);

    expect(goToPortal).toHaveBeenCalledTimes(1);
  });

  it("should call onSignOut when sign out button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardSubHeader plan={PlanId.FREE} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    const signOutButton = screen.getByText("Sign out");
    await user.click(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });
});
