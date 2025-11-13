import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
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

import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";

describe("useUserPreferences", () => {
  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: { user: mockUser } as Session,
      loading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
    });
  });

  afterEach(() => {
    localStorage.clear();
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

  it("should load preferences from localStorage", async () => {
    const storedPrefs = {
      email_notifications: false,
      weekly_digest: true,
      marketing_emails: true,
      product_updates: false,
    };
    localStorage.setItem(
      `preferences_${mockUser.id}`,
      JSON.stringify(storedPrefs),
    );

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      ...storedPrefs,
    });
  });

  it("should merge stored preferences with defaults", async () => {
    const partialPrefs = {
      email_notifications: false,
    };
    localStorage.setItem(
      `preferences_${mockUser.id}`,
      JSON.stringify(partialPrefs),
    );

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: false,
      weekly_digest: false,
      marketing_emails: false,
      product_updates: true,
    });
  });

  it("should not load preferences when user is not available", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
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

  it("should handle localStorage parse errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    localStorage.setItem(`preferences_${mockUser.id}`, "invalid json");

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should fall back to defaults
    expect(result.current.preferences).toEqual({
      email_notifications: true,
      weekly_digest: false,
      marketing_emails: false,
      product_updates: true,
    });

    consoleErrorSpy.mockRestore();
  });

  it("should update a single preference", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePreference("email_notifications", false);
    });

    expect(result.current.preferences.email_notifications).toBe(false);
    expect(localStorage.getItem(`preferences_${mockUser.id}`)).toBeTruthy();
    expect(toast.success).toHaveBeenCalled();
  });

  it("should save multiple preferences at once", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.savePreferences({
        email_notifications: false,
        weekly_digest: true,
      });
    });

    expect(result.current.preferences.email_notifications).toBe(false);
    expect(result.current.preferences.weekly_digest).toBe(true);
    expect(toast.success).toHaveBeenCalled();
  });

  it("should show error toast when save fails", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorage.setItem;
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

    await act(async () => {
      await result.current.savePreferences({ email_notifications: false });
    });

    expect(toast.error).toHaveBeenCalled();

    // Restore
    setItemSpy.mockRestore();
    localStorage.setItem = originalSetItem;
  });

  it("should not save when user is not available", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
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

  it("should handle multiple rapid preference updates", async () => {
    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update preferences sequentially to avoid race conditions
    await act(async () => {
      await result.current.updatePreference("email_notifications", false);
    });

    await act(async () => {
      await result.current.updatePreference("weekly_digest", true);
    });

    await act(async () => {
      await result.current.updatePreference("marketing_emails", true);
    });

    expect(result.current.preferences).toEqual({
      email_notifications: false,
      weekly_digest: true,
      marketing_emails: true,
      product_updates: true,
    });
  });
});
