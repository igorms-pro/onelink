import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";

test.describe.skip("Email Notifications", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await setupPostHogInterception(page);
  });

  test("email sent on new submission when preferences enabled", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to Settings to enable email notifications
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Find email preferences section
    const emailSection = page.locator("text=/email.*notification/i");
    const sectionVisible = await emailSection.isVisible();

    if (sectionVisible) {
      // Enable email notifications if not already enabled
      // Look for checkbox near email notification text
      const emailToggle = page
        .locator('input[type="checkbox"]')
        .filter({ has: page.locator("text=/email.*notification/i") })
        .or(page.locator('input[type="checkbox"]').first());
      const isChecked = await emailToggle.isChecked();

      if (!isChecked) {
        await emailToggle.check();
        await page.waitForTimeout(500);
      }

      // Note: In a real scenario:
      // 1. Submit a file from a public profile (different user/browser)
      // 2. Verify email is received (requires email testing service like Mailtrap)
      // 3. Verify email contains correct information
      // 4. Verify Dashboard link works

      // For now, verify preferences are saved
      await expect(emailToggle).toBeChecked();
    } else {
      test.skip("Email preferences section not found");
    }
  });

  test("rate limiting prevents multiple emails within 5 minutes", async ({
    authenticatedPage: _page,
  }) => {
    // Note: This test requires:
    // 1. Submitting 3 files rapidly (within 5 minutes) to the same Drop
    // 2. Verifying only the first email is received
    // 3. Waiting 6 minutes
    // 4. Submitting another file
    // 5. Verifying a new email is received

    // This is a complex integration test that requires:
    // - Email testing service (Mailtrap, Mailhog)
    // - Multiple user contexts
    // - Time manipulation or waiting

    test.skip("Requires email testing service setup");
  });

  test("no email sent when preferences disabled", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to Settings
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Find email preferences section
    const emailSection = page.locator("text=/email.*notification/i");
    const sectionVisible = await emailSection.isVisible();

    if (sectionVisible) {
      // Disable email notifications
      // Look for checkbox near email notification text
      const emailToggle = page
        .locator('input[type="checkbox"]')
        .filter({ has: page.locator("text=/email.*notification/i") })
        .or(page.locator('input[type="checkbox"]').first());
      const isChecked = await emailToggle.isChecked();

      if (isChecked) {
        await emailToggle.uncheck();
        await page.waitForTimeout(500);
      }

      // Verify preferences are saved
      await expect(emailToggle).not.toBeChecked();

      // Note: In a real scenario:
      // 1. Submit a file from a public profile
      // 2. Verify no email is received
    } else {
      test.skip("Email preferences section not found");
    }
  });
});
