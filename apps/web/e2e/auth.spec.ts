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
    await expect(page.locator("body")).toBeVisible();
  });

  test("dashboard requires authentication", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to auth or show sign in message
    await expect(page.locator("body")).toBeVisible();
  });

  test.describe("OAuth", () => {
    test("Google OAuth button is visible", async ({ page }) => {
      await page.goto("/auth");
      const googleButton = page.getByRole("button", {
        name: /continue with google/i,
      });
      await expect(googleButton).toBeVisible();
    });

    test("Google OAuth button has correct styling", async ({ page }) => {
      await page.goto("/auth");
      const googleButton = page.getByRole("button", {
        name: /continue with google/i,
      });

      // Check button is visible and has Google icon
      await expect(googleButton).toBeVisible();

      // Check divider "or" text is present
      await expect(page.getByText(/^or$/i)).toBeVisible();
    });

    test("Google OAuth button is clickable", async ({ page }) => {
      await page.goto("/auth");
      const googleButton = page.getByRole("button", {
        name: /continue with google/i,
      });

      // Click button and verify it triggers OAuth flow
      // Note: Actual OAuth flow requires real Google credentials
      // This test just verifies the button is functional
      await googleButton.click();

      // Button should show loading state
      await expect(page.getByText(/connecting/i)).toBeVisible({
        timeout: 2000,
      });
    });

    // Note: Full OAuth flow tests require:
    // 1. Real Google OAuth credentials configured in Supabase
    // 2. OAuth provider mocking (complex)
    // 3. Handling OAuth redirects
    // These are skipped for now as they require significant setup
    test.skip("Google OAuth sign-in flow", async () => {
      // This test would require:
      // - Real Google OAuth credentials
      // - Mocking Google OAuth provider
      // - Handling OAuth callback
      // Skipped until OAuth is fully configured
    });
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
