import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinksAnalyticsCard } from "../LinksAnalyticsCard";
import { supabase } from "@/lib/supabase";

// Mock useSortableData hook
vi.mock("../../hooks/useSortableData", () => ({
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

describe("LinksAnalyticsCard", () => {
  const mockRpc = vi.mocked(supabase.rpc);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile not ready message when profileId is null", () => {
    render(<LinksAnalyticsCard profileId={null} days={7} />);
    expect(screen.getByText(/profile not ready/i)).toBeInTheDocument();
  });

  it("renders loading skeleton initially", async () => {
    mockRpc.mockResolvedValue({
      data: [
        { link_id: "1", label: "Portfolio", clicks: 45 },
        { link_id: "2", label: "Contact", clicks: 23 },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    // Should show loading skeleton
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders analytics data after API call succeeds", async () => {
    const mockData = [
      { link_id: "1", label: "Portfolio", clicks: 45 },
      { link_id: "2", label: "Contact", clicks: 23 },
    ];

    mockRpc.mockResolvedValue({
      data: mockData,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();

    // Verify RPC was called with correct parameters
    expect(mockRpc).toHaveBeenCalledWith("get_clicks_by_profile", {
      p_profile_id: "profile-1",
      p_days: 7,
    });
  });

  it("shows empty state when API returns empty array", async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(screen.getByText(/no clicks/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("handles API errors gracefully", async () => {
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

    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(
      () => {
        expect(screen.getByText(/no clicks/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("expands and collapses section", async () => {
    mockRpc.mockResolvedValue({
      data: [{ link_id: "1", label: "Portfolio", clicks: 45 }],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const user = userEvent.setup();
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    await waitFor(() => {
      expect(screen.getByText("Portfolio")).toBeInTheDocument();
    });

    const toggleButton = screen.getByLabelText(/collapse|expand/i);
    expect(screen.getByText(/links/i)).toBeInTheDocument();

    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.queryByText("Portfolio")).not.toBeInTheDocument();
    });
  });

  it("reloads data when days prop changes", async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: [{ link_id: "1", label: "Portfolio", clicks: 45 }],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: [{ link_id: "1", label: "Portfolio", clicks: 120 }],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      });

    const { rerender } = render(
      <LinksAnalyticsCard profileId="profile-1" days={7} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Portfolio")).toBeInTheDocument();
    });

    expect(mockRpc).toHaveBeenCalledWith("get_clicks_by_profile", {
      p_profile_id: "profile-1",
      p_days: 7,
    });

    // Change days prop
    rerender(<LinksAnalyticsCard profileId="profile-1" days={30} />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_clicks_by_profile", {
        p_profile_id: "profile-1",
        p_days: 30,
      });
    });

    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it("reloads data when profileId changes", async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: [{ link_id: "1", label: "Portfolio", clicks: 45 }],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: [{ link_id: "2", label: "Blog", clicks: 10 }],
        error: null,
        count: null,
        status: 200,
        statusText: "OK",
      });

    const { rerender } = render(
      <LinksAnalyticsCard profileId="profile-1" days={7} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Portfolio")).toBeInTheDocument();
    });

    rerender(<LinksAnalyticsCard profileId="profile-2" days={7} />);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_clicks_by_profile", {
        p_profile_id: "profile-2",
        p_days: 7,
      });
    });

    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it("does not call API when profileId is null", () => {
    render(<LinksAnalyticsCard profileId={null} days={7} />);

    expect(mockRpc).not.toHaveBeenCalled();
  });
});
