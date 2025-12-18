import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSubmissionsRealtime } from "../useSubmissionsRealtime";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { SubmissionRow } from "@/routes/Dashboard/types";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("useSubmissionsRealtime", () => {
  const mockProfileId = "profile-123";
  const mockSetSubmissions = vi.fn();
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
      // Simulate subscription success
      setTimeout(() => callback("SUBSCRIBED"), 0);
      return { unsubscribe: vi.fn() };
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.channel).mockReturnValue(
      mockChannel as unknown as ReturnType<typeof supabase.channel>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should subscribe correctly to INSERT events on submissions", () => {
    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    expect(supabase.channel).toHaveBeenCalledWith(
      `submissions:${mockProfileId}`,
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "INSERT",
        schema: "public",
        table: "submissions",
      }),
      expect.any(Function),
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it("should filter submissions by profile_id", async () => {
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockSubmissions: SubmissionRow[] = [
      {
        submission_id: "sub-1",
        drop_id: "drop-1",
        drop_label: "Test Drop",
        created_at: "2024-01-01T00:00:00Z",
        name: "John",
        email: "john@example.com",
        note: null,
        files: [],
        read_at: null,
      },
    ];

    // Mock the drop query
    const mockFrom = vi.fn((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDropData,
                error: null,
              }),
            })),
          })),
        };
      }
      return {
        select: vi.fn(),
      };
    });

    vi.mocked(supabase).from = mockFrom as any;
    vi.mocked(supabase).rpc = vi.fn().mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    // Get the callback passed to .on()
    const insertCallback = mockChannel.on.mock.calls[0][2];

    // Simulate INSERT event
    await insertCallback({
      new: {
        id: "sub-1",
        drop_id: "drop-1",
        name: "John",
      },
    });

    await waitFor(() => {
      expect(mockSetSubmissions).toHaveBeenCalled();
    });
  });

  it("should update setSubmissions when a new submission arrives", async () => {
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockSubmissions: SubmissionRow[] = [
      {
        submission_id: "sub-1",
        drop_id: "drop-1",
        drop_label: "Test Drop",
        created_at: "2024-01-01T00:00:00Z",
        name: "John",
        email: null,
        note: null,
        files: [],
        read_at: null,
      },
    ];

    const mockFrom = vi.fn((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDropData,
                error: null,
              }),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase).from = mockFrom as any;
    vi.mocked(supabase).rpc = vi.fn().mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: "sub-1",
        drop_id: "drop-1",
        name: "John",
      },
    });

    await waitFor(() => {
      expect(mockSetSubmissions).toHaveBeenCalledWith(mockSubmissions);
    });
  });

  it("should display a toast notification with the correct message", async () => {
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockSubmissions: SubmissionRow[] = [];

    const mockFrom = vi.fn((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDropData,
                error: null,
              }),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase).from = mockFrom as any;
    vi.mocked(supabase).rpc = vi.fn().mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: "sub-1",
        drop_id: "drop-1",
        name: "John",
      },
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "New submission in Test Drop",
        expect.objectContaining({
          description: "From: John",
          duration: 5000,
        }),
      );
    });
  });

  it("should clean up subscription on unmount", () => {
    const { unmount } = renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("should not subscribe if profileId is null", () => {
    renderHook(() =>
      useSubmissionsRealtime({
        profileId: null,
        setSubmissions: mockSetSubmissions,
      }),
    );

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it("should handle query drop errors correctly", async () => {
    const mockFrom = vi.fn((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Drop not found" },
              }),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase).from = mockFrom as any;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: "sub-1",
        drop_id: "drop-1",
      },
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(mockSetSubmissions).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should ignore submissions that do not belong to the profile", async () => {
    const mockDropData = {
      id: "drop-1",
      profile_id: "different-profile-id",
      label: "Test Drop",
    };

    const mockFrom = vi.fn((table: string) => {
      if (table === "drops") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDropData,
                error: null,
              }),
            })),
          })),
        };
      }
      return { select: vi.fn() };
    });

    vi.mocked(supabase).from = mockFrom as any;

    renderHook(() =>
      useSubmissionsRealtime({
        profileId: mockProfileId,
        setSubmissions: mockSetSubmissions,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: "sub-1",
        drop_id: "drop-1",
      },
    });

    // Wait a bit to ensure no updates happen
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockSetSubmissions).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
