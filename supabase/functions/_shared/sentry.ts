/**
 * Sentry configuration for Supabase Edge Functions (Deno)
 * 
 * Usage:
 *   import { initSentry } from "../_shared/sentry.ts";
 *   await initSentry(); // Call once at the start of your function
 */

let sentryInitialized = false;
let sentryInitPromise: Promise<void> | null = null;

export async function initSentry() {
  // Only initialize once
  if (sentryInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (sentryInitPromise) {
    await sentryInitPromise;
    return;
  }

  sentryInitPromise = (async () => {
  const dsn = Deno.env.get("SENTRY_DSN");
  const environment = Deno.env.get("SENTRY_ENVIRONMENT") || Deno.env.get("ENVIRONMENT") || "development";

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn("[Sentry] DSN not provided, Sentry will not be initialized");
    return;
  }

  try {
    // Dynamic import for Sentry Deno SDK
    const Sentry = await import("npm:@sentry/deno@^10.31.0");

    Sentry.init({
      dsn,
      environment,
      
      // Performance Monitoring
      tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

      // Privacy settings
      sendDefaultPii: false, // Don't send PII by default

      // Release tracking
      release: Deno.env.get("SENTRY_RELEASE") || undefined,

      // Before send hook - filter sensitive data
      beforeSend(event, hint) {
        // Filter out sensitive data from error messages
        if (event.request?.headers) {
          // Remove sensitive headers
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
          delete event.request.headers["apikey"];
        }

        // Filter out sensitive data from user context
        if (event.user) {
          // Keep user ID but remove email if present
          const { email, ...userWithoutEmail } = event.user;
          event.user = userWithoutEmail;
        }

        return event;
      },
    });

    console.log(`[Sentry] Initialized in ${environment} environment`);
    sentryInitialized = true;
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
  }
  })();

  await sentryInitPromise;
}

/**
 * Wrap an Edge Function handler with Sentry error tracking
 */
export function withSentry<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
): T {
  return (async (...args: Parameters<T>) => {
    await initSentry();
    
    try {
      return await handler(...args);
    } catch (error) {
      // Sentry will automatically capture the error
      throw error;
    }
  }) as T;
}

