import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardSubHeader } from "../DashboardSubHeader";

// Mock billing functions
vi.mock("@/lib/billing", () => ({
  goToCheckout: vi.fn(),
  goToPortal: vi.fn(),
}));

describe("DashboardSubHeader", () => {
  const mockOnSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dashboard title", () => {
    render(<DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should display Free badge when isFree is true", () => {
    render(<DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />);

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display Pro badge when isFree is false", () => {
    render(<DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />);

    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("should show upgrade button when isFree is true", () => {
    render(<DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />);

    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("should show manage billing button when isFree is false", () => {
    render(<DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />);

    expect(screen.getByText("Manage billing")).toBeInTheDocument();
  });

  it("should call goToCheckout when upgrade button is clicked", async () => {
    const { goToCheckout } = await import("@/lib/billing");
    const user = userEvent.setup();

    render(<DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />);

    const upgradeButton = screen.getByText("Upgrade to Pro");
    await user.click(upgradeButton);

    expect(goToCheckout).toHaveBeenCalledTimes(1);
  });

  it("should call goToPortal when manage billing button is clicked", async () => {
    const { goToPortal } = await import("@/lib/billing");
    const user = userEvent.setup();

    render(<DashboardSubHeader isFree={false} onSignOut={mockOnSignOut} />);

    const manageButton = screen.getByText("Manage billing");
    await user.click(manageButton);

    expect(goToPortal).toHaveBeenCalledTimes(1);
  });

  it("should call onSignOut when sign out button is clicked", async () => {
    const user = userEvent.setup();

    render(<DashboardSubHeader isFree={true} onSignOut={mockOnSignOut} />);

    const signOutButton = screen.getByText("Sign out");
    await user.click(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });
});
