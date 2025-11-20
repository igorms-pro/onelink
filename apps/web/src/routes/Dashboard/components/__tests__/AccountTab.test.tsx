import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountTab } from "../AccountTab";
import type { ProfileForm } from "@/components/ProfileEditor";

// Mock dependencies
vi.mock("@/components/ProfileEditor", () => ({
  ProfileEditor: ({ initial, disabled, onSave, ref: _ref }: any) => (
    <div data-testid="profile-editor">
      Profile Editor - Disabled: {String(disabled)}
      <button onClick={() => onSave(initial)}>Save</button>
    </div>
  ),
}));

vi.mock("@/components/AnalyticsCard", () => ({
  AnalyticsCard: ({ profileId }: any) => (
    <div data-testid="analytics-card">Analytics - Profile: {profileId}</div>
  ),
}));

// Mock react-router-dom for ProfileLinkCard
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("./ProfileLinkCard", () => ({
  ProfileLinkCard: ({ slug, isFree }: any) => (
    <div data-testid="profile-link-card">
      Profile Link - Slug: {slug}, Free: {String(isFree)}
    </div>
  ),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AccountTab", () => {
  const mockProfileFormInitial: ProfileForm = {
    slug: "test-slug",
    display_name: "Test User",
    bio: "Test bio",
    avatar_url: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render ProfileLinkCard", () => {
    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    // ProfileLinkCard renders actual component, check for "Your Profile Link" text
    expect(screen.getByText("Your Profile Link")).toBeInTheDocument();
  });

  it("should render ProfileEditor", () => {
    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    expect(screen.getByTestId("profile-editor")).toBeInTheDocument();
    expect(screen.getByTestId("profile-editor")).toHaveTextContent(
      "Disabled: false",
    );
  });

  it("should disable ProfileEditor when profileId is null", () => {
    render(
      <AccountTab
        profileId={null}
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    expect(screen.getByTestId("profile-editor")).toHaveTextContent(
      "Disabled: true",
    );
  });

  it("should render AnalyticsCard", () => {
    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    expect(screen.getByTestId("analytics-card")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-card")).toHaveTextContent(
      "Profile: profile-1",
    );
  });

  it("should expand/collapse analytics section", async () => {
    const user = userEvent.setup();
    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    const analyticsCard = screen.getByTestId("analytics-card");
    expect(analyticsCard).toBeInTheDocument();

    const collapseButton = screen.getByLabelText("Collapse");
    await user.click(collapseButton);

    expect(screen.queryByTestId("analytics-card")).not.toBeInTheDocument();

    const expandButton = screen.getByLabelText("Expand");
    await user.click(expandButton);

    expect(screen.getByTestId("analytics-card")).toBeInTheDocument();
  });

  it("should handle profile save success", async () => {
    const { supabase } = await import("@/lib/supabase");
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    const mockSingle = vi.fn().mockResolvedValue({
      data: { updated_at: "2024-01-01T00:00:00Z" },
      error: null,
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
      })),
    });

    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Profile updated successfully",
      );
    });
  });

  it("should handle profile save error", async () => {
    const { supabase } = await import("@/lib/supabase");
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Error", code: "500" },
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
      })),
    });

    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update profile");
    });
  });

  it("should handle slug taken error", async () => {
    const { supabase } = await import("@/lib/supabase");
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "slug unique", code: "23505" },
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
      })),
    });

    render(
      <AccountTab
        profileId="profile-1"
        profileFormInitial={mockProfileFormInitial}
        isFree={true}
      />,
    );

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "This slug is already taken. Please choose another.",
      );
    });
  });
});
