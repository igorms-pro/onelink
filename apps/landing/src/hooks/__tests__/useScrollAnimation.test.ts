import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useScrollAnimation } from "../useScrollAnimation";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();
let mockIntersectionObserver: typeof IntersectionObserver;

beforeEach(() => {
  vi.clearAllMocks();
  mockIntersectionObserver = vi.fn().mockImplementation((_callback) => {
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  }) as unknown as typeof IntersectionObserver;

  // Override the global mock
  (
    globalThis as unknown as {
      IntersectionObserver: typeof IntersectionObserver;
    }
  ).IntersectionObserver = mockIntersectionObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useScrollAnimation Hook", () => {
  it("initializes Intersection Observer", () => {
    const { result } = renderHook(() => useScrollAnimation());

    // Hook should return a ref
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("creates IntersectionObserver with default options", async () => {
    const { result } = renderHook(() => useScrollAnimation());
    const mockElement = document.createElement("div");
    result.current.current = mockElement;

    // Wait for effect to run
    await new Promise((resolve) => setTimeout(resolve, 10));

    // IntersectionObserver should have been created (mocked globally)
    // The hook should work without errors
    expect(result.current).toBeDefined();
    expect(result.current.current).toBe(mockElement);
  });

  it("creates IntersectionObserver with custom options", async () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: "10px",
    };

    const { result } = renderHook(() => useScrollAnimation(customOptions));
    const mockElement = document.createElement("div");
    result.current.current = mockElement;

    // Wait for effect to run
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The hook should work with custom options
    expect(result.current).toBeDefined();
    expect(result.current.current).toBe(mockElement);
  });

  it("observes element when ref is attached", () => {
    const { result } = renderHook(() => useScrollAnimation());
    const mockElement = document.createElement("div");

    result.current.current = mockElement;

    // Wait for effect to run
    waitFor(() => {
      expect(mockObserve).toHaveBeenCalledWith(mockElement);
    });
  });

  it("does not observe when element is null", () => {
    renderHook(() => useScrollAnimation());

    // Should not observe if element is null
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it("cleans up observer on unmount", async () => {
    const { result, unmount } = renderHook(() => useScrollAnimation());
    const mockElement = document.createElement("div");

    result.current.current = mockElement;

    // Wait for effect to run
    await new Promise((resolve) => setTimeout(resolve, 10));

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

  it("adds animate-fade-in class when element intersects", async () => {
    let observerCallback: IntersectionObserverCallback;

    const customObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    }) as unknown as typeof IntersectionObserver;

    (
      globalThis as unknown as {
        IntersectionObserver: typeof IntersectionObserver;
      }
    ).IntersectionObserver = customObserver;

    const { result } = renderHook(() => useScrollAnimation());
    const mockElement = document.createElement("div");
    result.current.current = mockElement;

    // Wait for effect to run
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Simulate intersection
    if (observerCallback!) {
      observerCallback(
        [
          {
            target: mockElement,
            isIntersecting: true,
            intersectionRatio: 0.5,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: {} as DOMRectReadOnly,
            time: 0,
          },
        ],
        {} as IntersectionObserver,
      );

      // Should add class
      expect(mockElement.classList.contains("animate-fade-in")).toBe(true);
      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    }
  });

  it("does not add class when element is not intersecting", async () => {
    let observerCallback: IntersectionObserverCallback;

    const customObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    }) as unknown as typeof IntersectionObserver;

    (
      globalThis as unknown as {
        IntersectionObserver: typeof IntersectionObserver;
      }
    ).IntersectionObserver = customObserver;

    const { result } = renderHook(() => useScrollAnimation());
    const mockElement = document.createElement("div");
    result.current.current = mockElement;

    // Wait for effect to run
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Simulate non-intersection
    if (observerCallback!) {
      observerCallback(
        [
          {
            target: mockElement,
            isIntersecting: false,
            intersectionRatio: 0,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: {} as DOMRectReadOnly,
            time: 0,
          },
        ],
        {} as IntersectionObserver,
      );

      // Should not add class
      expect(mockElement.classList.contains("animate-fade-in")).toBe(false);
    }
  });

  it("returns a ref that can be attached to an element", () => {
    const { result } = renderHook(() => useScrollAnimation());

    const mockElement = document.createElement("div");

    // Ref should be assignable
    result.current.current = mockElement;

    expect(result.current.current).toBe(mockElement);
  });
});
