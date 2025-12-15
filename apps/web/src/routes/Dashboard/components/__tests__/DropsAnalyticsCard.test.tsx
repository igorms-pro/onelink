import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropsAnalyticsCard } from "../DropsAnalyticsCard";
import { supabase } from "@/lib/supabase";
import type { UploadStatsRow } from "../../types";

// Mock useSortableData hook
vi.mock("../../../../hooks/useSortableData", () => ({
  useSortableData: ({ data, defaultSortField, defaultSortDirection }: any) => {
    const sortedData = [...data].sort((a: any, b: any) => {
      const aVal = a[defaultSortField] ?? a.label ?? "";
      const bVal = b[defaultSortField] ?? b.label ?? "";
      if (defaultSortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return {
      sortedData,
      sortField: defaultSortField,
      sortDirection: defaultSortDirection,
      handleSort: vi.fn((field: string) => {
        // Simple toggle for testing
        return {
          sortedData: sortedData.reverse(),
          sortField: field,
          sortDirection: defaultSortDirection === "asc" ? "desc" : "asc",
        };
      }),
    };
  },
}));

// Mock supabase RPC
vi.mock("@/lib/supabase", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return {
    ...actual,
    supabase: {
      ...actual.supabase,
      rpc: vi.fn(),
    },
  };
});

describe("DropsAnalyticsCard", () => {
  const mockRpc = vi.mocked(supabase.rpc);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when profileId is null", () => {
    const { container } = render(
      <DropsAnalyticsCard profileId={null} days={7} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders loading skeleton initially", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          drop_id: "1",
          drop_label: "Speaker Request",
          owner_uploads: 2,
          visitor_uploads: 10,
          total_uploads: 12,
        },
        {
          drop_id: "2",
          drop_label: "Resume Submissions",
          owner_uploads: 0,
          visitor_uploads: 8,
          total_uploads: 8,
        },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    // Should show loading skeleton
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders analytics data after API call succeeds", async () => {
    const mockData: UploadStatsRow[] = [
      {
        drop_id: "1",
        drop_label: "Speaker Request",
        owner_uploads: 2,
        visitor_uploads: 10,
        total_uploads: 12,
      },
      {
        drop_id: "2",
        drop_label: "Resume Submissions",
        owner_uploads: 0,
        visitor_uploads: 8,
        total_uploads: 8,
      },
    ];

    mockRpc.mockResolvedValue({
      data: mockData,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(screen.getByText("Speaker Request")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Resume Submissions")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    // Verify RPC was called with correct parameters
    expect(mockRpc).toHaveBeenCalledWith("get_upload_stats_by_profile", {
      p_profile_id: "profile-1",
      p_days: 7,
    });
  });

  it("shows owner vs visitor breakdown", async () => {
    const mockData: UploadStatsRow[] = [
      {
        drop_id: "1",
        drop_label: "Speaker Request",
        owner_uploads: 2,
        visitor_uploads: 10,
        total_uploads: 12,
      },
    ];

    mockRpc.mockResolvedValue({
      data: mockData,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(screen.getByText("Speaker Request")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Should show breakdown
    expect(screen.getByText(/2.*by you/i)).toBeInTheDocument();
    expect(screen.getByText(/10.*by visitors/i)).toBeInTheDocument();
  });

  it("shows empty state when API returns empty array", async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/No drop submissions yet/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("handles API errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: "Database error",
        code: "PGRST116",
        details: "",
        hint: "",
        name: "PostgrestError",
      },
      count: null,
      status: 500,
      statusText: "Internal Server Error",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/No drop submissions yet/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DropsAnalyticsCard] Error fetching upload stats:",
      expect.objectContaining({ message: "Database error" }),
    );

    consoleErrorSpy.mockRestore();
  });

  it("handles unexpected errors", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockRpc.mockRejectedValue(new Error("Network error"));

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/No drop submissions yet/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DropsAnalyticsCard] Unexpected error:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("expands and collapses section", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          drop_id: "1",
          drop_label: "Speaker Request",
          owner_uploads: 0,
          visitor_uploads: 12,
          total_uploads: 12,
        },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const user = userEvent.setup();
    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(() => {
      expect(screen.getByText("Speaker Request")).toBeInTheDocument();
    });

    const toggleButton = screen.getByLabelText(/collapse|expand/i);
    expect(screen.getByText(/drops/i)).toBeInTheDocument();

    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.queryByText("Speaker Request")).not.toBeInTheDocument();
    });
  });

  it("reloads data when days prop changes", async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: [
          {
            drop_id: "1",
            drop_label: "Speaker Request",
            owner_uploads: 0,
            visitor_uploads: 12,
            total_uploads: 12,
          },
        ],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: [
          {
            drop_id: "1",
            drop_label: "Speaker Request",
            owner_uploads: 5,
            visitor_uploads: 30,
            total_uploads: 35,
          },
        ],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      });

    const { rerender } = render(
      <DropsAnalyticsCard profileId="profile-1" days={7} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Speaker Request")).toBeInTheDocument();
    });

    expect(mockRpc).toHaveBeenCalledWith("get_upload_stats_by_profile", {
      p_profile_id: "profile-1",
      p_days: 7,
    });

    // Change days prop
    rerender(<DropsAnalyticsCard profileId="profile-1" days={30} />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_upload_stats_by_profile", {
        p_profile_id: "profile-1",
        p_days: 30,
      });
    });

    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it("reloads data when profileId changes", async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: [
          {
            drop_id: "1",
            drop_label: "Speaker Request",
            owner_uploads: 0,
            visitor_uploads: 12,
            total_uploads: 12,
          },
        ],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: [
          {
            drop_id: "2",
            drop_label: "Design Files",
            owner_uploads: 3,
            visitor_uploads: 2,
            total_uploads: 5,
          },
        ],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      });

    const { rerender } = render(
      <DropsAnalyticsCard profileId="profile-1" days={7} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Speaker Request")).toBeInTheDocument();
    });

    rerender(<DropsAnalyticsCard profileId="profile-2" days={7} />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_upload_stats_by_profile", {
        p_profile_id: "profile-2",
        p_days: 7,
      });
    });

    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it("does not call API when profileId is null", () => {
    render(<DropsAnalyticsCard profileId={null} days={7} />);

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("handles null drop_label gracefully", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          drop_id: "1",
          drop_label: null,
          owner_uploads: 2,
          visitor_uploads: 3,
          total_uploads: 5,
        },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(() => {
      // Should display drop_id when label is null
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not show breakdown when total_uploads is 0", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          drop_id: "1",
          drop_label: "Empty Drop",
          owner_uploads: 0,
          visitor_uploads: 0,
          total_uploads: 0,
        },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<DropsAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(() => {
      expect(screen.getByText("Empty Drop")).toBeInTheDocument();
    });

    expect(screen.getByText("0")).toBeInTheDocument();
    // Should not show breakdown text when total is 0
    expect(screen.queryByText(/by you/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/by visitors/i)).not.toBeInTheDocument();
  });
});
