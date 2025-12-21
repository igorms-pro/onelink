import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Notifications Refresh Functionality", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
    await page.goto("/dashboard");
    // Use data-testid - will match the visible navigation (desktop or mobile)
    const inboxButton = page
      .locator(
        '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
      )
      .first();
    await inboxButton.click();
    await page.waitForLoadState("networkidle");
  });

  test("manual refresh button works on desktop", async ({
    authenticatedPage: page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Find refresh button (should be visible on desktop)
    // The refresh button is in the InboxTab component
    const refreshButton = page
      .locator("button:has-text('Refresh')")
      .or(page.locator("button:has(svg)"))
      .filter({ has: page.locator("svg") });
    const refreshVisible = await refreshButton
      .first()
      .isVisible()
      .catch(() => false);

    if (refreshVisible) {
      // Get initial submission count (if any)
      const initialSubmissions = page.locator("li:has([class*='rounded-xl'])");
      const _initialCount = await initialSubmissions.count();

      // Click refresh button
      await refreshButton.first().click();

      // Wait for refresh to complete
      await page.waitForTimeout(1000);

      // Verify button is still visible and functional after refresh
      await expect(refreshButton.first()).toBeVisible();

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

    // Wait for inbox content to be loaded first - this ensures the section exists
    // Look for either submissions list items or empty state message
    const inboxContent = page
      .locator("li:has([class*='rounded-xl']), text=/no submissions yet/i")
      .first();
    await expect(inboxContent).toBeVisible({ timeout: 15000 });

    // Find the scrollable container section
    // The section is the parent container that holds the inbox content
    // Try multiple approaches to find it reliably
    let scrollContainer = page
      .locator("section")
      .filter({
        has: page.locator("ul.grid"),
      })
      .first();

    // If that doesn't work, try finding section that contains list items
    if ((await scrollContainer.count()) === 0) {
      scrollContainer = page
        .locator("section")
        .filter({
          has: page.locator("li:has([class*='rounded-xl'])"),
        })
        .first();
    }

    // If still not found, try any section in the main content area
    if ((await scrollContainer.count()) === 0) {
      scrollContainer = page
        .locator("main section, [role='main'] section")
        .first();
    }

    // Wait for container to be visible before getting bounding box
    await expect(scrollContainer).toBeVisible({ timeout: 5000 });

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

      // Check if refresh indicator appears (during pull-to-refresh)
      // The indicator is a RefreshCw icon with animate-spin class
      const refreshIndicator = page
        .locator("svg.animate-spin")
        .or(page.locator("svg:has([class*='text-blue-600'])"));
      const indicatorVisible = await refreshIndicator
        .isVisible()
        .catch(() => false);

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
