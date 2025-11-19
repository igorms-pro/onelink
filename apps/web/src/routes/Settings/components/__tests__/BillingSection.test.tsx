import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { PlanType } from "@/lib/types/plan";
import { BillingSection } from "../BillingSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("BillingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with title", () => {
    renderWithRouter(<BillingSection plan={PlanType.FREE} />);
    expect(screen.getByTestId("settings-billing-section")).toBeInTheDocument();
    expect(screen.getByText("settings_billing")).toBeInTheDocument();
  });

  it("displays Free badge for free plan", () => {
    renderWithRouter(<BillingSection plan={PlanType.FREE} />);
    const badge = screen.getByTestId("settings-current-plan-badge");
    expect(badge).toHaveTextContent("Free");
  });

  it("displays Pro badge for pro plan", () => {
    renderWithRouter(<BillingSection plan={PlanType.PRO} />);
    const badge = screen.getByTestId("settings-current-plan-badge");
    expect(badge).toHaveTextContent("Pro");
  });

  it("shows upgrade button for free plan", () => {
    renderWithRouter(<BillingSection plan={PlanType.FREE} />);
    expect(screen.getByTestId("settings-upgrade-to-pro")).toBeInTheDocument();
    expect(screen.getByText("settings_upgrade_to_pro")).toBeInTheDocument();
  });

  it("shows manage payment and billing history for pro plan", () => {
    renderWithRouter(<BillingSection plan={PlanType.PRO} />);
    expect(screen.getByTestId("settings-manage-payment")).toBeInTheDocument();
    expect(screen.getByTestId("settings-billing-history")).toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-upgrade-to-pro"),
    ).not.toBeInTheDocument();
  });

  it("navigates to billing page when upgrade button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<BillingSection plan={PlanType.FREE} />);
    const upgradeButton = screen.getByTestId("settings-upgrade-to-pro");
    await user.click(upgradeButton);
    expect(mockNavigate).toHaveBeenCalledWith("/settings/billing");
  });

  it("navigates to billing page when manage payment is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<BillingSection plan={PlanType.PRO} />);
    const managePaymentButton = screen.getByTestId("settings-manage-payment");
    await user.click(managePaymentButton);
    expect(mockNavigate).toHaveBeenCalledWith("/settings/billing");
  });

  it("navigates to billing page when billing history is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<BillingSection plan={PlanType.PRO} />);
    const billingHistoryButton = screen.getByTestId("settings-billing-history");
    await user.click(billingHistoryButton);
    expect(mockNavigate).toHaveBeenCalledWith("/settings/billing");
  });

  it("handles null plan", () => {
    renderWithRouter(<BillingSection plan={null} />);
    expect(screen.getByTestId("settings-billing-section")).toBeInTheDocument();
    const badge = screen.getByTestId("settings-current-plan-badge");
    expect(badge).toHaveTextContent("Free");
  });
});
