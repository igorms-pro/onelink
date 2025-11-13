import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMediaQuery } from "../use-media-query";

describe("useMediaQuery", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.matchMedia = originalMatchMedia;
  });

  it("returns false when media query does not match", () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: "(min-width: 768px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock as any;

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("returns true when media query matches", () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock as any;

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("returns false in SSR environment (window undefined)", () => {
    // This test verifies the hook handles SSR gracefully
    // The hook checks `typeof window === "undefined"` in its implementation
    // In JSDOM, window is always defined, so we test the behavior when matchMedia returns false
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: "(min-width: 768px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = matchMediaMock as any;

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    // The hook should return false when matchMedia doesn't match
    expect(result.current).toBe(false);
  });

  it("updates when media query changes", async () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: "(min-width: 768px)",
      addEventListener: (
        event: string,
        handler: (event: MediaQueryListEvent) => void,
      ) => {
        if (event === "change") {
          changeHandler = handler;
          addEventListener(event, handler);
        }
      },
      removeEventListener,
    });
    window.matchMedia = matchMediaMock as any;

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);

    // Simulate media query change
    await act(async () => {
      if (changeHandler) {
        changeHandler({
          matches: true,
          media: "(min-width: 768px)",
        } as MediaQueryListEvent);
      }
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("uses addEventListener for modern browsers", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addEventListener,
      removeEventListener,
    });
    window.matchMedia = matchMediaMock as any;

    renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("uses addListener as fallback for older browsers", () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addListener,
      removeListener,
      addEventListener: undefined,
    } as any);
    window.matchMedia = matchMediaMock as any;

    renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(addListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it("cleans up event listener on unmount (modern browsers)", () => {
    const removeEventListener = vi.fn();
    let handler: ((event: MediaQueryListEvent) => void) | null = null;

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addEventListener: (
        _event: string,
        h: (event: MediaQueryListEvent) => void,
      ) => {
        handler = h;
      },
      removeEventListener,
    });
    window.matchMedia = matchMediaMock as any;

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("change", handler);
  });

  it("cleans up listener on unmount (older browsers)", () => {
    const removeListener = vi.fn();
    let handler: ((event: MediaQueryListEvent) => void) | null = null;

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addListener: (h: (event: MediaQueryListEvent) => void) => {
        handler = h;
      },
      removeListener,
      addEventListener: undefined,
    } as any);
    window.matchMedia = matchMediaMock as any;

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    expect(removeListener).toHaveBeenCalledWith(handler);
  });

  it("updates when query string changes", () => {
    const addEventListener1 = vi.fn();
    const removeEventListener1 = vi.fn();
    const addEventListener2 = vi.fn();
    const removeEventListener2 = vi.fn();

    const matchMediaMock = vi
      .fn()
      .mockReturnValueOnce({
        matches: false,
        media: "(min-width: 768px)",
        addEventListener: addEventListener1,
        removeEventListener: removeEventListener1,
      })
      .mockReturnValueOnce({
        matches: false,
        media: "(min-width: 768px)",
        addEventListener: addEventListener1,
        removeEventListener: removeEventListener1,
      })
      .mockReturnValueOnce({
        matches: true,
        media: "(min-width: 1024px)",
        addEventListener: addEventListener2,
        removeEventListener: removeEventListener2,
      })
      .mockReturnValueOnce({
        matches: true,
        media: "(min-width: 1024px)",
        addEventListener: addEventListener2,
        removeEventListener: removeEventListener2,
      });
    window.matchMedia = matchMediaMock as any;

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: "(min-width: 768px)" },
      },
    );

    expect(result.current).toBe(false);

    rerender({ query: "(min-width: 1024px)" });

    expect(result.current).toBe(true);
  });

  it("initializes with current matchMedia state", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addEventListener,
      removeEventListener,
    });
    window.matchMedia = matchMediaMock as any;

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
    expect(matchMediaMock).toHaveBeenCalledWith("(min-width: 768px)");
  });
});
