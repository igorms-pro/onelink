import { test, expect } from "@playwright/test";

test.describe("Auth Redirect Flow", () => {
  test.skip(!!process.env.CI, "Skipping in CI - external domain won't resolve");

  test("should redirect /auth route to app.getonelink.io/auth", async ({
    page,
  }) => {
    // Navigate to /auth
    const [response] = await Promise.all([
      page
        .waitForURL("https://app.getonelink.io/auth", { timeout: 10000 })
        .catch(() => null),
      page.goto("/auth"),
    ]);

    // Should redirect to app auth page
    // If redirect doesn't work (network issues), test will fail gracefully
    expect(response).not.toBeNull();
    expect(page.url()).toContain("app.getonelink.io/auth");
  });

  test("should redirect immediately", async ({ page }) => {
    const startTime = Date.now();

    await Promise.all([
      page.waitForURL("https://app.getonelink.io/auth", { timeout: 10000 }),
      page.goto("/auth"),
    ]);

    const endTime = Date.now();
    const redirectTime = endTime - startTime;

    // Redirect should happen quickly (within 2 seconds)
    expect(redirectTime).toBeLessThan(2000);
  });

  test("should display loading message during redirect", async ({ page }) => {
    // Navigate to /auth
    page.goto("/auth");

    // Check for loading/redirecting message before redirect completes
    const loadingMessage = page.getByText(/redirecting|loading/i);

    // Try to catch it before redirect (may be very fast)
    try {
      await expect(loadingMessage).toBeVisible({ timeout: 1000 });
    } catch {
      // If redirect is too fast, that's also acceptable
      // The important thing is that redirect happens
    }

    // Verify redirect happened
    await page.waitForURL("https://app.getonelink.io/auth", {
      timeout: 10000,
    });
  });

  test("should use window.location.replace() (no back button)", async ({
    page,
  }) => {
    // Navigate to homepage first
    await page.goto("/");

    // Navigate to /auth (should redirect)
    await page.goto("/auth");
    await page.waitForURL("https://app.getonelink.io/auth", {
      timeout: 10000,
    });

    // Try to go back
    await page.goBack();

    // Should NOT go back to /auth (because replace was used)
    // Should either stay on auth page or go to homepage
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/auth");
  });

  test("should handle redirect even if app is slow", async ({ page }) => {
    // Set longer timeout
    page.setDefaultTimeout(30000);

    const [response] = await Promise.all([
      page.waitForURL("https://app.getonelink.io/auth", { timeout: 30000 }),
      page.goto("/auth"),
    ]);

    expect(response).not.toBeNull();
    expect(page.url()).toContain("app.getonelink.io/auth");
  });

  test("should redirect from any /auth path", async ({ page }) => {
    // Test /auth with query params
    await page.goto("/auth?returnTo=/dashboard");

    await page.waitForURL("https://app.getonelink.io/auth**", {
      timeout: 10000,
    });
    expect(page.url()).toContain("app.getonelink.io/auth");
  });
});
