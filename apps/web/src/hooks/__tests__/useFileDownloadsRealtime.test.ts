import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFileDownloadsRealtime } from "../useFileDownloadsRealtime";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DownloadRow } from "@/routes/Dashboard/types";

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

describe("useFileDownloadsRealtime", () => {
  const mockProfileId = "profile-123";
  const mockUserId = "user-123";
  const mockSetDownloads = vi.fn();
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
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

  it("should subscribe correctly to INSERT events on file_downloads", () => {
    renderHook(() =>
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    expect(supabase.channel).toHaveBeenCalledWith(
      `file_downloads:${mockProfileId}`,
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "INSERT",
        schema: "public",
        table: "file_downloads",
      }),
      expect.any(Function),
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it("should filter downloads by profile_id via submission → drop", async () => {
    const mockSubmissionData = {
      id: "sub-1",
      drop_id: "drop-1",
      name: "John",
      email: "john@example.com",
      created_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
    };
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockProfileData = {
      user_id: "different-user-id",
    };
    const mockDownloads: DownloadRow[] = [
      {
        download_id: 1,
        downloaded_at: "2024-01-01T00:00:00Z",
        submission_id: "sub-1",
        drop_id: "drop-1",
        drop_label: "Test Drop",
        file_path: "submissions/sub-1/file.pdf",
        file_name: "file.pdf",
        submission_name: "John",
        submission_email: "john@example.com",
        submission_created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const mockFrom = vi.fn((table: string) => {
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockSubmissionData,
                error: null,
              }),
            })),
          })),
        };
      }
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
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockProfileData,
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
      data: mockDownloads,
      error: null,
    });

    renderHook(() =>
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: 1,
        submission_id: "sub-1",
        file_path: "submissions/sub-1/file.pdf",
        user_id: "visitor-user-id",
      },
    });

    await waitFor(() => {
      expect(mockSetDownloads).toHaveBeenCalled();
    });
  });

  it("should exclude downloads from the owner", async () => {
    const mockSubmissionData = {
      id: "sub-1",
      drop_id: "drop-1",
      name: "John",
      email: null,
      created_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
    };
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockProfileData = {
      user_id: mockUserId,
    };

    const mockFrom = vi.fn((table: string) => {
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockSubmissionData,
                error: null,
              }),
            })),
          })),
        };
      }
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
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockProfileData,
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
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: 1,
        submission_id: "sub-1",
        file_path: "submissions/sub-1/file.pdf",
        user_id: mockUserId, // Owner's download
      },
    });

    // Wait a bit to ensure no updates happen
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockSetDownloads).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("should update setDownloads when a new download arrives", async () => {
    const mockSubmissionData = {
      id: "sub-1",
      drop_id: "drop-1",
      name: null,
      email: null,
      created_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
    };
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockProfileData = {
      user_id: "different-user-id",
    };
    const mockDownloads: DownloadRow[] = [
      {
        download_id: 1,
        downloaded_at: "2024-01-01T00:00:00Z",
        submission_id: "sub-1",
        drop_id: "drop-1",
        drop_label: "Test Drop",
        file_path: "submissions/sub-1/file.pdf",
        file_name: "file.pdf",
        submission_name: null,
        submission_email: null,
        submission_created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const mockFrom = vi.fn((table: string) => {
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockSubmissionData,
                error: null,
              }),
            })),
          })),
        };
      }
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
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockProfileData,
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
      data: mockDownloads,
      error: null,
    });

    renderHook(() =>
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: 1,
        submission_id: "sub-1",
        file_path: "submissions/sub-1/file.pdf",
        user_id: "visitor-user-id",
      },
    });

    await waitFor(() => {
      expect(mockSetDownloads).toHaveBeenCalledWith(mockDownloads);
    });
  });

  it("should display a toast notification with file name", async () => {
    const mockSubmissionData = {
      id: "sub-1",
      drop_id: "drop-1",
      name: null,
      email: null,
      created_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
    };
    const mockDropData = {
      id: "drop-1",
      profile_id: mockProfileId,
      label: "Test Drop",
    };
    const mockProfileData = {
      user_id: "different-user-id",
    };
    const mockDownloads: DownloadRow[] = [];

    const mockFrom = vi.fn((table: string) => {
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockSubmissionData,
                error: null,
              }),
            })),
          })),
        };
      }
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
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockProfileData,
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
      data: mockDownloads,
      error: null,
    });

    renderHook(() =>
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: 1,
        submission_id: "sub-1",
        file_path: "submissions/sub-1/document.pdf",
        user_id: "visitor-user-id",
      },
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "File downloaded from Test Drop",
        expect.objectContaining({
          description: "document.pdf",
          duration: 5000,
        }),
      );
    });
  });

  it("should clean up subscription on unmount", () => {
    const { unmount } = renderHook(() =>
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("should not subscribe if profileId is null", () => {
    renderHook(() =>
      useFileDownloadsRealtime({
        profileId: null,
        setDownloads: mockSetDownloads,
      }),
    );

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it("should ignore downloads from deleted submissions", async () => {
    const mockSubmissionData = {
      id: "sub-1",
      drop_id: "drop-1",
      name: null,
      email: null,
      created_at: "2024-01-01T00:00:00Z",
      deleted_at: "2024-01-02T00:00:00Z", // Deleted
    };

    const mockFrom = vi.fn((table: string) => {
      if (table === "submissions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockSubmissionData,
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
      useFileDownloadsRealtime({
        profileId: mockProfileId,
        setDownloads: mockSetDownloads,
      }),
    );

    const insertCallback = mockChannel.on.mock.calls[0][2];
    await insertCallback({
      new: {
        id: 1,
        submission_id: "sub-1",
        file_path: "submissions/sub-1/file.pdf",
        user_id: "visitor-user-id",
      },
    });

    // Wait a bit to ensure no updates happen
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockSetDownloads).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
