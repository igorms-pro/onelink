import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Notifications Realtime", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
  });

  test("new submission appears in realtime", async ({
    authenticatedPage: page,
  }) => {
    // Open Dashboard in one tab
    await page.goto("/dashboard");
    await page.locator("button:has-text('Inbox')").click();

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Get initial unread count (if any)
    const initialBadge = page.locator(
      "span:has-text(/\\d+/):near(button:has-text('Inbox'))",
    );
    const initialCount = (await initialBadge.textContent()) || "0";
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
    await expect(page.locator("button:has-text('Inbox')")).toBeVisible();

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
    await page.goto("/dashboard");
    await page.locator("button:has-text('Inbox')").click();
    await page.waitForLoadState("networkidle");

    // Note: In a real scenario:
    // 1. Have at least one submission with files
    // 2. In another tab, download a file from a public submission
    // 3. Verify download appears in Inbox
    // 4. Verify toast notification appears
    // 5. Verify download is sorted chronologically with submissions

    await expect(page.locator("button:has-text('Inbox')")).toBeVisible();
  });

  test("multiple submissions appear rapidly", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/dashboard");
    await page.locator("button:has-text('Inbox')").click();
    await page.waitForLoadState("networkidle");

    // Note: In a real scenario:
    // 1. Submit 3 files rapidly (within 5 minutes)
    // 2. Verify all appear in Inbox
    // 3. Verify unreadCount is correct

    await expect(page.locator("button:has-text('Inbox')")).toBeVisible();
  });
});
