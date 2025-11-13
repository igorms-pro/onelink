import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollState } from "../useScrollState";

describe.skip("useScrollState", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    // Reset window dimensions
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("returns isScrollable as true when content is scrollable", () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState());

    expect(result.current.isScrollable).toBe(true);
  });

  it("returns isScrollable as false when content is not scrollable", () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useScrollState());

    expect(result.current.isScrollable).toBe(false);
  });

  it("returns isScrolling as false initially", () => {
    const { result } = renderHook(() => useScrollState());

    expect(result.current.isScrolling).toBe(false);
  });

  it("sets isScrolling to true when scrolling", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState());

    // Trigger scroll event
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Use fake timers to advance time immediately
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isScrolling).toBe(true);
  });

  it("sets isScrolling back to false after scroll delay", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState(150));

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it("uses custom scroll delay", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState(300));

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isScrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it("resets scroll timeout on subsequent scrolls", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState(150));

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isScrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(100);
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isScrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it("does not set isScrolling when content is not scrollable", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useScrollState());

    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it("updates isScrollable on window resize", async () => {
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { result } = renderHook(() => useScrollState());

    expect(result.current.isScrollable).toBe(true);

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 3000,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isScrollable).toBe(false);
  });

  it("cleans up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    Object.defineProperty(document.body, "scrollHeight", {
      writable: true,
      configurable: true,
      value: 2000,
    });

    const { unmount } = renderHook(() => useScrollState());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });
});
