import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { PlanType } from "@/lib/types/plan";
import { useDashboardData } from "../useDashboardData";
import { supabase } from "@/lib/supabase";
import { getOrCreateProfile, getSelfPlan } from "@/lib/profile";
import { useSubmissionsRealtime } from "@/hooks/useSubmissionsRealtime";
import { useFileDownloadsRealtime } from "@/hooks/useFileDownloadsRealtime";

// Mock dependencies - override global mock
vi.mock("@/lib/supabase", () => {
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      rpc: mockRpc,
    },
  };
});

vi.mock("@/lib/profile", () => ({
  getOrCreateProfile: vi.fn(),
  getSelfPlan: vi.fn(),
}));

vi.mock("@/hooks/useSubmissionsRealtime", () => ({
  useSubmissionsRealtime: vi.fn(),
}));

vi.mock("@/hooks/useFileDownloadsRealtime", () => ({
  useFileDownloadsRealtime: vi.fn(),
}));

describe("useDashboardData", () => {
  const mockUserId = "user-123";
  const mockProfile = {
    id: "profile-123",
    slug: "test-slug",
    display_name: "Test User",
    bio: "Test bio",
    avatar_url: "https://example.com/avatar.jpg",
  };
  const mockLinks = [
    {
      id: "link-1",
      label: "Link 1",
      emoji: "🚀",
      url: "https://example.com",
      order: 1,
    },
  ];
  const mockDrops = [
    { id: "drop-1", label: "Drop 1", emoji: "📁", order: 1, is_active: true },
  ];
  const mockSubmissions = [
    {
      submission_id: "sub-1",
      drop_id: "drop-1",
      drop_label: "Drop 1",
      created_at: "2024-01-01T00:00:00Z",
      name: "John",
      email: "john@example.com",
      note: "Test note",
      files: [],
      read_at: null, // Unread
    },
    {
      submission_id: "sub-2",
      drop_id: "drop-2",
      drop_label: "Drop 2",
      created_at: "2024-01-02T00:00:00Z",
      name: "Jane",
      email: "jane@example.com",
      note: null,
      files: [],
      read_at: "2024-01-02T10:00:00Z", // Read
    },
  ];
  const mockDownloads = [
    {
      download_id: 1,
      downloaded_at: "2024-01-01T00:00:00Z",
      submission_id: "sub-1",
      drop_id: "drop-1",
      drop_label: "Drop 1",
      file_path: "submissions/sub-1/file.pdf",
      file_name: "file.pdf",
      submission_name: "John",
      submission_email: "john@example.com",
      submission_created_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset supabase mocks to ensure clean state
    // Set up default mock that works for all tests
    const defaultMockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));
    vi.mocked(supabase.from).mockImplementation(
      defaultMockFrom as unknown as typeof supabase.from,
    );
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (getOrCreateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockProfile,
    );
    (getSelfPlan as ReturnType<typeof vi.fn>).mockResolvedValue(PlanType.FREE);
    vi.mocked(useSubmissionsRealtime).mockReturnValue(undefined);
    vi.mocked(useFileDownloadsRealtime).mockReturnValue(undefined);
  });

  it("should return loading state initially", async () => {
    const { result } = renderHook(() => useDashboardData(mockUserId));
    expect(result.current.loading).toBe(true);
    // Wait a bit to ensure state is stable
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("should set loading to false when userId is null", () => {
    const { result } = renderHook(() => useDashboardData(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.profileId).toBe(null);
  });

  it("should load profile data successfully", async () => {
    const mockFrom = vi.fn((table: string) => {
      const chainable = {
        select: vi.fn((_columns?: string) => ({
          eq: vi.fn((_column: string, _value: any) => ({
            order: vi.fn(
              (_column: string, _options?: { ascending?: boolean }) => ({
                data:
                  table === "links"
                    ? mockLinks
                    : table === "drops"
                      ? mockDrops
                      : [],
                error: null,
              }),
            ),
            data:
              table === "links"
                ? mockLinks
                : table === "drops"
                  ? mockDrops
                  : [],
            error: null,
          })),
          data:
            table === "links" ? mockLinks : table === "drops" ? mockDrops : [],
          error: null,
        })),
        data:
          table === "links" ? mockLinks : table === "drops" ? mockDrops : [],
        error: null,
      };
      return chainable;
    });

    vi.mocked(supabase.from).mockImplementation(
      mockFrom as unknown as typeof supabase.from,
    );
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 },
    );

    expect(result.current.profileId).toBe(mockProfile.id);
    expect(result.current.profileFormInitial).toEqual({
      slug: mockProfile.slug,
      display_name: mockProfile.display_name,
      bio: mockProfile.bio,
      avatar_url: mockProfile.avatar_url,
    });
  });

  it("should load links successfully", async () => {
    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: table === "links" ? mockLinks : [],
              error: null,
            }),
          ),
          data: table === "links" ? mockLinks : [],
          error: null,
        })),
        data: table === "links" ? mockLinks : [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.links).toEqual(mockLinks);
  });

  it("should load drops successfully", async () => {
    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data:
                table === "links"
                  ? mockLinks
                  : table === "drops"
                    ? mockDrops
                    : [],
              error: null,
            }),
          ),
          data:
            table === "links" ? mockLinks : table === "drops" ? mockDrops : [],
          error: null,
        })),
        data:
          table === "links" ? mockLinks : table === "drops" ? mockDrops : [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.drops).toEqual(mockDrops);
  });

  it("should load plan successfully", async () => {
    (getSelfPlan as ReturnType<typeof vi.fn>).mockResolvedValue(PlanType.PRO);

    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plan).toBe(PlanType.PRO);
  });

  it("should load submissions successfully", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSubmissions,
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.submissions).toEqual(mockSubmissions);
  });

  it("should handle errors gracefully", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: null,
              error: { message: "Error loading links" },
            }),
          ),
          data: null,
          error: { message: "Error loading links" },
        })),
        data: null,
        error: { message: "Error loading links" },
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "Error loading submissions" },
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.links).toEqual([]);
    expect(result.current.submissions).toEqual([]);
  });

  it("should handle empty submissions array", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null, // Not an array
      error: null,
    });

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.submissions).toEqual([]);
  });

  it("should cleanup on unmount", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { unmount } = renderHook(() => useDashboardData(mockUserId));

    await act(async () => {
      unmount();
    });

    // After unmount, the hook should not update state
    // This test verifies cleanup happens without errors
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  it("should calculate unreadCount correctly (submissions where read_at is null)", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fnName: string) => {
        if (fnName === "get_submissions_by_profile") {
          return Promise.resolve({
            data: mockSubmissions,
            error: null,
          });
        }
        if (fnName === "get_downloads_by_profile") {
          return Promise.resolve({
            data: mockDownloads,
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      },
    );

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have 1 unread (sub-1 has read_at: null)
    expect(result.current.unreadCount).toBe(1);
  });

  it("should update unreadCount when submissions change", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fnName: string) => {
        if (fnName === "get_submissions_by_profile") {
          return Promise.resolve({
            data: mockSubmissions,
            error: null,
          });
        }
        if (fnName === "get_downloads_by_profile") {
          return Promise.resolve({
            data: mockDownloads,
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      },
    );

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);

    // Update submissions to mark all as read
    act(() => {
      result.current.setSubmissions(
        mockSubmissions.map((s) => ({
          ...s,
          read_at: s.read_at || new Date().toISOString(),
        })),
      );
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should refresh inbox successfully", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    const refreshedSubmissions = [
      ...mockSubmissions,
      {
        submission_id: "sub-3",
        drop_label: "Drop 3",
        created_at: "2024-01-03T00:00:00Z",
        name: "Bob",
        email: null,
        note: null,
        files: [],
        read_at: null,
      },
    ];

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fnName: string) => {
        if (fnName === "get_submissions_by_profile") {
          return Promise.resolve({
            data: refreshedSubmissions,
            error: null,
          });
        }
        if (fnName === "get_downloads_by_profile") {
          return Promise.resolve({
            data: mockDownloads,
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      },
    );

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const refreshResult = await result.current.refreshInbox();

    expect(refreshResult).toBe(true);
    expect(result.current.submissions).toEqual(refreshedSubmissions);
    expect(result.current.downloads).toEqual(mockDownloads);
  });

  it("should return false if refreshInbox fails", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fnName: string) => {
        if (fnName === "get_submissions_by_profile") {
          return Promise.resolve({
            data: null,
            error: { message: "Failed to refresh" },
          });
        }
        return Promise.resolve({ data: [], error: null });
      },
    );

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const refreshResult = await result.current.refreshInbox();

    expect(refreshResult).toBe(false);
  });

  it("should clear all submissions successfully", async () => {
    let callCount = 0;
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fnName: string) => {
        if (fnName === "delete_submissions_by_profile") {
          return Promise.resolve({
            data: null,
            error: null,
          });
        }
        if (fnName === "get_submissions_by_profile") {
          // First call returns initial data, subsequent calls return empty after clear
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              data: mockSubmissions,
              error: null,
            });
          }
          // After clear, return empty array
          return Promise.resolve({
            data: [],
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      },
    );

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wait for initial submissions to load
    await waitFor(() => {
      expect(result.current.submissions.length).toBeGreaterThan(0);
    });

    const clearResult = await result.current.clearAllSubmissions();

    expect(clearResult).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith(
      "delete_submissions_by_profile",
      expect.objectContaining({
        p_profile_id: mockProfile.id,
      }),
    );
    // Wait for submissions to be cleared
    await waitFor(() => {
      expect(result.current.submissions).toEqual([]);
    });
  });

  it("should integrate useSubmissionsRealtime and useFileDownloadsRealtime", async () => {
    const mockFrom = vi.fn((_table: string) => ({
      select: vi.fn((_columns?: string) => ({
        eq: vi.fn((_column: string, _value: any) => ({
          order: vi.fn(
            (_column: string, _options?: { ascending?: boolean }) => ({
              data: [],
              error: null,
            }),
          ),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(useSubmissionsRealtime).toHaveBeenCalled();
      expect(useFileDownloadsRealtime).toHaveBeenCalled();
    });
  });

  it("should not load anything if userId is null", () => {
    const { result } = renderHook(() => useDashboardData(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.profileId).toBe(null);
    expect(getOrCreateProfile).not.toHaveBeenCalled();
  });

  it("should not load data if profile does not exist (returns null)", async () => {
    // Mock getOrCreateProfile to return null (profile doesn't exist)
    (getOrCreateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profileId).toBe(null);
    expect(result.current.profileFormInitial).toBe(null);
    expect(result.current.links).toEqual([]);
    expect(result.current.drops).toEqual([]);
    expect(result.current.submissions).toEqual([]);
    expect(result.current.downloads).toEqual([]);
    // Should not call supabase.from for links/drops since profile doesn't exist
    expect(supabase.from).not.toHaveBeenCalledWith("links");
    expect(supabase.from).not.toHaveBeenCalledWith("drops");
  });
});
