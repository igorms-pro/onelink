import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Notifications Read/Unread Functionality", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
    await page.goto("/dashboard");
    await page.locator("button:has-text('Inbox')").click();
    await page.waitForLoadState("networkidle");
  });

  test("mark as read individual submission", async ({
    authenticatedPage: page,
  }) => {
    // Check if there are any unread submissions
    const unreadSubmissions = page.locator(
      "li:has([class*='bg-blue-50']):has-text('Mark read')",
    );

    const hasUnread = (await unreadSubmissions.count()) > 0;

    if (hasUnread) {
      // Get first unread submission
      const firstUnread = unreadSubmissions.first();

      // Get initial unread count from badge
      const badge = page.locator(
        "span:has-text(/\\d+/):near(button:has-text('Inbox'))",
      );
      const initialCountText = (await badge.textContent()) || "0";
      const initialCount = parseInt(initialCountText) || 0;

      // Click "Mark read" button
      const markReadButton = firstUnread.locator(
        "button:has-text('Mark read')",
      );
      await markReadButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify submission changes to gray (read)
      await expect(firstUnread).toHaveClass(/bg-gray-50/);

      // Verify blue dot disappears
      const blueDot = firstUnread.locator(".bg-blue-600");
      await expect(blueDot).not.toBeVisible();

      // Verify badge count decreases (if badge was visible)
      if (initialCount > 0) {
        const newBadge = page.locator(
          "span:has-text(/\\d+/):near(button:has-text('Inbox'))",
        );
        const newCountText = (await newBadge.textContent()) || "0";
        const newCount = parseInt(newCountText) || 0;
        expect(newCount).toBeLessThan(initialCount);
      }

      // Verify "Mark read" button disappears
      await expect(markReadButton).not.toBeVisible();
    } else {
      // Skip test if no unread submissions
      test.skip();
    }
  });

  test("mark all as read", async ({ authenticatedPage: page }) => {
    // Check if "Mark all as read" button is visible
    const markAllButton = page.locator("button:has-text('Mark all as read')");
    const hasUnread = await markAllButton.isVisible();

    if (hasUnread) {
      // Get initial unread count
      const badge = page.locator(
        "span:has-text(/\\d+/):near(button:has-text('Inbox'))",
      );
      const initialCountText = (await badge.textContent()) || "0";
      const initialCount = parseInt(initialCountText) || 0;

      // Click "Mark all as read"
      await markAllButton.click();

      // Wait for update
      await page.waitForTimeout(1000);

      // Verify all submissions are gray (read)
      const unreadSubmissions = page.locator("li:has([class*='bg-blue-50'])");
      await expect(unreadSubmissions).toHaveCount(0);

      // Verify all blue dots disappear
      const blueDots = page.locator(".bg-blue-600");
      await expect(blueDots).toHaveCount(0);

      // Verify badge count becomes 0 or disappears
      if (initialCount > 0) {
        const newBadge = page.locator(
          "span:has-text(/\\d+/):near(button:has-text('Inbox'))",
        );
        const badgeVisible = await newBadge.isVisible();
        if (badgeVisible) {
          const newCountText = await newBadge.textContent();
          const newCount = parseInt(newCountText || "0");
          expect(newCount).toBe(0);
        }
      }

      // Verify "Mark all as read" button disappears
      await expect(markAllButton).not.toBeVisible();
    } else {
      test.skip();
    }
  });

  test("read status persists after page refresh", async ({
    authenticatedPage: page,
  }) => {
    // Find an unread submission
    const unreadSubmissions = page.locator(
      "li:has([class*='bg-blue-50']):has-text('Mark read')",
    );
    const hasUnread = (await unreadSubmissions.count()) > 0;

    if (hasUnread) {
      const firstUnread = unreadSubmissions.first();
      const submissionId =
        (await firstUnread.getAttribute("data-testid")) || "";

      // Mark as read
      const markReadButton = firstUnread.locator(
        "button:has-text('Mark read')",
      );
      await markReadButton.click();
      await page.waitForTimeout(500);

      // Refresh page
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.locator("button:has-text('Inbox')").click();

      // Verify submission is still marked as read
      const readSubmission = page.locator(`li[data-testid="${submissionId}"]`);
      if (await readSubmission.isVisible()) {
        await expect(readSubmission).toHaveClass(/bg-gray-50/);
        const markReadBtn = readSubmission.locator(
          "button:has-text('Mark read')",
        );
        await expect(markReadBtn).not.toBeVisible();
      }
    } else {
      test.skip();
    }
  });
});
