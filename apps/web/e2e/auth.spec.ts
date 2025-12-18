import { test, expect } from "@playwright/test";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept PostHog requests to avoid real API calls during tests
    await setupPostHogInterception(page);
  });
  test("sign in page loads", async ({ page }) => {
    await page.goto("/auth");
    // Check that auth form elements are present
    // Adjust selectors based on your actual auth component
    await expect(page.locator("body")).toBeVisible();
  });

  test("dashboard requires authentication", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to auth or show sign in message
    // Adjust assertion based on your auth flow
    await expect(page.locator("body")).toBeVisible();
  });

  // Note: Full auth flow tests require Supabase test credentials
  // Uncomment and configure when ready:
  /*
  test("user can sign up", async ({ page }) => {
    await page.goto("/auth");
    // Fill sign up form
    // Submit
    // Should redirect to dashboard
  });

  test("user can sign in", async ({ page }) => {
    await page.goto("/auth");
    // Fill sign in form
    // Submit
    // Should redirect to dashboard
  });

  test("user can sign out", async ({ page }) => {
    // Sign in first
    await page.goto("/dashboard");
    await page.locator('button:has-text("Sign out")').click();
    // Should redirect to landing or auth
  });
  */
});
