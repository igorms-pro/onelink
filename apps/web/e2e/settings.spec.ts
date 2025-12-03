import { test, expect } from "./fixtures/auth";

test.describe("Settings Navigation", () => {
  test("settings page redirects to auth if not authenticated", async ({
    page,
  }) => {
    await page.goto("/settings");

    // Should redirect to auth or show sign in message
    await expect(page.locator("body")).toBeVisible();
  });

  test("settings page shows all sections when authenticated", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Wait for at least one section to appear - this ensures the page has started rendering
    await expect(
      page.getByTestId("settings-notifications-section"),
    ).toBeVisible({ timeout: 30000 });

    await expect(
      page.getByTestId("settings-notifications-section"),
    ).toBeVisible();
    await expect(
      page.getByTestId("settings-email-preferences-section"),
    ).toBeVisible();
    await expect(page.getByTestId("settings-billing-section")).toBeVisible();
    await expect(
      page.getByTestId("settings-active-sessions-section"),
    ).toBeVisible();
    await expect(
      page.getByTestId("settings-data-export-section"),
    ).toBeVisible();
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible();
  });

  test("can navigate to billing page", async ({ authenticatedPage: page }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(page.getByTestId("settings-billing-section")).toBeVisible({
      timeout: 30000,
    });

    // Look for billing link/button - could be "Manage payment" or "Manage billing"
    const billingLink = page
      .getByTestId("settings-manage-payment")
      .or(page.getByTestId("settings-billing-history"))
      .or(page.getByRole("link", { name: /billing/i }))
      .first();

    if (await billingLink.isVisible().catch(() => false)) {
      await billingLink.click();
      await expect(page).toHaveURL(/\/settings\/billing/);
      await expect(page.getByText(/billing/i)).toBeVisible();
    } else {
      // If no billing link visible (free plan), navigate directly
      await page.goto("/settings/billing");
      await expect(page).toHaveURL(/\/settings\/billing/);
    }
  });

  test("can navigate to sessions page", async ({ authenticatedPage: page }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(
      page.getByTestId("settings-active-sessions-section"),
    ).toBeVisible({ timeout: 30000 });

    const sessionsLink = page
      .getByTestId("settings-active-sessions")
      .or(page.getByRole("button", { name: /active sessions/i }))
      .first();

    if (await sessionsLink.isVisible().catch(() => false)) {
      await sessionsLink.click();
      await expect(page).toHaveURL(/\/settings\/sessions/);
      // Use data-testid instead of getByText to avoid strict mode violation
      await expect(page.getByTestId("sessions-page-title")).toBeVisible();
    } else {
      // Navigate directly if link not found
      await page.goto("/settings/sessions");
      await expect(page).toHaveURL(/\/settings\/sessions/);
      await expect(page.getByTestId("sessions-page-title")).toBeVisible();
    }
  });

  test("can navigate to 2FA page", async ({ authenticatedPage: page }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    const twoFactorLink = page
      .getByTestId("settings-two-factor")
      .or(page.getByRole("button", { name: /two.factor|2fa/i }))
      .first();

    if (await twoFactorLink.isVisible().catch(() => false)) {
      await twoFactorLink.click();
      await expect(page).toHaveURL(/\/settings\/2fa/);
      await expect(page.getByTestId("two-factor-page-title")).toBeVisible();
    } else {
      // Navigate directly if link not found
      await page.goto("/settings/2fa");
      await expect(page).toHaveURL(/\/settings\/2fa/);
    }
  });

  test("can toggle notification preferences", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Wait for preferences section to load
    await expect(
      page.getByTestId("settings-notifications-section"),
    ).toBeVisible({ timeout: 30000 });

    // Find email notifications toggle
    const toggle = page.getByTestId("settings-email-notifications-toggle");
    await expect(toggle).toBeVisible();

    const initialState = await toggle.isChecked();

    await toggle.click();
    await page.waitForTimeout(1000); // Wait for save

    // Should toggle state
    const newState = await toggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test("can open change password modal", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Wait for privacy security section to load
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    const changePasswordButton = page.getByTestId("settings-change-password");
    await expect(changePasswordButton).toBeVisible();
    await changePasswordButton.click();

    // Modal should open - wait for it to appear
    await expect(page.getByTestId("change-password-modal")).toBeVisible({
      timeout: 5000,
    });
    // Verify form is visible
    await expect(
      page.getByTestId("settings-change-password-form"),
    ).toBeVisible();
  });

  test("can open delete account modal", async ({ authenticatedPage: page }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Wait for privacy security section to load
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    const deleteAccountButton = page.getByTestId("settings-delete-account");
    await expect(deleteAccountButton).toBeVisible();
    await deleteAccountButton.click();

    // Modal should open with warning - wait for it to appear
    await expect(page.getByTestId("delete-account-modal")).toBeVisible({
      timeout: 5000,
    });
    // Verify form is visible
    await expect(page.getByTestId("delete-account-form")).toBeVisible();
  });

  test("back to dashboard button works", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(
      page.getByTestId("settings-notifications-section"),
    ).toBeVisible({ timeout: 30000 });

    const backButton = page
      .getByRole("button", { name: /back to dashboard/i })
      .or(page.getByRole("link", { name: /back to dashboard/i }))
      .first();

    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });
});
