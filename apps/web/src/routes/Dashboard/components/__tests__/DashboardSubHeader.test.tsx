import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { DashboardSubHeader } from "../DashboardSubHeader";

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
  });

  it("should render dashboard title", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should display Free badge when isFree is true", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display Pro badge when isFree is false", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("should show upgrade button when isFree is true", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("should show manage billing button when isFree is false", () => {
    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Manage billing")).toBeInTheDocument();
  });

  it("should open upgrade modal when upgrade button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    const upgradeButton = screen.getByText("Upgrade to Pro");
    await user.click(upgradeButton);

    // Modal should be visible
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  it("should call goToPortal when manage billing button is clicked", async () => {
    const { goToPortal } = await import("@/lib/billing");
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />
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
        <DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />
      </MemoryRouter>,
    );

    const signOutButton = screen.getByText("Sign out");
    await user.click(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });
});
