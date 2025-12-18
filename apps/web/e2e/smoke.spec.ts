import { test, expect } from "@playwright/test";
import { setupPostHogInterception } from "./helpers/posthog";

test("app loads", async ({ page }) => {
  // Intercept PostHog requests to avoid real API calls during tests
  await setupPostHogInterception(page);

  await page.goto("/");
  expect(true).toBeTruthy();
});
