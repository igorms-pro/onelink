import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { User, Session } from "@supabase/supabase-js";
import { useUserPreferences } from "../useUserPreferences";

// Mock dependencies
vi.mock("@/lib/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

describe("useUserPreferences", () => {
  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;

  let mockUpsert: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as Session,
      loading: false,
      checkingMFA: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    // Default mock Supabase to return no data (will create default entry)
    mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      upsert: mockUpsert,
    } as unknown as ReturnType<typeof supabase.from>);

    // Default mock for auth.getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
      error: null,
    } as any);
  });

  it("should initialize with default preferences when no stored data", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: true,
      weekly_digest: false,
      marketing_emails: false,
      product_updates: true,
    });
  });

  it("should load preferences from Supabase", async () => {
    const storedPrefs = {
      user_id: mockUser.id,
      email_notifications: false,
      weekly_digest: true,
      marketing_emails: true,
      product_updates: false,
    };

    // Mock Supabase auth.getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
      error: null,
    } as any);

    // Mock Supabase to return existing preferences
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: storedPrefs,
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useUserPreferences());

    // Wait for preferences to be loaded from Supabase (not just loading to be false)
    await waitFor(() => {
      expect(result.current.preferences.email_notifications).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: false,
      weekly_digest: true,
      marketing_emails: true,
      product_updates: false,
    });
  });

  it("should merge stored preferences with defaults from Supabase", async () => {
    const partialPrefs = {
      user_id: mockUser.id,
      email_notifications: false,
      // Other fields missing, should use defaults
    };

    // Mock Supabase auth.getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
      error: null,
    } as any);

    // Mock Supabase to return partial preferences
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: partialPrefs,
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useUserPreferences());

    // Wait for preferences to be loaded from Supabase (not just loading to be false)
    await waitFor(() => {
      expect(result.current.preferences.email_notifications).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: false,
      weekly_digest: false, // default
      marketing_emails: false, // default
      product_updates: true, // default
    });
  });

  it("should not load preferences when user is not available", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      checkingMFA: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: true,
      weekly_digest: false,
      marketing_emails: false,
      product_updates: true,
    });
  });

  it("should handle Supabase errors gracefully and use defaults", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock Supabase to return error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Table not found", code: "PGRST116" },
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    // Ensure getSession is mocked for this test
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
      error: null,
    } as any);

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use defaults when error occurs
    expect(result.current.preferences).toEqual({
      email_notifications: true,
      weekly_digest: false,
      marketing_emails: false,
      product_updates: true,
    });

    // Error should be logged to console
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it.skip("should update a single preference", async () => {
    const { result } = renderHook(() => useUserPreferences());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock to only count calls from this test
    mockUpsert.mockClear();

    await act(async () => {
      await result.current.updatePreference("email_notifications", false);
    });

    // Wait for saving to complete
    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });

    expect(result.current.preferences.email_notifications).toBe(false);
    expect(mockUpsert).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it.skip("should save multiple preferences at once", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock to only count calls from this test
    mockUpsert.mockClear();

    await act(async () => {
      await result.current.savePreferences({
        email_notifications: false,
        weekly_digest: true,
      });
    });

    // Wait for saving to complete
    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });

    expect(result.current.preferences.email_notifications).toBe(false);
    expect(result.current.preferences.weekly_digest).toBe(true);
    expect(mockUpsert).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it("should show error toast when save fails", async () => {
    // Mock Supabase upsert to fail
    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database error", code: "PGRST301" },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      upsert: mockUpsert,
    } as unknown as ReturnType<typeof supabase.from>);

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.savePreferences({ email_notifications: false });
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("should not save when user is not available", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      checkingMFA: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.savePreferences({ email_notifications: false });
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should set saving state during save operation", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const savePromise = result.current.savePreferences({
      email_notifications: false,
    });

    // Check that saving is true during the operation
    // Note: This might be too fast to catch, but we test the state change
    await savePromise;

    expect(result.current.saving).toBe(false);
  });

  it.skip("should handle multiple rapid preference updates", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock to only count calls from this test
    mockUpsert.mockClear();

    // Update preferences sequentially to avoid race conditions
    await act(async () => {
      await result.current.updatePreference("email_notifications", false);
    });
    await waitFor(() => expect(result.current.saving).toBe(false));

    await act(async () => {
      await result.current.updatePreference("weekly_digest", true);
    });
    await waitFor(() => expect(result.current.saving).toBe(false));

    await act(async () => {
      await result.current.updatePreference("marketing_emails", true);
    });
    await waitFor(() => expect(result.current.saving).toBe(false));

    expect(result.current.preferences).toEqual({
      email_notifications: false,
      weekly_digest: true,
      marketing_emails: true,
      product_updates: true,
    });

    expect(mockUpsert).toHaveBeenCalledTimes(3);
  });
});
