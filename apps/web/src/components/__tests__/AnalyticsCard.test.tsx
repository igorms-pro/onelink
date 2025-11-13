import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticsCard } from "../AnalyticsCard";

// Mock child components
vi.mock("../LinksAnalyticsCard", () => ({
  LinksAnalyticsCard: ({ days }: any) => (
    <div data-testid="links-analytics-card">Links Analytics ({days} days)</div>
  ),
}));

vi.mock("../../routes/Dashboard/components/DropsAnalyticsCard", () => ({
  DropsAnalyticsCard: ({ days }: any) => (
    <div data-testid="drops-analytics-card">Drops Analytics ({days} days)</div>
  ),
}));

describe("AnalyticsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date filter buttons", () => {
    render(<AnalyticsCard profileId="profile-1" />);
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((btn) => btn.textContent);
    expect(buttonTexts.some((text) => /7|seven/i.test(text || ""))).toBe(true);
    expect(buttonTexts.some((text) => /30|thirty/i.test(text || ""))).toBe(
      true,
    );
    expect(buttonTexts.some((text) => /90|ninety/i.test(text || ""))).toBe(
      true,
    );
  });

  it("defaults to 7 days", () => {
    render(<AnalyticsCard profileId="profile-1" />);
    expect(screen.getByTestId("links-analytics-card")).toHaveTextContent(
      "7 days",
    );
    expect(screen.getByTestId("drops-analytics-card")).toHaveTextContent(
      "7 days",
    );
  });

  it("changes to 30 days when clicked", async () => {
    const user = userEvent.setup();
    render(<AnalyticsCard profileId="profile-1" />);
    const buttons = screen.getAllByRole("button");
    const button30 = buttons.find((btn) => btn.textContent?.includes("30"));
    expect(button30).toBeDefined();
    await user.click(button30!);

    expect(screen.getByTestId("links-analytics-card")).toHaveTextContent(
      "30 days",
    );
    expect(screen.getByTestId("drops-analytics-card")).toHaveTextContent(
      "30 days",
    );
  });

  it("changes to 90 days when clicked", async () => {
    const user = userEvent.setup();
    render(<AnalyticsCard profileId="profile-1" />);
    const buttons = screen.getAllByRole("button");
    const button90 = buttons.find((btn) => btn.textContent?.includes("90"));
    expect(button90).toBeDefined();
    await user.click(button90!);

    expect(screen.getByTestId("links-analytics-card")).toHaveTextContent(
      "90 days",
    );
    expect(screen.getByTestId("drops-analytics-card")).toHaveTextContent(
      "90 days",
    );
  });

  it("highlights active date button", async () => {
    const user = userEvent.setup();
    render(<AnalyticsCard profileId="profile-1" />);
    const buttons = screen.getAllByRole("button");
    // Find buttons by their text content (first 3 buttons are the date filters)
    const dateButtons = buttons.slice(0, 3);
    const button7 = dateButtons.find((btn) => btn.textContent?.includes("7"));
    const button30 = dateButtons.find((btn) => btn.textContent?.includes("30"));

    expect(button7).toBeDefined();
    expect(button30).toBeDefined();

    // Initially 7 days should be active
    expect(button7?.className).toContain("bg-gray-900");
    expect(button30?.className).toContain("bg-gray-50");

    await user.click(button30!);

    // After click, 30 days should be active
    expect(button30?.className).toContain("bg-gray-900");
  });
});
