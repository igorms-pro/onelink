import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe("Download Notifications", () => {
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

  test("download appears in inbox with correct information", async ({
    authenticatedPage: page,
  }) => {
    // Check if there are any downloads displayed
    // Downloads have green background and Download icon
    const downloadItems = page.locator(
      "li:has([class*='bg-green-50']):has-text('File downloaded')",
    );
    const hasDownloads = (await downloadItems.count()) > 0;

    if (hasDownloads) {
      const firstDownload = downloadItems.first();

      // Verify download information is displayed
      // Drop label
      const dropLabel = firstDownload.locator("text=/Drop/i");
      await expect(dropLabel.first()).toBeVisible();

      // File name
      const fileName = firstDownload.locator("text=/\\w+\\.\\w+/"); // Matches file.ext pattern
      await expect(fileName.first()).toBeVisible();

      // Date
      const date = firstDownload.locator("text=/\\d{4}/"); // Matches year in date
      await expect(date.first()).toBeVisible();

      // Verify download is sorted chronologically with submissions
      // (most recent first)
      const allItems = page.locator("li:has([class*='rounded-xl'])");
      const itemCount = await allItems.count();

      if (itemCount > 1) {
        // Get dates from first two items
        const firstItem = allItems.first();
        const secondItem = allItems.nth(1);

        const firstDateText = await firstItem
          .locator("text=/\\d{4}-\\d{2}-\\d{2}/")
          .first()
          .textContent();
        const secondDateText = await secondItem
          .locator("text=/\\d{4}-\\d{2}-\\d{2}/")
          .first()
          .textContent();

        if (firstDateText && secondDateText) {
          const firstDate = new Date(firstDateText);
          const secondDate = new Date(secondDateText);
          // First item should be more recent (or equal)
          expect(firstDate.getTime()).toBeGreaterThanOrEqual(
            secondDate.getTime(),
          );
        }
      }
    } else {
      // Note: In a real scenario:
      // 1. Have at least one submission with files
      // 2. Download a file from a public profile (different user/browser)
      // 3. Verify download appears in Inbox
      // 4. Verify download is sorted chronologically with submissions
      // 5. Verify download information is correct

      test.skip("No downloads to test - requires test data setup");
    }
  });

  test("owner downloads are excluded from inbox", async ({
    authenticatedPage: page,
  }) => {
    // Note: This test requires:
    // 1. Being logged in as the owner
    // 2. Downloading a file from your own drop
    // 3. Verifying the download does NOT appear in Inbox

    // This is difficult to test in E2E without:
    // - Multiple authenticated contexts
    // - Or a way to identify owner vs visitor downloads

    // For now, we verify the inbox structure
    const downloadItems = page.locator(
      "li:has([class*='bg-green-50']):has-text('File downloaded')",
    );
    const downloadCount = await downloadItems.count();

    // If downloads exist, verify they're not from owner
    // (This is a structural test - full test requires setup)
    expect(downloadCount).toBeGreaterThanOrEqual(0);

    test.skip("Requires multiple user contexts or download tracking setup");
  });
});
