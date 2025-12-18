import type { Page } from "@playwright/test";

/**
 * Intercept PostHog API requests in e2e tests
 * This prevents real events from being sent to PostHog during testing
 * and avoids potential timeouts or network issues
 */
export async function interceptPostHogRequests(page: Page): Promise<void> {
  // Intercept PostHog batch API requests
  // PostHog sends events to /batch/ endpoint
  await page.route("**/batch/**", async (route) => {
    // Mock successful response to prevent errors
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Intercept PostHog capture API requests (alternative endpoint)
  await page.route("**/capture/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Intercept PostHog decide API requests (feature flags)
  await page.route("**/decide/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ config: {}, featureFlags: {} }),
    });
  });
}

/**
 * Setup PostHog interception for a test
 * Call this in beforeEach or at the start of tests that need PostHog mocked
 */
export async function setupPostHogInterception(page: Page): Promise<void> {
  await interceptPostHogRequests(page);
}
