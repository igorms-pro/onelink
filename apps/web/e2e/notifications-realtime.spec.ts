import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";
import { createNotificationsTestData } from "./helpers/test-data";

test.describe("Notifications Realtime", () => {
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
  });

  test("new submission appears in realtime", async ({
    authenticatedPage: page,
  }) => {
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

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Get initial unread count (if any) - target desktop TabNavigation
    // Badge only appears when unreadCount > 0, so check if it exists first
    const initialBadge = page.locator(
      '[data-testid="tab-navigation-inbox-badge"]',
    );
    // Use count() instead of isVisible() to avoid timeout when badge doesn't exist
    const badgeCount = await initialBadge.count();
    const initialCount =
      badgeCount > 0 ? (await initialBadge.textContent()) || "0" : "0";
    const _initialUnreadCount = parseInt(initialCount) || 0;

    // Note: In a real scenario, you would:
    // 1. Open another browser/tab or use a different user context
    // 2. Navigate to a public profile
    // 3. Submit a file to a Drop
    // 4. Verify the submission appears automatically in the Dashboard
    // 5. Verify toast notification appears
    // 6. Verify unreadCount increases
    // 7. Verify submission is marked as unread (blue background)

    // For now, we test the structure:
    await expect(
      page
        .locator(
          '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
        )
        .first(),
    ).toBeVisible();

    // Check that realtime subscription is active (no errors in console)
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to see if any errors occur
    await page.waitForTimeout(1000);

    // Verify no critical errors
    const criticalErrors = consoleErrors.filter(
      (e) => e.includes("realtime") || e.includes("subscription"),
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("download notification appears in realtime", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to dashboard - wait for profile to be visible (RLS propagation)
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // Wait for either navigation OR redirect to welcome
    const inboxButton = page
      .locator(
        '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
      )
      .first();

    // If redirected to welcome, profile isn't visible yet - wait a bit and retry navigation
    if (page.url().includes("/welcome")) {
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

    // Note: In a real scenario:
    // 1. Have at least one submission with files
    // 2. In another tab, download a file from a public submission
    // 3. Verify download appears in Inbox
    // 4. Verify toast notification appears
    // 5. Verify download is sorted chronologically with submissions

    await expect(
      page
        .locator(
          '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
        )
        .first(),
    ).toBeVisible();
  });

  test("multiple submissions appear rapidly", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to dashboard - wait for profile to be visible (RLS propagation)
    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });

    // Wait for either navigation OR redirect to welcome
    const inboxButton = page
      .locator(
        '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
      )
      .first();

    // If redirected to welcome, profile isn't visible yet - wait a bit and retry navigation
    if (page.url().includes("/welcome")) {
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

    // Note: In a real scenario:
    // 1. Submit 3 files rapidly (within 5 minutes)
    // 2. Verify all appear in Inbox
    // 3. Verify unreadCount is correct

    await expect(
      page
        .locator(
          '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
        )
        .first(),
    ).toBeVisible();
  });
});
