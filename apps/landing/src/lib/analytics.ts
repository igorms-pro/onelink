import posthog from "posthog-js";

type PostHogPropertyValue = string | number | boolean | null | undefined;
type PostHogProperties = Record<
  string,
  PostHogPropertyValue | PostHogPropertyValue[]
>;

/**
 * Initialize PostHog for landing page analytics
 * Tracks conversion events: sign up clicks, pricing views, CTA clicks
 */
export function initAnalytics() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

  // Only initialize PostHog if API key is provided
  if (!apiKey) {
    console.warn(
      "[Analytics] ⚠️ PostHog API key not provided, analytics will not be initialized",
    );
    console.warn("[Analytics] Set VITE_POSTHOG_KEY in your .env.local file");
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // Manual event tracking only
    respect_dnt: true,
    disable_session_recording: true,
    mask_all_text: true,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: PostHogProperties) {
  if (!posthog.__loaded) {
    console.warn(
      "[Analytics] PostHog not initialized, event not tracked:",
      eventName,
    );
    return;
  }

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Track sign up button click
 */
export function trackSignUpClick(source: string) {
  trackEvent("sign_up_button_clicked", {
    source, // e.g., "hero", "cta_section", "pricing"
    page: window.location.pathname,
  });
}

/**
 * Track pricing page view
 */
export function trackPricingView() {
  trackEvent("pricing_page_viewed", {
    page: window.location.pathname,
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaType: string, location: string) {
  trackEvent("cta_clicked", {
    cta_type: ctaType, // e.g., "get_started", "view_demo", "upgrade"
    location, // e.g., "hero", "features", "pricing"
    page: window.location.pathname,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number) {
  trackEvent("scroll_depth", {
    depth,
    page: window.location.pathname,
  });
}

/**
 * Track username entered (when user starts typing in username field)
 * This helps measure engagement and abandonment rate
 */
export function trackUsernameEntered(source: string, usernameLength: number) {
  trackEvent("username_entered", {
    source, // e.g., "hero", "cta_section"
    username_length: usernameLength,
    page: window.location.pathname,
  });
}
