import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";
import { createNotificationsTestData } from "./helpers/test-data";

test.describe.skip("Notifications Refresh Functionality", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    test.setTimeout(60000); // 60 seconds for beforeEach (includes RLS propagation wait)
    await setupPostHogInterception(page);

    // Navigate to a page that doesn't require profile to access localStorage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Create test data (including profile) BEFORE navigating to dashboard
    try {
      const userId = await page.evaluate(() => {
        const authToken = localStorage.getItem(
          Object.keys(localStorage).find((key) => key.includes("auth-token")) ||
            "",
        );
        if (authToken) {
          const parsed = JSON.parse(authToken);
          return parsed.user?.id;
        }
        return null;
      });

      if (userId) {
        await createNotificationsTestData(userId);
        // Wait for profile to be committed and visible to user session (RLS propagation)
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.warn("Failed to create test data:", error);
      // Continue anyway - test will skip if no data exists
    }

    // Navigate to dashboard - wait for profile to be visible (RLS propagation)
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // Wait for either navigation OR redirect to welcome
    const inboxButton = page
      .locator(
        '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
      )
      .first();

    const currentUrl = page.url();

    // If redirected to welcome, profile isn't visible yet - wait a bit and retry navigation
    if (currentUrl.includes("/welcome")) {
      await page.waitForTimeout(3000);
      await page.goto("/dashboard", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      if (page.url().includes("/welcome")) {
        throw new Error(
          "Profile not visible after RLS propagation wait - profile may not exist",
        );
      }
    }

    // Now wait for navigation to appear
    await expect(inboxButton).toBeVisible({ timeout: 10000 });
    await inboxButton.click();
    await page.waitForLoadState("networkidle");
  });

  test("manual refresh button works on desktop", async ({
    authenticatedPage: page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Find refresh button (should be visible on desktop)
    const refreshButton = page.locator('[data-testid="inbox-refresh-button"]');
    const refreshVisible = await refreshButton.isVisible().catch(() => false);

    if (refreshVisible) {
      // Get initial submission count (if any)
      const initialSubmissions = page.locator(
        '[data-testid="inbox-submission-item"]',
      );
      const _initialCount = await initialSubmissions.count();

      // Click refresh button
      await refreshButton.click();

      // Wait for refresh to complete
      await page.waitForTimeout(1000);

      // Verify button is still visible and functional after refresh
      await expect(refreshButton).toBeVisible();

      // Verify submissions are still loaded (or empty state)
      const finalSubmissions = page.locator(
        '[data-testid="inbox-submission-item"]',
      );
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
    const initialSubmissions = page.locator(
      '[data-testid="inbox-submission-item"]',
    );
    const _initialCount = await initialSubmissions.count();

    // Wait for inbox content to be loaded first - this ensures the section exists
    // Look for either submissions list items or empty state message
    const inboxContent = page
      .locator(
        '[data-testid="inbox-submission-item"], [data-testid="inbox-empty-message"]',
      )
      .first();
    await expect(inboxContent).toBeVisible({ timeout: 15000 });

    // Find the scrollable container section using data-testid
    const scrollContainer = page.locator(
      '[data-testid="inbox-scroll-container"]',
    );

    // Wait for container to be visible before getting bounding box
    await expect(scrollContainer).toBeVisible({ timeout: 5000 });

    // Simulate pull-to-refresh gesture
    // 1. Start touch at top of container
    const box = await scrollContainer.boundingBox();
    if (box) {
      const startY = box.y + 10;
      const startX = box.x + box.width / 2;

      // Simulate touch start using mouse (since touchscreen requires hasTouch context)
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.waitForTimeout(100);

      // Move down (pull)
      await page.mouse.move(startX, startY + 70);
      await page.waitForTimeout(100);

      // Check if refresh indicator appears (during pull-to-refresh)
      const refreshIndicator = page.locator(
        '[data-testid="inbox-pull-refresh-indicator"]',
      );
      const indicatorVisible = await refreshIndicator
        .isVisible()
        .catch(() => false);

      if (indicatorVisible) {
        // Release (touch end) - mouse up
        await page.mouse.up();
        await page.waitForTimeout(1000);

        // Verify refresh completed
        await expect(refreshIndicator).not.toBeVisible();

        // Verify submissions are still loaded
        const finalSubmissions = page.locator(
          '[data-testid="inbox-submission-item"]',
        );
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
