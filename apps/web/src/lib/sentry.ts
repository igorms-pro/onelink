import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * This should be called as early as possible in the application lifecycle
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment =
    import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    import.meta.env.MODE ||
    "development";

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn("[Sentry] DSN not provided, Sentry will not be initialized");
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Integrations - Capture ALL errors automatically
    integrations: [
      Sentry.browserTracingIntegration(), // Enable browser tracing for performance monitoring
      Sentry.replayIntegration({
        // Session Replay configuration
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
      Sentry.globalHandlersIntegration({
        onerror: true, // Capture unhandled errors
        onunhandledrejection: true, // Capture unhandled promise rejections
      }),
    ],

    // Capture ALL errors (not just some)
    ignoreErrors: [
      // Ignore common browser extensions errors
      /ResizeObserver loop limit exceeded/,
      /Non-Error promise rejection captured/,
    ],

    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.supabase\.co/, // Supabase API
      /^https:\/\/.*\.vercel\.app/, // Vercel preview deployments
    ],

    // Session Replay
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    replaysOnErrorSampleRate: 1.0, // Always capture replays on errors

    // Privacy settings
    sendDefaultPii: false, // Don't send PII by default (IP addresses, etc.)

    // Release tracking (useful for debugging)
    release: import.meta.env.VITE_APP_VERSION || undefined,

    // Before send hook - filter sensitive data and add context
    beforeSend(event, hint) {
      void hint; // hint parameter is required by Sentry API but not used
      // Filter out sensitive data from error messages
      if (event.request?.headers) {
        // Remove sensitive headers
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }

      // Filter out sensitive data from user context
      if (event.user) {
        // Keep user ID but remove email if present
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, ...userWithoutEmail } = event.user;
        event.user = userWithoutEmail;
      }

      // Add useful context
      if (typeof window !== "undefined") {
        event.extra = {
          ...event.extra,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };
      }

      return event;
    },
  });

  // Sentry initialized silently
}
