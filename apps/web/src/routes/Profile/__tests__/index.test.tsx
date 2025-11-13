import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../index";

// Mock hooks
const mockProfileData = {
  links: [],
  drops: [],
  profile: null,
  plan: "free" as const,
  isLoading: false,
  errorType: null as const,
};

vi.mock("../hooks/useProfileData", () => ({
  useProfileData: () => mockProfileData,
}));

// Mock components
vi.mock("../components", () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ErrorState: ({ errorType }: { errorType: string | null }) => (
    <div data-testid="error-state">Error: {errorType}</div>
  ),
  ProfileHeader: ({ profile, links }: any) => (
    <div data-testid="profile-header">
      {profile?.display_name || "No Profile"}
      {links.length} links
    </div>
  ),
  LinksSection: ({ links }: any) => (
    <div data-testid="links-section">{links.length} links</div>
  ),
  DropsSection: ({ drops }: any) => (
    <div data-testid="drops-section">{drops.length} drops</div>
  ),
  ProfileBottomBar: () => (
    <div data-testid="profile-bottom-bar">Bottom Bar</div>
  ),
}));

vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

// Mock domain
vi.mock("@/lib/domain", () => ({
  isBaseHost: () => true,
}));

// i18n is already configured in vitest.setup.ts, no need to mock

// Mock window.location
Object.defineProperty(window, "location", {
  writable: true,
  value: {
    host: "onemeet.app",
    origin: "https://onemeet.app",
  },
});

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockProfileData
    Object.assign(mockProfileData, {
      links: [],
      drops: [],
      profile: null,
      plan: "free" as const,
      isLoading: false,
      errorType: null as const,
    });
  });

  it("renders loading state when isLoading is true", () => {
    mockProfileData.isLoading = true;

    render(
      <MemoryRouter initialEntries={["/test-slug"]}>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("renders error state when profile is not found", () => {
    mockProfileData.isLoading = false;
    mockProfileData.profile = null;
    mockProfileData.errorType = "not_found";

    render(
      <MemoryRouter initialEntries={["/test-slug"]}>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Error: not_found")).toBeInTheDocument();
  });

  it("renders profile when data is loaded", () => {
    mockProfileData.isLoading = false;
    mockProfileData.profile = {
      slug: "test-user",
      display_name: "Test User",
      bio: "Test bio",
      avatar_url: null,
    };
    mockProfileData.links = [
      {
        link_id: "link-1",
        label: "Link 1",
        emoji: null,
        url: "https://example.com",
        order: 1,
      },
    ];
    mockProfileData.drops = [
      {
        drop_id: "drop-1",
        label: "Drop 1",
        emoji: null,
        order: 1,
        max_file_size_mb: 10,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/test-user"]}>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    // ProfileHeader displays display_name or slug, so we check for either
    expect(screen.getByText(/Test User|test-user/i)).toBeInTheDocument();
    expect(screen.getByTestId("links-section")).toBeInTheDocument();
    expect(screen.getByTestId("drops-section")).toBeInTheDocument();
  });

  it("updates document title and meta tags when profile loads", async () => {
    mockProfileData.isLoading = false;
    mockProfileData.profile = {
      slug: "test-user",
      display_name: "Test User",
      bio: "Test bio",
      avatar_url: "https://example.com/avatar.jpg",
    };

    render(
      <MemoryRouter initialEntries={["/test-user"]}>
        <Profile />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Test User | OneLink");
    });

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeInTheDocument();
  });

  it("renders footer for free plan", () => {
    mockProfileData.isLoading = false;
    mockProfileData.profile = {
      slug: "test-user",
      display_name: "Test User",
      bio: null,
      avatar_url: null,
    };
    mockProfileData.plan = "free";

    render(
      <MemoryRouter initialEntries={["/test-user"]}>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("does not render footer for pro plan", () => {
    mockProfileData.isLoading = false;
    mockProfileData.profile = {
      slug: "test-user",
      display_name: "Test User",
      bio: null,
      avatar_url: null,
    };
    mockProfileData.plan = "pro";

    render(
      <MemoryRouter initialEntries={["/test-user"]}>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
  });
});
