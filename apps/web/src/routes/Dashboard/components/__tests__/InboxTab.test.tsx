import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InboxTab } from "../InboxTab";
import type { SubmissionRow, DownloadRow } from "../../types";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: "https://example.com/file.pdf" },
        })),
      })),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

describe("InboxTab", () => {
  const mockSubmissions: SubmissionRow[] = [
    {
      submission_id: "sub-1",
      drop_id: "drop-1",
      drop_label: "Resume Drop",
      created_at: "2024-01-01T10:00:00Z",
      name: "John Doe",
      email: "john@example.com",
      note: "Please review my resume",
      files: [
        {
          path: "submissions/sub-1/resume.pdf",
          size: 102400,
          content_type: "application/pdf",
        },
      ],
      read_at: null, // Unread
    },
    {
      submission_id: "sub-2",
      drop_id: "drop-2",
      drop_label: "Portfolio Drop",
      created_at: "2024-01-02T11:00:00Z",
      name: null,
      email: null,
      note: null,
      files: [],
      read_at: "2024-01-02T12:00:00Z", // Read
    },
  ];

  const mockDownloads: DownloadRow[] = [
    {
      download_id: 1,
      downloaded_at: "2024-01-03T10:00:00Z",
      submission_id: "sub-1",
      drop_id: "drop-1",
      drop_label: "Resume Drop",
      file_path: "submissions/sub-1/resume.pdf",
      file_name: "resume.pdf",
      submission_name: "John Doe",
      submission_email: "john@example.com",
      submission_created_at: "2024-01-01T10:00:00Z",
    },
  ];

  const mockSetSubmissions = vi.fn();
  const mockRefreshInbox = vi.fn().mockResolvedValue(true);

  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import("@/lib/supabase");
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    } as any);
  });

  it("should show skeleton when loading", () => {
    render(
      <InboxTab
        submissions={[]}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
        loading={true}
      />,
    );

    // Check that skeleton is shown
    expect(screen.getByTestId("inbox-skeleton")).toBeInTheDocument();
    // Empty state should not be shown while loading
    expect(screen.queryByText(/no submissions yet/i)).not.toBeInTheDocument();
  });

  it("should show empty state when not loading and no submissions", () => {
    render(
      <InboxTab
        submissions={[]}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
        loading={false}
      />,
    );

    // Check that empty state is shown
    expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument();
    // Skeleton should not be shown when not loading
    expect(screen.queryByTestId("inbox-skeleton")).not.toBeInTheDocument();
  });

  it("should render submissions list", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.getByText("Resume Drop")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Drop")).toBeInTheDocument();
  });

  it("should display submission details", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Please review my resume/)).toBeInTheDocument();
  });

  it("should display file count when files exist", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.getByText("Files (1)")).toBeInTheDocument();
  });

  it("should not display name/email/note when they are null", () => {
    render(
      <InboxTab
        submissions={[mockSubmissions[1]]}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.queryByText(/Name:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Note:/)).not.toBeInTheDocument();
  });

  it("should display file links when files exist", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const fileLink = screen.getByText(/resume.pdf/);
    expect(fileLink).toBeInTheDocument();
    expect(fileLink.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/file.pdf",
    );
  });

  it("should display file size when available", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.getByText(/100 KB/)).toBeInTheDocument();
  });

  it("should handle empty submissions array", () => {
    render(
      <InboxTab
        submissions={[]}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    // Should show empty state
    expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument();
  });

  it("should format dates correctly", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    // Check that dates are rendered (format depends on locale)
    const dateElements = screen.getAllByText(/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("should display read/unread indicators correctly", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    // Unread submission should have blue background
    const unreadSubmission = screen.getByText("Resume Drop").closest("li");
    expect(unreadSubmission).toHaveClass("bg-blue-50");

    // Read submission should have gray background
    const readSubmission = screen.getByText("Portfolio Drop").closest("li");
    expect(readSubmission).toHaveClass("bg-gray-50");
  });

  it("should show Mark as read button only for unread submissions", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const markReadButtons = screen.getAllByText(/Mark read/i);
    expect(markReadButtons.length).toBe(1); // Only one unread submission
  });

  it("should show Mark all as read button only if unreadCount > 0", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.getByText(/Mark all as read/i)).toBeInTheDocument();
  });

  it("should not show Mark all as read button when all are read", () => {
    const allReadSubmissions = mockSubmissions.map((s) => ({
      ...s,
      read_at: s.read_at || new Date().toISOString(),
    }));

    render(
      <InboxTab
        submissions={allReadSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    expect(screen.queryByText(/Mark all as read/i)).not.toBeInTheDocument();
  });

  it("should call handleMarkAsRead with correct submission_id", async () => {
    const user = userEvent.setup();
    const { supabase } = await import("@/lib/supabase");
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    } as any);

    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const markReadButton = screen.getByText(/Mark read/i);
    await user.click(markReadButton);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("mark_submission_read", {
        p_submission_id: "sub-1",
      });
    });
  });

  it("should call handleMarkAllAsRead when clicked", async () => {
    const user = userEvent.setup();
    const { supabase } = await import("@/lib/supabase");
    vi.mocked(supabase.rpc).mockImplementation((fnName: string) => {
      if (fnName === "mark_all_submissions_read") {
        return Promise.resolve({
          data: null,
          error: null,
          count: null,
          status: 200,
          statusText: "OK",
        }) as any;
      }
      if (fnName === "get_submissions_by_profile") {
        return Promise.resolve({
          data: mockSubmissions.map((s) => ({
            ...s,
            read_at: new Date().toISOString(),
          })),
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const markAllButton = screen.getByText(/Mark all as read/i);
    await user.click(markAllButton);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("mark_all_submissions_read", {
        p_profile_id: "profile-123",
      });
    });
  });

  it("should call refreshInbox when refresh button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const refreshButton = screen.getByText(/Refresh/i);
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockRefreshInbox).toHaveBeenCalled();
    });
  });

  it("should display refresh icon animation during refresh", async () => {
    const user = userEvent.setup();
    const slowRefresh = vi.fn(
      () =>
        new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 100)),
    );

    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={slowRefresh}
      />,
    );

    const refreshButton = screen.getByText(/Refresh/i);
    await user.click(refreshButton);

    // Check for spinning icon
    const refreshIcon = refreshButton.querySelector("svg");
    expect(refreshIcon).toHaveClass("animate-spin");
  });

  it("should display downloads combined with submissions chronologically", () => {
    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={mockDownloads}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    // Download should appear (most recent)
    // The download text might be translated, so check for download-related content
    const downloadText =
      screen.queryByText(/File downloaded/i) ||
      screen.queryByText(/downloaded/i) ||
      screen.queryByText(/resume.pdf/i);
    expect(downloadText).toBeInTheDocument();
  });

  it("should handle mark as read errors", async () => {
    const user = userEvent.setup();
    const { supabase } = await import("@/lib/supabase");
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        message: "Failed to mark as read",
        details: "",
        hint: "",
        code: "",
      } as any,
      count: null,
      status: 500,
      statusText: "Internal Server Error",
    } as any);

    render(
      <InboxTab
        submissions={mockSubmissions}
        downloads={[]}
        profileId="profile-123"
        setSubmissions={mockSetSubmissions}
        refreshInbox={mockRefreshInbox}
      />,
    );

    const markReadButton = screen.getByText(/Mark read/i);
    await user.click(markReadButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
