import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNavigation } from "../BottomNavigation";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        dashboard_tab_inbox: "Inbox",
        dashboard_tab_content: "Content",
        dashboard_tab_account: "Account",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock useScrollState
vi.mock("@/hooks/useScrollState", () => ({
  useScrollState: () => ({
    isScrolling: false,
    isScrollable: false,
  }),
}));

describe("BottomNavigation", () => {
  const mockOnTabChange = vi.fn();
  const mockOnClearAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all navigation buttons", () => {
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
      />,
    );

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("should call onTabChange when tab is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
      />,
    );

    const contentTab = screen.getByText("Content");
    await user.click(contentTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("content");
  });

  it("should highlight active tab", () => {
    render(
      <BottomNavigation
        activeTab="content"
        onTabChange={mockOnTabChange}
        submissionCount={0}
      />,
    );

    const contentIcon = screen
      .getByText("Content")
      .closest("button")
      ?.querySelector("svg");
    expect(contentIcon).toHaveClass("text-purple-600");
  });

  it("should show clear all button when on inbox tab with submissions", () => {
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        onClearAll={mockOnClearAll}
      />,
    );

    const clearButton = screen.getByLabelText("Clear all");
    expect(clearButton).toBeInTheDocument();
  });

  it("should not show clear all button when not on inbox tab", () => {
    render(
      <BottomNavigation
        activeTab="content"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        onClearAll={mockOnClearAll}
      />,
    );

    const clearButton = screen.queryByLabelText("Clear all");
    expect(clearButton).not.toBeInTheDocument();
  });

  it("should not show clear all button when submission count is 0", () => {
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        onClearAll={mockOnClearAll}
      />,
    );

    const clearButton = screen.queryByLabelText("Clear all");
    expect(clearButton).not.toBeInTheDocument();
  });

  it("should call onClearAll when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        onClearAll={mockOnClearAll}
      />,
    );

    const clearButton = screen.getByLabelText("Clear all");
    await user.click(clearButton);

    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it("should show notification dot when submissions exist and not on inbox tab", () => {
    render(
      <BottomNavigation
        activeTab="content"
        onTabChange={mockOnTabChange}
        submissionCount={3}
      />,
    );

    const inboxButton = screen.getByText("Inbox").closest("button");
    const dot = inboxButton?.querySelector(".bg-purple-600");
    expect(dot).toBeInTheDocument();
  });

  it("should not show notification dot when on inbox tab", () => {
    render(
      <BottomNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={3}
      />,
    );

    const inboxButton = screen.getByText("Inbox").closest("button");
    const dot = inboxButton?.querySelector(".bg-purple-600");
    expect(dot).not.toBeInTheDocument();
  });
});
