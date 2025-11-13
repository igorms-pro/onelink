import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../index";

// Mock dependencies
vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/Header", () => ({
  Header: ({ onSettingsClick }: any) => (
    <div data-testid="header">
      <button onClick={onSettingsClick}>Settings</button>
    </div>
  ),
}));

vi.mock("@/routes/Dashboard/hooks/useDashboardData", () => ({
  useDashboardData: vi.fn(),
}));

vi.mock("./components", () => ({
  DashboardSubHeader: ({ isFree, onSignOut }: any) => (
    <div data-testid="dashboard-sub-header">
      SubHeader - Free: {String(isFree)}
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  ),
  TabNavigation: ({
    activeTab: _activeTab,
    onTabChange,
    submissionCount,
  }: any) => (
    <div data-testid="tab-navigation">
      <button onClick={() => onTabChange("inbox")}>Inbox</button>
      <button onClick={() => onTabChange("content")}>Content</button>
      <button onClick={() => onTabChange("account")}>Account</button>
      <span>Count: {submissionCount}</span>
    </div>
  ),
  BottomNavigation: ({ activeTab: _activeTab, onTabChange }: any) => (
    <div data-testid="bottom-navigation">
      <button onClick={() => onTabChange("inbox")}>Inbox</button>
      <button onClick={() => onTabChange("content")}>Content</button>
      <button onClick={() => onTabChange("account")}>Account</button>
    </div>
  ),
  InboxTab: ({ submissions }: any) => (
    <div data-testid="inbox-tab">Inbox - {submissions.length} submissions</div>
  ),
  ContentTab: ({ profileId, links, drops, isFree, freeLimit }: any) => (
    <div data-testid="content-tab">
      Content - Profile: {profileId}, Links: {links.length}, Drops:{" "}
      {drops.length}, Free: {String(isFree)}, Limit: {freeLimit}
    </div>
  ),
  AccountTab: ({
    profileId,
    profileFormInitial: _profileFormInitial,
    isFree,
  }: any) => (
    <div data-testid="account-tab">
      Account - Profile: {profileId}, Free: {String(isFree)}
    </div>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe("Dashboard", () => {
  const mockUseAuth = vi.fn();
  const mockUseDashboardData = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth } = await import("@/lib/AuthProvider");
    (useAuth as ReturnType<typeof vi.fn>).mockImplementation(mockUseAuth);
    const { useDashboardData } = await import(
      "@/routes/Dashboard/hooks/useDashboardData"
    );
    (useDashboardData as ReturnType<typeof vi.fn>).mockImplementation(
      mockUseDashboardData,
    );
    const { useNavigate } = await import("react-router-dom");
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  it("should redirect to /auth when user is not logged in", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: null,
      profileFormInitial: null,
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
      loading: false,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
    });
  });

  it("should render dashboard when user is logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    // DashboardSubHeader renders the actual component, check for Dashboard title
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // TabNavigation renders actual component, check for Inbox button (multiple exist, use getAllByText)
    const inboxElements = screen.getAllByText("Inbox");
    expect(inboxElements.length).toBeGreaterThan(0);
  });

  it("should render InboxTab when activeTab is inbox", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [{ submission_id: "sub-1" }],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // InboxTab renders a section, check for submissions content
    expect(screen.getByText("Drop")).toBeInTheDocument();
  });

  it("should render ContentTab when activeTab is content", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [
        {
          id: "link-1",
          label: "Link 1",
          emoji: null,
          url: "https://example.com",
          order: 1,
        },
      ],
      setLinks: vi.fn(),
      drops: [
        {
          id: "drop-1",
          label: "Drop 1",
          emoji: null,
          order: 1,
          is_active: true,
        },
      ],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // Use getAllByText and click the first one (TabNavigation)
    const contentButtons = screen.getAllByText("Content");
    await user.click(contentButtons[0]);

    await waitFor(() => {
      // ContentTab renders actual component, check for Routes section
      expect(screen.getByText("Routes")).toBeInTheDocument();
    });

    expect(screen.getByText("Routes")).toBeInTheDocument();
  });

  it("should render AccountTab when activeTab is account", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "pro",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // Use getAllByText and click the first one (TabNavigation)
    const accountButtons = screen.getAllByText("Account");
    await user.click(accountButtons[0]);

    await waitFor(() => {
      // AccountTab renders actual component, check for Profile section
      expect(screen.getByText("Your Profile Link")).toBeInTheDocument();
    });

    expect(screen.getByText("Your Profile Link")).toBeInTheDocument();
  });

  it("should pass correct props to DashboardSubHeader", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // DashboardSubHeader renders the actual component, check for Free badge
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should call signOut when sign out button is clicked", async () => {
    const mockSignOut = vi.fn();
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: mockSignOut,
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // Text is "Sign out" (lowercase) from translation
    const signOutButton = screen.getByText("Sign out");
    await user.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("should navigate to settings when settings button is clicked", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      signOut: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      profileId: "profile-1",
      profileFormInitial: { slug: "test" },
      links: [],
      setLinks: vi.fn(),
      drops: [],
      setDrops: vi.fn(),
      submissions: [],
      plan: "free",
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    const settingsButton = screen.getByText("Settings");
    await user.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("should return null when user is not logged in (before redirect)", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});
