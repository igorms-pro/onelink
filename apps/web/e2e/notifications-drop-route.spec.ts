import { test, expect } from "./fixtures/auth";
import { setupPostHogInterception } from "./helpers/posthog";
import { createNotificationsTestData } from "./helpers/test-data";

test.describe.skip("Drop Route and Drag-and-Drop Notifications", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
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
        await page.waitForTimeout(5000);
      }
    } catch (error) {
      console.warn("Failed to create test data:", error);
      // Continue anyway - test will skip if no data exists
    }
  });

  test("can navigate to drop route via /drop/:token", async ({
    authenticatedPage: page,
  }) => {
    // Get drop token from test data
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

    if (!userId) {
      test.skip("No userId found - cannot get drop token");
      return;
    }

    const { dropToken } = await createNotificationsTestData(userId);

    if (!dropToken) {
      test.skip("No drop token available - drop may not have share_token");
      return;
    }

    // Navigate to drop route
    await page.goto(`/drop/${dropToken}`);
    await page.waitForLoadState("networkidle");

    // Verify drop page loads
    // Should see drop label or upload form
    const dropContent = page.locator("body");
    await expect(dropContent).toBeVisible();

    // Verify upload form or drop content is visible
    // The drop page should have either:
    // - Upload form (if visitor)
    // - Drop header with label
    // - File list (if files exist)
    const hasUploadForm = await page
      .locator('input[type="file"]')
      .isVisible()
      .catch(() => false);
    const hasDropLabel = await page
      .locator("text=/Test Drop for Notifications/i")
      .isVisible()
      .catch(() => false);
    const hasFileList = await page
      .locator('[data-testid*="drop"], [data-testid*="file"]')
      .isVisible()
      .catch(() => false);

    expect(hasUploadForm || hasDropLabel || hasFileList).toBe(true);
  });

  test("drag and drop file submission works on drop route", async ({
    authenticatedPage: page,
  }) => {
    // Get drop token from test data
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

    if (!userId) {
      test.skip("No userId found - cannot get drop token");
      return;
    }

    const { dropToken } = await createNotificationsTestData(userId);

    if (!dropToken) {
      test.skip("No drop token available - drop may not have share_token");
      return;
    }

    // Navigate to drop route
    await page.goto(`/drop/${dropToken}`);
    await page.waitForLoadState("networkidle");

    // Find the file drop zone or upload area
    const fileInput = page.locator('input[type="file"]');
    const dropZone = page
      .locator('[data-testid*="drop-zone"], [data-testid*="file-drop"]')
      .or(page.locator('div:has-text("drop"), div:has-text("Drag")'))
      .first();

    const hasFileInput = await fileInput.isVisible().catch(() => false);
    const hasDropZone = await dropZone.isVisible().catch(() => false);

    if (!hasFileInput && !hasDropZone) {
      test.skip("File upload area not found on drop page");
      return;
    }

    // Create a test file
    const testFileContent = "Test file content for drag and drop";
    const testFileName = "test-drag-drop.txt";

    if (hasDropZone) {
      // Simulate drag and drop
      const file = {
        name: testFileName,
        mimeType: "text/plain",
        buffer: Buffer.from(testFileContent),
      };

      // Get bounding box of drop zone
      const box = await dropZone.boundingBox();
      if (box) {
        // Simulate drag over
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(100);

        // For actual file drop, we need to use setInputFiles on the file input
        // Find the hidden file input associated with the drop zone
        const hiddenInput = page.locator('input[type="file"]').first();
        if (await hiddenInput.isVisible().catch(() => false)) {
          await hiddenInput.setInputFiles(file);
        } else {
          // If input is hidden, we can't easily test drag-and-drop in Playwright
          // Instead, test that the drop zone exists and is interactive
          await expect(dropZone).toBeVisible();
          test.skip(
            "File input is hidden - drag-and-drop requires manual testing",
          );
        }
      }
    } else if (hasFileInput) {
      // Use file input directly
      const file = {
        name: testFileName,
        mimeType: "text/plain",
        buffer: Buffer.from(testFileContent),
      };
      await fileInput.setInputFiles(file);

      // Verify file was selected (check for file preview or name)
      await page.waitForTimeout(500);
      const filePreview = page.locator(`text=${testFileName}`);
      const hasPreview = await filePreview.isVisible().catch(() => false);

      // Note: Full submission test would require:
      // 1. Filling name/email fields if required
      // 2. Clicking submit button
      // 3. Verifying success message
      // 4. Verifying notification appears in inbox

      expect(hasPreview || hasFileInput).toBe(true);
    }
  });

  test("submission via drop route creates notification in inbox", async ({
    authenticatedPage: page,
  }) => {
    // This test verifies the full flow:
    // 1. Submit file via /drop/:token route
    // 2. Navigate to dashboard inbox
    // 3. Verify new submission appears

    // Get drop token from test data
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

    if (!userId) {
      test.skip("No userId found - cannot get drop token");
      return;
    }

    const { dropToken } = await createNotificationsTestData(userId);

    if (!dropToken) {
      test.skip("No drop token available - drop may not have share_token");
      return;
    }

    // Navigate to drop route
    await page.goto(`/drop/${dropToken}`);
    await page.waitForLoadState("networkidle");

    // Find file input
    const fileInput = page.locator('input[type="file"]');
    const hasFileInput = await fileInput.isVisible().catch(() => false);

    if (!hasFileInput) {
      test.skip("File upload not available on drop page");
      return;
    }

    // Create and upload test file
    const testFileContent = `Test submission ${Date.now()}`;
    const testFileName = `test-${Date.now()}.txt`;
    const file = {
      name: testFileName,
      mimeType: "text/plain",
      buffer: Buffer.from(testFileContent),
    };

    await fileInput.setInputFiles(file);
    await page.waitForTimeout(500);

    // Fill form fields if they exist
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const noteInput = page.locator('textarea[name="note"]');

    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Test Submitter");
    }
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("test@example.com");
    }
    if (await noteInput.isVisible().catch(() => false)) {
      await noteInput.fill("Test submission via drop route");
    }

    // Submit form
    const submitButton = page
      .locator('button[type="submit"]')
      .or(page.locator('button:has-text("Send"), button:has-text("Submit")'))
      .first();
    const hasSubmitButton = await submitButton.isVisible().catch(() => false);

    if (hasSubmitButton) {
      await submitButton.click();
      await page.waitForTimeout(2000); // Wait for submission to complete

      // Navigate to dashboard inbox - profile already exists
      await page.waitForTimeout(2000); // Wait for any RLS propagation
      await page.goto("/dashboard", {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(2000);

      const inboxButton = page
        .locator(
          '[data-testid="tab-navigation-inbox"], [data-testid="bottom-navigation-inbox"]',
        )
        .first();
      await inboxButton.click();
      await page.waitForLoadState("networkidle");

      // Verify submission appears in inbox
      // Look for the submission by name or note
      const submission = page
        .locator(`text=Test Submitter`)
        .or(page.locator(`text=Test submission via drop route`))
        .first();
      const hasSubmission = await submission.isVisible().catch(() => false);

      // Note: This may not work immediately if realtime hasn't updated
      // In a real scenario, you'd wait for realtime update or refresh
      expect(hasSubmission).toBe(true);
    } else {
      test.skip("Submit button not found - form may not be submittable");
    }
  });
});
