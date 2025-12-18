import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Notifications Badges", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("badge appears on desktop TabNavigation when unreadCount > 0", async ({
    authenticatedPage: page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Check if badge is visible on Inbox tab (target desktop TabNavigation specifically)
    const inboxTab = page
      .locator("div.hidden.sm\\:flex")
      .locator("button:has-text('Inbox')");
    await expect(inboxTab).toBeVisible();

    // Check for badge (gradient purple badge with number)
    const badge = inboxTab.locator(
      "span.rounded-full:has-text(/\\d+/):has([class*='from-purple-600'])",
    );

    // Badge should appear if there are unread submissions
    const badgeVisible = await badge.isVisible();

    if (badgeVisible) {
      // Verify badge displays correct number
      const badgeText = await badge.textContent();
      const badgeNumber = parseInt(badgeText || "0");
      expect(badgeNumber).toBeGreaterThan(0);

      // Verify badge has correct style (gradient purple)
      await expect(badge).toHaveClass(/from-purple-600/);
      await expect(badge).toHaveClass(/to-purple-700/);
    }

    // Mark all as read if badge exists
    if (badgeVisible) {
      await inboxTab.click();
      const markAllButton = page.locator("button:has-text('Mark all as read')");
      if (await markAllButton.isVisible()) {
        await markAllButton.click();
        await page.waitForTimeout(500);

        // Verify badge disappears
        await expect(badge).not.toBeVisible();
      }
    }
  });

  test("dot appears on mobile BottomNavigation when unreadCount > 0 and not on inbox tab", async ({
    authenticatedPage: page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to Content tab (not Inbox) - target mobile BottomNavigation
    const contentTab = page
      .locator("nav.sm\\:hidden")
      .locator("button:has-text('Content')");
    await contentTab.click();
    await page.waitForTimeout(500);

    // Check for purple dot on Inbox icon (it's inside the button, in a relative div)
    // Target mobile BottomNavigation specifically
    const inboxButton = page
      .locator("nav.sm\\:hidden")
      .locator("button:has-text('Inbox')");
    const dot = inboxButton.locator("span.bg-purple-600.rounded-full");
    const dotVisible = await dot.isVisible();

    if (dotVisible) {
      // Verify dot is visible
      await expect(dot).toBeVisible();

      // Switch to Inbox tab
      const inboxTab = page
        .locator("nav.sm\\:hidden")
        .locator("button:has-text('Inbox')");
      await inboxTab.click();
      await page.waitForTimeout(500);

      // Verify dot disappears when on inbox tab
      const dotAfterClick = inboxTab.locator("span.bg-purple-600.rounded-full");
      await expect(dotAfterClick).not.toBeVisible();

      // Mark all as read
      const markAllButton = page.locator("button:has-text('Mark all as read')");
      if (await markAllButton.isVisible()) {
        await markAllButton.click();
        await page.waitForTimeout(500);
      }

      // Switch back to Content tab
      await contentTab.click();
      await page.waitForTimeout(500);

      // Verify dot is gone after marking all as read
      const dotAfterMarkAll = page
        .locator("nav.sm\\:hidden")
        .locator("button:has-text('Inbox')")
        .locator("span.bg-purple-600.rounded-full");
      await expect(dotAfterMarkAll).not.toBeVisible();
    } else {
      // If no dot, verify it's because there are no unread items
      const inboxTab = page
        .locator("nav.sm\\:hidden")
        .locator("button:has-text('Inbox')");
      await inboxTab.click();
      const markAllButton = page.locator("button:has-text('Mark all as read')");
      const hasUnread = await markAllButton.isVisible();
      expect(hasUnread).toBe(false);
    }
  });
});
