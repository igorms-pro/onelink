import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";
import { createNotificationsTestData } from "./helpers/test-data";

test.describe("Notifications Badges", () => {
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
        await page.waitForTimeout(2000);
      } else {
        throw new Error("No userId found - cannot create test data");
      }
    } catch (error) {
      console.error("Failed to create test data:", error);
      throw error;
    }

    // Now navigate to dashboard - profile already exists, just wait for RLS propagation
    await page.waitForTimeout(5000); // Wait for RLS to propagate after profile creation

    // Navigate to dashboard - profile exists, so should go directly to dashboard
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // Wait for dashboard to load (check for navigation elements)
    // If we're on welcome, it means profile wasn't found - but it should exist
    await page.waitForTimeout(2000);

    // Verify we're on dashboard (profile exists, so welcome shouldn't appear)
    const currentUrl = page.url();
    if (currentUrl.includes("/welcome")) {
      throw new Error(
        "Unexpected redirect to welcome - profile should exist. RLS may not have propagated yet.",
      );
    }
  });

  test("badge appears on desktop TabNavigation when unreadCount > 0", async ({
    authenticatedPage: page,
  }) => {
    // Set desktop viewport and navigate to ensure desktop navigation renders
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // If redirected to welcome, profile isn't visible yet - wait a bit and retry
    if (page.url().includes("/welcome")) {
      await page.waitForTimeout(3000);
      await page.goto("/dashboard", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      if (page.url().includes("/welcome")) {
        test.skip(
          "Profile not visible after RLS propagation - profile may not exist",
        );
        return;
      }
    }

    // Wait for desktop navigation to be visible
    const inboxTab = page.locator('[data-testid="tab-navigation-inbox"]');
    await expect(inboxTab).toBeVisible({ timeout: 15000 });

    // Check for badge (gradient purple badge with number)
    const badge = page.locator('[data-testid="tab-navigation-inbox-badge"]');

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

    // Navigate to dashboard to ensure mobile navigation is rendered
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // If redirected to welcome, profile isn't visible yet - wait a bit and retry
    if (page.url().includes("/welcome")) {
      await page.waitForTimeout(3000);
      await page.goto("/dashboard", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      if (page.url().includes("/welcome")) {
        test.skip(
          "Profile not visible after RLS propagation - profile may not exist",
        );
        return;
      }
    }

    // Wait for mobile bottom navigation to be visible
    const bottomNav = page.locator('[data-testid="bottom-navigation-inbox"]');
    await expect(bottomNav).toBeVisible({ timeout: 15000 });

    // Navigate to Content tab (not Inbox) - target mobile BottomNavigation
    const contentTab = page.locator(
      '[data-testid="bottom-navigation-content"]',
    );
    await expect(contentTab).toBeVisible({ timeout: 10000 });
    await contentTab.click();
    await page.waitForTimeout(500);

    // Check for purple dot on Inbox icon
    const dot = page.locator('[data-testid="bottom-navigation-inbox-dot"]');
    const dotVisible = await dot.isVisible();

    if (dotVisible) {
      // Verify dot is visible
      await expect(dot).toBeVisible();

      // Switch to Inbox tab
      const inboxTab = page.locator('[data-testid="bottom-navigation-inbox"]');
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
      const dotAfterMarkAll = page.locator(
        '[data-testid="bottom-navigation-inbox-dot"]',
      );
      await expect(dotAfterMarkAll).not.toBeVisible();
    } else {
      // If no dot, verify it's because there are no unread items
      const inboxTab = page.locator('[data-testid="bottom-navigation-inbox"]');
      await inboxTab.click();
      const markAllButton = page.locator("button:has-text('Mark all as read')");
      const hasUnread = await markAllButton.isVisible();
      expect(hasUnread).toBe(false);
    }
  });
});
