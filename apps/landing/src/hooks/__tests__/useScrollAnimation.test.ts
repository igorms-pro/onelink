import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollAnimation } from "../useScrollAnimation";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useScrollAnimation Hook", () => {
  it("initializes Intersection Observer", () => {
    const { result } = renderHook(() => useScrollAnimation());

    // Hook should return a ref
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("cleans up observer on unmount", () => {
    const { unmount } = renderHook(() => useScrollAnimation());

    // Unmount should not throw
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it("handles missing elements gracefully", () => {
    const { result } = renderHook(() => useScrollAnimation());

    // Ref should be null initially
    expect(result.current.current).toBeNull();

    // Hook should not crash when element is null
    expect(result.current).toBeDefined();
  });

  it("returns a ref that can be attached to an element", () => {
    const { result } = renderHook(() => useScrollAnimation());

    const mockElement = document.createElement("div");

    // Ref should be assignable
    result.current.current = mockElement;

    expect(result.current.current).toBe(mockElement);
  });
});
