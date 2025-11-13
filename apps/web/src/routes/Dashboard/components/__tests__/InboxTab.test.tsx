import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { InboxTab } from "../InboxTab";
import type { SubmissionRow } from "../../types";

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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render fake notifications", () => {
    render(<InboxTab submissions={[]} />);

    // Check that fake notifications are rendered
    // The exact content depends on FAKE_NOTIFICATIONS constant
    const notifications = screen.getAllByRole("listitem");
    expect(notifications.length).toBeGreaterThan(0);
  });

  it("should render submissions list", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    expect(screen.getByText("Resume Drop")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Drop")).toBeInTheDocument();
  });

  it("should display submission details", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Please review my resume/)).toBeInTheDocument();
  });

  it("should display file count when files exist", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    expect(screen.getByText(/Files \(1\)/)).toBeInTheDocument();
  });

  it("should not display name/email/note when they are null", () => {
    render(<InboxTab submissions={[mockSubmissions[1]]} />);

    expect(screen.queryByText(/Name:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Note:/)).not.toBeInTheDocument();
  });

  it("should display file links when files exist", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    const fileLink = screen.getByText(/resume.pdf/);
    expect(fileLink).toBeInTheDocument();
    expect(fileLink.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/file.pdf",
    );
  });

  it("should display file size when available", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    expect(screen.getByText(/100 KB/)).toBeInTheDocument();
  });

  it("should handle empty submissions array", () => {
    render(<InboxTab submissions={[]} />);

    // Should still render fake notifications
    const notifications = screen.getAllByRole("listitem");
    expect(notifications.length).toBeGreaterThan(0);
  });

  it("should format dates correctly", () => {
    render(<InboxTab submissions={mockSubmissions} />);

    // Check that dates are rendered (format depends on locale)
    const dateElements = screen.getAllByText(/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
