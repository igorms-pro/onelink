import posthog from "posthog-js";

// Type for PostHog event properties (JSON-serializable values)
type PostHogPropertyValue = string | number | boolean | null | undefined;
type PostHogProperties = Record<
  string,
  PostHogPropertyValue | PostHogPropertyValue[]
>;

// Event queue for events fired before PostHog is loaded
type QueuedEvent = {
  eventName: string;
  properties?: PostHogProperties;
  timestamp: number;
};

let eventQueue: QueuedEvent[] = [];
const MAX_QUEUE_SIZE = 50; // Prevent memory issues

/**
 * Initialize PostHog for product analytics and user behavior tracking
 * This should be called as early as possible in the application lifecycle
 */
export function initPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
  const environment =
    import.meta.env.VITE_POSTHOG_ENVIRONMENT ||
    import.meta.env.VITE_SENTRY_ENVIRONMENT ||
    import.meta.env.MODE ||
    "development";

  // Only initialize PostHog if API key is provided
  if (!apiKey) {
    console.warn(
      "[PostHog] ⚠️ API key not provided, PostHog will not be initialized",
    );
    console.warn("[PostHog] Set VITE_POSTHOG_KEY in your .env.local file");
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    // Privacy settings
    capture_pageview: true, // Automatically capture pageviews
    capture_pageleave: true, // Capture when users leave pages
    loaded: (posthogInstance) => {
      // Send a test event to verify installation
      posthogInstance.capture("posthog_initialized", {
        environment,
        timestamp: new Date().toISOString(),
      });

      // Flush queued events
      flushEventQueue(posthogInstance);

      // Handle pending user identification
      if (typeof window !== "undefined" && window.__posthogPendingIdentify) {
        const pending = window.__posthogPendingIdentify;
        posthogInstance.identify(pending.userId, pending.properties);
        delete window.__posthogPendingIdentify;
      }
    },
    // Disable autocapture for privacy (we'll use manual event tracking)
    autocapture: false,
    // Respect Do Not Track
    respect_dnt: true,
    // Disable session recording by default (can be enabled per user consent)
    disable_session_recording: true,
    // Mask text for privacy (if session recording is enabled)
    mask_all_text: true,
  });
}

/**
 * Identify a user in PostHog
 * Call this when a user signs in or signs up
 * If PostHog is not loaded, we'll identify when it loads
 */
export function identifyUser(userId: string, properties?: PostHogProperties) {
  if (posthog.__loaded) {
    try {
      posthog.identify(userId, {
        ...properties,
        // Don't send email as a property (privacy)
        // Only send non-PII data
      });
    } catch (error) {
      console.error("[PostHog] Error identifying user:", error);
    }
  } else {
    // Queue identification for when PostHog loads
    // Store in a way that we can call identify when ready
    if (typeof window !== "undefined") {
      window.__posthogPendingIdentify = { userId, properties };
    }
  }
}

/**
 * Reset user identification (call on sign out)
 */
export function resetUser() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

/**
 * Flush queued events to PostHog
 */
function flushEventQueue(posthogInstance: typeof posthog) {
  if (eventQueue.length === 0) return;

  // Send all queued events
  eventQueue.forEach((queued) => {
    try {
      posthogInstance.capture(queued.eventName, {
        ...queued.properties,
        _queued: true, // Mark as queued event
        _queued_at: new Date(queued.timestamp).toISOString(),
      });
    } catch (error) {
      console.error("[PostHog] Error flushing queued event:", error);
    }
  });

  // Clear queue
  eventQueue = [];
}

/**
 * Track a custom event
 * Events are queued if PostHog is not yet loaded, then flushed when ready
 */
export function trackEvent(eventName: string, properties?: PostHogProperties) {
  if (posthog.__loaded) {
    // PostHog is ready, send immediately
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.error("[PostHog] Error tracking event:", error);
    }
  } else {
    // PostHog not loaded yet, queue the event
    if (eventQueue.length < MAX_QUEUE_SIZE) {
      eventQueue.push({
        eventName,
        properties,
        timestamp: Date.now(),
      });
    } else {
      console.warn("[PostHog] Event queue full, dropping event:", eventName);
    }
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: PostHogProperties) {
  if (!posthog.__loaded) return;
  posthog.setPersonProperties(properties);
}

/**
 * Check if PostHog is loaded
 */
export function isPostHogLoaded(): boolean {
  return posthog.__loaded || false;
}

/**
 * Debug helper: Log PostHog status to console (only in dev)
 */
export function debugPostHog() {
  if (!import.meta.env.DEV) return;

  if (posthog.__loaded) {
    console.log("[PostHog] Ready to track events");
  } else {
    console.warn("[PostHog] Not loaded. Check your API key.");
  }
}

// Extend Window interface for development test function and pending identify
declare global {
  interface Window {
    posthogTest?: () => void;
    __posthogPendingIdentify?: {
      userId: string;
      properties?: PostHogProperties;
    };
  }
}

// Expose test function to window in development
if (import.meta.env.DEV && typeof window !== "undefined") {
  window.posthogTest = () => {
    if (posthog.__loaded) {
      trackEvent("test_event", {
        timestamp: new Date().toISOString(),
        source: "manual_test",
      });
    } else {
      console.error("[PostHog] Not loaded. Check your API key.");
    }
  };
}
