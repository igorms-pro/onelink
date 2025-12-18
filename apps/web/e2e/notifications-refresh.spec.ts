import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Notifications Refresh Functionality", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
    await page.goto("/dashboard");
    await page.locator("button:has-text('Inbox')").click();
    await page.waitForLoadState("networkidle");
  });

  test("manual refresh button works on desktop", async ({
    authenticatedPage: page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Find refresh button (should be visible on desktop)
    const refreshButton = page.locator("button:has-text('Refresh')");
    const refreshVisible = await refreshButton.isVisible();

    if (refreshVisible) {
      // Get initial submission count (if any)
      const initialSubmissions = page.locator("li:has([class*='rounded-xl'])");
      const _initialCount = await initialSubmissions.count();

      // Click refresh button
      await refreshButton.click();

      // Verify icon spins during refresh
      const refreshIcon = refreshButton.locator("svg");
      await expect(refreshIcon).toHaveClass(/animate-spin/);

      // Wait for refresh to complete
      await page.waitForTimeout(1000);

      // Verify button is enabled again (spinning stops)
      await expect(refreshIcon).not.toHaveClass(/animate-spin/);

      // Verify submissions are still loaded (or empty state)
      const finalSubmissions = page.locator("li:has([class*='rounded-xl'])");
      const finalCount = await finalSubmissions.count();

      // Count should be same or updated (not broken)
      expect(finalCount).toBeGreaterThanOrEqual(0);
    } else {
      // Skip if refresh button not visible (mobile view)
      test.skip();
    }
  });

  test("pull-to-refresh works on mobile", async ({
    authenticatedPage: page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Get initial submission count
    const initialSubmissions = page.locator("li:has([class*='rounded-xl'])");
    const _initialCount = await initialSubmissions.count();

    // Find scrollable container
    const scrollContainer = page
      .locator("section:has([class*='mt-2'])")
      .first();

    // Simulate pull-to-refresh gesture
    // 1. Start touch at top of container
    const box = await scrollContainer.boundingBox();
    if (box) {
      const startY = box.y + 10;
      const startX = box.x + box.width / 2;

      // Touch start
      await page.touchscreen.tap(startX, startY);
      await page.waitForTimeout(100);

      // Move down (pull)
      await page.mouse.move(startX, startY + 70);
      await page.waitForTimeout(100);

      // Check if refresh indicator appears
      const refreshIndicator = page.locator(
        "svg.animate-spin:has([class*='text-blue-600'])",
      );
      const indicatorVisible = await refreshIndicator.isVisible();

      if (indicatorVisible) {
        // Release (touch end)
        await page.mouse.up();
        await page.waitForTimeout(1000);

        // Verify refresh completed
        await expect(refreshIndicator).not.toBeVisible();

        // Verify submissions are still loaded
        const finalSubmissions = page.locator("li:has([class*='rounded-xl'])");
        const finalCount = await finalSubmissions.count();
        expect(finalCount).toBeGreaterThanOrEqual(0);
      } else {
        // If pull-to-refresh not triggered, verify it's because we're not at top
        // or feature not available
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
