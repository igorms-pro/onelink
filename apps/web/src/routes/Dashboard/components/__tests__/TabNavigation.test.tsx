import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabNavigation } from "../TabNavigation";

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

describe("TabNavigation", () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    render(
      <TabNavigation
        activeTab="content"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    const contentTab = screen.getByText("Content");
    expect(contentTab).toHaveClass("text-purple-700");
    expect(contentTab).toHaveClass("border-b-2");
  });

  it("should call onTabChange when tab is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    const contentTab = screen.getByText("Content");
    await user.click(contentTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("content");
  });

  it("should display submission count badge when count > 0", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        unreadCount={3}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not display submission count badge when count is 0", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  it("should display unreadCount badge only if unreadCount > 0", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        unreadCount={3}
      />,
    );

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-gradient-to-r");
  });

  it("should display correct unreadCount in badge", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={10}
        unreadCount={7}
      />,
    );

    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("should have correct badge style (gradient purple)", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={5}
        unreadCount={3}
      />,
    );

    const badge = screen.getByText("3");
    expect(badge).toHaveClass("from-purple-600");
    expect(badge).toHaveClass("to-purple-700");
  });

  it("should handle tab switching", async () => {
    const user = userEvent.setup();
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    await user.click(screen.getByText("Account"));
    expect(mockOnTabChange).toHaveBeenCalledWith("account");

    await user.click(screen.getByText("Inbox"));
    expect(mockOnTabChange).toHaveBeenCalledWith("inbox");
  });

  it("should apply correct classes for inactive tabs", () => {
    render(
      <TabNavigation
        activeTab="inbox"
        onTabChange={mockOnTabChange}
        submissionCount={0}
        unreadCount={0}
      />,
    );

    const contentTab = screen.getByText("Content");
    expect(contentTab).toHaveClass("text-gray-500");
    expect(contentTab).not.toHaveClass("border-b-2");
  });
});
