import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useDashboardData } from "../useDashboardData";
import { supabase } from "@/lib/supabase";
import { getOrCreateProfile, getSelfPlan } from "@/lib/profile";

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
      drop_label: "Drop 1",
      created_at: "2024-01-01T00:00:00Z",
      name: "John",
      email: "john@example.com",
      note: "Test note",
      files: [],
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
    vi.mocked(supabase.from).mockImplementation(defaultMockFrom);
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });
    (getOrCreateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockProfile,
    );
    (getSelfPlan as ReturnType<typeof vi.fn>).mockResolvedValue("free");
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

    vi.mocked(supabase.from).mockImplementation(mockFrom);
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
    const mockFrom = vi.fn((_table: string) => ({
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
    const mockFrom = vi.fn((_table: string) => ({
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
    (getSelfPlan as ReturnType<typeof vi.fn>).mockResolvedValue("pro");

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

    expect(result.current.plan).toBe("pro");
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

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useDashboardData(mockUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.links).toEqual([]);
    expect(result.current.submissions).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
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
});
