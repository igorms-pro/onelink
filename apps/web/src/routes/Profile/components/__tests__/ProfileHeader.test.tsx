import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileHeader } from "../ProfileHeader";
import type { PublicProfile, PublicLink } from "../../types";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Mock navigator.userAgent
Object.defineProperty(navigator, "userAgent", {
  writable: true,
  value: "Mozilla/5.0",
});

describe("ProfileHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile: PublicProfile = {
    slug: "test-user",
    display_name: "Test User",
    bio: "Test bio",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const mockLinks: PublicLink[] = [
    {
      link_id: "link-1",
      label: "Instagram",
      emoji: null,
      url: "https://instagram.com/test",
      order: 1,
    },
    {
      link_id: "link-2",
      label: "Twitter",
      emoji: null,
      url: "https://twitter.com/test",
      order: 2,
    },
    {
      link_id: "link-3",
      label: "Regular Link",
      emoji: null,
      url: "https://example.com",
      order: 3,
    },
  ];

  it("renders profile with display name and bio", () => {
    render(<ProfileHeader profile={mockProfile} links={[]} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Test bio")).toBeInTheDocument();
  });

  it("renders avatar image when provided", () => {
    render(<ProfileHeader profile={mockProfile} links={[]} />);

    const avatar = screen.getByAltText("Test User");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders initials when avatar is not provided", () => {
    const profileWithoutAvatar: PublicProfile = {
      ...mockProfile,
      avatar_url: null,
    };

    render(<ProfileHeader profile={profileWithoutAvatar} links={[]} />);

    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("renders slug as fallback when display_name is not provided", () => {
    const profileWithoutName: PublicProfile = {
      slug: "test-user",
      display_name: null,
      bio: null,
      avatar_url: null,
    };

    render(<ProfileHeader profile={profileWithoutName} links={[]} />);

    expect(screen.getByText("test-user")).toBeInTheDocument();
  });

  it("renders 'Profile' as fallback when neither display_name nor slug is provided", () => {
    const emptyProfile: PublicProfile = {
      slug: undefined,
      display_name: null,
      bio: null,
      avatar_url: null,
    };

    render(<ProfileHeader profile={emptyProfile} links={[]} />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("does not render bio when not provided", () => {
    const profileWithoutBio: PublicProfile = {
      ...mockProfile,
      bio: null,
    };

    render(<ProfileHeader profile={profileWithoutBio} links={[]} />);

    expect(screen.queryByText("Test bio")).not.toBeInTheDocument();
  });

  it("renders social links when provided", () => {
    render(<ProfileHeader profile={mockProfile} links={mockLinks} />);

    // Should render Instagram and Twitter social buttons
    expect(screen.getByLabelText("Visit Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Visit Twitter")).toBeInTheDocument();
  });

  it("does not render non-social links in header", () => {
    render(<ProfileHeader profile={mockProfile} links={mockLinks} />);

    // Regular link should not appear in social section
    expect(screen.queryByText("Regular Link")).not.toBeInTheDocument();
  });

  it("handles social link click and tracks analytics", async () => {
    const { supabase } = await import("@/lib/supabase");
    const insertMock = vi.fn();
    vi.mocked(supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    render(<ProfileHeader profile={mockProfile} links={mockLinks} />);

    const instagramButton = screen.getByLabelText("Visit Instagram");
    fireEvent.click(instagramButton);

    expect(insertMock).toHaveBeenCalledWith([
      {
        link_id: "link-1",
        user_agent: "Mozilla/5.0",
      },
    ]);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://instagram.com/test",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("handles TikTok link with custom icon", () => {
    const tiktokLink: PublicLink = {
      link_id: "link-tiktok",
      label: "TikTok",
      emoji: null,
      url: "https://tiktok.com/@test",
      order: 1,
    };

    render(<ProfileHeader profile={mockProfile} links={[tiktokLink]} />);

    const tiktokButton = screen.getByLabelText("Visit TikTok");
    expect(tiktokButton).toBeInTheDocument();
    // Should render custom SVG for TikTok
    expect(tiktokButton.querySelector("svg")).toBeInTheDocument();
  });

  it("generates correct initials from multi-word name", () => {
    const profileWithLongName: PublicProfile = {
      ...mockProfile,
      display_name: "John Michael Smith",
      avatar_url: null,
    };

    render(<ProfileHeader profile={profileWithLongName} links={[]} />);

    expect(screen.getByText("JM")).toBeInTheDocument();
  });

  it("generates initials from single word name", () => {
    const profileWithSingleName: PublicProfile = {
      ...mockProfile,
      display_name: "John",
      avatar_url: null,
    };

    render(<ProfileHeader profile={profileWithSingleName} links={[]} />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
