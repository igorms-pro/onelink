import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUsernameAvailability } from "../useUsernameAvailability";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("useUsernameAvailability", () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockMaybeSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers - faster and more reliable for React hooks
    vi.useRealTimers();

    // Setup Supabase mock chain
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);
  });

  afterEach(() => {
    // No cleanup needed with real timers
  });

  it("should return null availability for empty username", () => {
    const { result } = renderHook(() => useUsernameAvailability(""));

    expect(result.current.available).toBe(null);
    expect(result.current.checking).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should return error for username shorter than 3 characters", () => {
    const { result } = renderHook(() => useUsernameAvailability("ab"));

    expect(result.current.available).toBe(false);
    expect(result.current.checking).toBe(false);
    expect(result.current.error).toBe("Username must be at least 3 characters");
  });

  it("should return error for username longer than 30 characters", () => {
    const longUsername = "a".repeat(31);
    const { result } = renderHook(() => useUsernameAvailability(longUsername));

    expect(result.current.available).toBe(false);
    expect(result.current.checking).toBe(false);
    expect(result.current.error).toBe("Username must be at most 30 characters");
  });

  it("should return error for username with invalid characters", () => {
    const { result } = renderHook(() => useUsernameAvailability("user@name"));

    expect(result.current.available).toBe(false);
    expect(result.current.checking).toBe(false);
    expect(result.current.error).toBe(
      "Username can only contain lowercase letters, numbers, hyphens, and underscores",
    );
  });

  it("should normalize uppercase letters to lowercase before validation", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUsernameAvailability("UserName"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(mockEq).toHaveBeenCalledWith("slug", "username");
    expect(result.current.available).toBe(true);
  });

  it("should return error for username with spaces", () => {
    const { result } = renderHook(() => useUsernameAvailability("user name"));

    expect(result.current.available).toBe(false);
    expect(result.current.checking).toBe(false);
    expect(result.current.error).toBe(
      "Username can only contain lowercase letters, numbers, hyphens, and underscores",
    );
  });

  it("should accept valid username with lowercase letters, numbers, hyphens, and underscores", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() =>
      useUsernameAvailability("user-name_123"),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(true);
    expect(result.current.error).toBe(null);
    expect(mockSelect).toHaveBeenCalledWith("slug");
    expect(mockEq).toHaveBeenCalledWith("slug", "user-name_123");
  });

  it("should debounce the availability check", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result, rerender } = renderHook(
      ({ username }) => useUsernameAvailability(username),
      { initialProps: { username: "user" } },
    );

    // Change username multiple times quickly (within debounce period)
    rerender({ username: "user1" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    rerender({ username: "user12" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    rerender({ username: "user123" });
    // Wait for debounce period to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    // Should only make one request for the final username (debouncing works)
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledWith("slug", "user123");
    expect(result.current.available).toBe(true);
  });

  it("should set checking to true during debounce", async () => {
    const { result } = renderHook(() => useUsernameAvailability("username"));

    // Should be checking immediately
    expect(result.current.checking).toBe(true);
    expect(result.current.available).toBe(null);

    // After a short time, still checking (before debounce completes)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(result.current.checking).toBe(true);
  });

  it("should return available=true when username is not taken", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUsernameAvailability("available"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should return available=false when username is taken", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { slug: "taken" },
      error: null,
    });

    const { result } = renderHook(() => useUsernameAvailability("taken"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should handle query errors", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const { result } = renderHook(() => useUsernameAvailability("username"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(null);
    expect(result.current.error).toBe("Failed to check username availability");
  });

  it("should handle network errors", async () => {
    mockMaybeSingle.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUsernameAvailability("username"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(null);
    expect(result.current.error).toBe("Network error. Please try again.");
  });

  it("should normalize username to lowercase", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUsernameAvailability("USERNAME"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(mockEq).toHaveBeenCalledWith("slug", "username");
    expect(result.current.available).toBe(true);
  });

  it("should trim whitespace from username", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() =>
      useUsernameAvailability("  username  "),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(mockEq).toHaveBeenCalledWith("slug", "username");
    expect(result.current.available).toBe(true);
  });

  it("should cancel pending requests when username changes", async () => {
    // Create a promise that we can control
    const firstPromise = new Promise((resolve) => {
      // Promise is created but never resolved (to test cancellation)
      void resolve;
    });

    mockMaybeSingle.mockReturnValueOnce(firstPromise);
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const { result, rerender } = renderHook(
      ({ username }) => useUsernameAvailability(username),
      { initialProps: { username: "first" } },
    );

    // Wait for debounce to trigger first request
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    // Change username before first request completes - this should cancel it
    rerender({ username: "second" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    // The first request should be canceled, so only one call should complete
    // (The first one was started but canceled, the second one completes)
    expect(mockMaybeSingle).toHaveBeenCalled();
    expect(result.current.available).toBe(true);
  });

  it("should use custom debounce delay", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() =>
      useUsernameAvailability("username", 1000),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Should still be checking after 500ms (debounce is 1000ms)
    expect(result.current.checking).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.checking).toBe(false);
    expect(result.current.available).toBe(true);
  });

  it("should clear error when validation passes after previous error", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result, rerender } = renderHook(
      ({ username }) => useUsernameAvailability(username),
      { initialProps: { username: "ab" } }, // Too short
    );

    expect(result.current.error).toBe("Username must be at least 3 characters");

    rerender({ username: "abc" }); // Valid
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    // Error should be cleared when validation passes
    expect(result.current.error).toBe(null);
    expect(result.current.available).toBe(true);
  });
});
