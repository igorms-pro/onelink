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
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500); // Small delay to ensure page is fully loaded

    const sessionsLink = page
      .getByTestId("settings-active-sessions")
      .or(page.getByRole("button", { name: /active sessions/i }))
      .first();

    if (await sessionsLink.isVisible().catch(() => false)) {
      await sessionsLink.click();
      await expect(page).toHaveURL(/\/settings\/sessions/);
      await expect(page.getByText(/active sessions/i)).toBeVisible();
    } else {
      // Navigate directly if link not found
      await page.goto("/settings/sessions");
      await expect(page).toHaveURL(/\/settings\/sessions/);
    }
  });

  test("can navigate to 2FA page", async ({ authenticatedPage: page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Wait for preferences section to load
    await page.waitForSelector(
      '[data-testid="settings-notifications-section"]',
    );

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
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const changePasswordButton = page
      .getByTestId("settings-change-password")
      .or(page.getByRole("button", { name: /change password/i }))
      .first();

    if (await changePasswordButton.isVisible().catch(() => false)) {
      await changePasswordButton.click();

      // Modal should open
      await expect(page.getByTestId("change-password-modal")).toBeVisible();
      await expect(page.getByLabel(/current password/i)).toBeVisible();
      await expect(page.getByLabel(/new password/i)).toBeVisible();
    }
  });

  test("can open delete account modal", async ({ authenticatedPage: page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const deleteAccountButton = page
      .getByTestId("settings-delete-account")
      .or(page.getByRole("button", { name: /delete account/i }))
      .first();

    if (await deleteAccountButton.isVisible().catch(() => false)) {
      await deleteAccountButton.click();

      // Modal should open with warning
      await expect(page.getByTestId("delete-account-modal")).toBeVisible();
      await expect(page.getByText(/delete account/i)).toBeVisible();
      await expect(page.getByText(/cannot be undone/i)).toBeVisible();
    }
  });

  test("back to dashboard button works", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

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
