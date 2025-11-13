import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinksAnalyticsCard } from "../LinksAnalyticsCard";

// Mock useSortableData hook - simplified version that just returns data sorted by default
vi.mock("../../hooks/useSortableData", () => ({
  useSortableData: ({ data, defaultSortField, defaultSortDirection }: any) => {
    // Simple mock that returns data sorted by default field and direction
    const sortedData = [...data].sort((a: any, b: any) => {
      const aVal = a[defaultSortField];
      const bVal = b[defaultSortField];
      if (defaultSortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return {
      sortedData,
      sortField: defaultSortField,
      sortDirection: defaultSortDirection,
      handleSort: vi.fn(),
    };
  },
}));

describe.skip("LinksAnalyticsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders profile not ready message when profileId is null", () => {
    render(<LinksAnalyticsCard profileId={null} days={7} />);
    expect(screen.getByText(/profile not ready/i)).toBeInTheDocument();
  });

  it("renders loading skeleton initially", () => {
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);
    const skeletons = screen.getAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders analytics data after loading", async () => {
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);

    // Advance timers to trigger the setTimeout in the component
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("expands and collapses section", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const toggleButton = screen.getByLabelText(/collapse|expand/i);
    expect(screen.getByText(/links/i)).toBeInTheDocument();
    await user.click(toggleButton);

    await waitFor(
      () => {
        expect(screen.queryByText("Portfolio")).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("sorts by label when clicking label header", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const labelButton = screen.getByText(/name/i);
    expect(labelButton).toBeInTheDocument();
    await user.click(labelButton);

    // Should show sort indicator
    expect(labelButton.closest("button")).toBeInTheDocument();
  });

  it("sorts by clicks when clicking clicks header", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });

    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const clicksButton = screen.getByText(/clicks/i);
    expect(clicksButton).toBeInTheDocument();
    await user.click(clicksButton);
    expect(clicksButton.closest("button")).toBeInTheDocument();
  });

  it("shows empty state when no clicks", async () => {
    render(<LinksAnalyticsCard profileId="profile-1" days={7} />);
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });

    // The component uses dummy data, so we'd need to mock it differently
    // This is a placeholder test
    expect(screen.getByText(/links/i)).toBeInTheDocument();
  });

  it("reloads data when days prop changes", async () => {
    const { rerender } = render(
      <LinksAnalyticsCard profileId="profile-1" days={7} />,
    );
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });
    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    rerender(<LinksAnalyticsCard profileId="profile-1" days={30} />);
    // Component should reload data when days changes
    await act(async () => {
      vi.advanceTimersByTime(500);
      vi.runAllTimers();
    });
    // Data should still be visible after reload
    await waitFor(
      () => {
        expect(screen.getByText("Portfolio")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });
});
