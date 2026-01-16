import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initSentry } from "../sentry";
import * as Sentry from "@sentry/react";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
  globalHandlersIntegration: vi.fn(() => ({})),
  withErrorBoundary: vi.fn((component, _options) => component),
}));

describe("initSentry", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset import.meta.env to original state
    Object.keys(import.meta.env).forEach((key) => {
      delete (import.meta.env as any)[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not initialize Sentry when DSN is not provided", () => {
    delete (import.meta.env as any).VITE_SENTRY_DSN;
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    initSentry();

    expect(Sentry.init).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Sentry] DSN not provided, Sentry will not be initialized",
    );

    consoleSpy.mockRestore();
  });

  it("should initialize Sentry with DSN and default environment", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    delete (import.meta.env as any).VITE_SENTRY_ENVIRONMENT;
    delete (import.meta.env as any).MODE;

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://test@sentry.io/123",
        environment: "development",
        sendDefaultPii: false,
        tracesSampleRate: 1.0, // 100% in dev
        replaysSessionSampleRate: 1.0, // 100% in dev
        replaysOnErrorSampleRate: 1.0,
      }),
    );
  });

  it("should use VITE_SENTRY_ENVIRONMENT when provided", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    (import.meta.env as any).VITE_SENTRY_ENVIRONMENT = "staging";

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: "staging",
      }),
    );
  });

  it("should fallback to MODE when VITE_SENTRY_ENVIRONMENT is not provided", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    delete (import.meta.env as any).VITE_SENTRY_ENVIRONMENT;
    (import.meta.env as any).MODE = "production";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: "production",
      }),
    );

    consoleSpy.mockRestore();
  });

  it("should use production sample rates when environment is production", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    (import.meta.env as any).VITE_SENTRY_ENVIRONMENT = "production";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 0.1, // 10% in prod
        replaysSessionSampleRate: 0.1, // 10% in prod
      }),
    );

    consoleSpy.mockRestore();
  });

  it("should include browserTracingIntegration, replayIntegration, and globalHandlersIntegration", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";

    initSentry();

    expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
    expect(Sentry.replayIntegration).toHaveBeenCalledWith({
      maskAllText: true,
      blockAllMedia: true,
    });
    expect(Sentry.globalHandlersIntegration).toHaveBeenCalledWith({
      onerror: true,
      onunhandledrejection: true,
    });
  });

  it("should configure tracePropagationTargets correctly", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";

    initSentry();

    const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
    expect(initCall.tracePropagationTargets).toEqual([
      "localhost",
      /^https:\/\/.*\.supabase\.co/,
      /^https:\/\/.*\.vercel\.app/,
    ]);
  });

  it("should set release from VITE_APP_VERSION when provided", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    (import.meta.env as any).VITE_APP_VERSION = "1.2.3";

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        release: "1.2.3",
      }),
    );
  });

  it("should set release to undefined when VITE_APP_VERSION is not provided", () => {
    (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    delete (import.meta.env as any).VITE_APP_VERSION;

    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        release: undefined,
      }),
    );
  });

  describe("beforeSend hook", () => {
    beforeEach(() => {
      (import.meta.env as any).VITE_SENTRY_DSN = "https://test@sentry.io/123";
    });

    it("should filter out sensitive headers", () => {
      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        request: {
          headers: {
            authorization: "Bearer token123",
            cookie: "session=abc123",
            "content-type": "application/json",
          },
        },
        extra: {},
      };

      const result = beforeSend!(event as any, {} as any) as any;

      expect(result?.request?.headers?.authorization).toBeUndefined();
      expect(result?.request?.headers?.cookie).toBeUndefined();
      expect(result?.request?.headers?.["content-type"]).toBe(
        "application/json",
      );
    });

    it("should remove email from user context but keep user ID", () => {
      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        user: {
          id: "user-123",
          email: "user@example.com",
          username: "testuser",
        },
      };

      const result = beforeSend!(event as any, {} as any) as any;

      expect(result?.user?.id).toBe("user-123");
      expect(result?.user?.username).toBe("testuser");
      expect(result?.user?.email).toBeUndefined();
    });

    it("should handle events without user context", () => {
      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        message: "Test error",
      };

      const result = beforeSend!(event as any, {} as any) as any;

      expect(result).toEqual(event);
    });

    it("should handle events without request headers", () => {
      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        message: "Test error",
      };

      const result = beforeSend!(event as any, {} as any) as any;

      expect(result).toEqual(event);
    });

    it("should return the event after filtering", () => {
      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        message: "Test error",
        level: "error",
        request: {
          headers: {
            authorization: "Bearer token",
          },
        },
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      };

      const result = beforeSend!(event as any, {} as any) as any;

      expect(result).toBeDefined();
      expect(result?.message).toBe("Test error");
      expect(result?.level).toBe("error");
    });
  });
});
