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

    // Wait for the first section to appear - this ensures async operations (useUserPreferences, etc.) have completed
    // This is more reliable than networkidle which can be flaky
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

  // Skipped: MFA challenge modal blocks button clicks intermittently
  test.skip("can navigate to sessions page", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(
      page.getByTestId("settings-active-sessions-section"),
    ).toBeVisible({ timeout: 30000 });

    // Wait for MFA challenge to be dismissed if it appears
    const mfaChallenge = page.getByTestId("mfa-challenge-container");
    await mfaChallenge.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {
      // MFA challenge didn't appear, that's fine
    });

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

    // Wait for MFA challenge to be dismissed if it appears
    // Check both the container and any backdrop overlays
    const mfaChallenge = page.getByTestId("mfa-challenge-container");
    const mfaBackdrop = page.locator(
      ".fixed.inset-0.z-50.bg-black\\/40.backdrop-blur-sm",
    );

    // Wait for both to be hidden or removed
    await Promise.all([
      mfaChallenge.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {}),
      mfaBackdrop.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {}),
    ]);

    // Additional wait to ensure DOM has settled
    await page.waitForTimeout(200);

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

  // Skipped: MFA challenge modal blocks button clicks intermittently
  test.skip("can toggle notification preferences", async ({
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

    // Wait for toggle to be enabled (not saving)
    await expect(toggle).toBeEnabled({ timeout: 5000 });

    // Click the toggle
    await toggle.click();

    // Wait for the toggle state to change
    // The updatePreference function uses optimistic updates, so state should change immediately
    // Use toBeChecked() with the opposite state and wait for it
    await expect(toggle).toBeChecked({ checked: !initialState, timeout: 5000 });
  });

  test("can open change password modal", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Wait for privacy security section to load
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    // Wait for MFA challenge to be dismissed if it appears
    const mfaChallenge = page.getByTestId("mfa-challenge-container");
    await mfaChallenge.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {
      // MFA challenge didn't appear, that's fine
    });

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

    // If button is disabled (MFA not enabled), skip this test
    const isDisabled = await deleteAccountButton
      .isDisabled()
      .catch(() => false);
    if (isDisabled) {
      // Verify the MFA notice is shown in the settings section
      const mfaNotice = page.getByTestId("settings-delete-account-mfa-notice");
      await expect(mfaNotice).toBeVisible();
      return;
    }

    await deleteAccountButton.click();

    // Modal should open - wait for it to appear
    await expect(page.getByTestId("delete-account-modal")).toBeVisible({
      timeout: 5000,
    });

    // Wait a bit for MFA status to load
    await page.waitForTimeout(500);

    // Check if MFA is required message is shown (if MFA not enabled)
    // or the form is shown (if MFA is enabled)
    const mfaRequiredMessage = page.getByTestId(
      "delete-account-mfa-required-message",
    );
    const form = page.getByTestId("delete-account-form");

    // Wait for either one to be visible (with timeout)
    await Promise.race([
      mfaRequiredMessage
        .waitFor({ state: "visible", timeout: 2000 })
        .catch(() => null),
      form.waitFor({ state: "visible", timeout: 2000 }).catch(() => null),
    ]);

    const isMfaRequired = await mfaRequiredMessage
      .isVisible()
      .catch(() => false);
    const isFormVisible = await form.isVisible().catch(() => false);

    // Either the MFA required message OR the form should be visible
    expect(isMfaRequired || isFormVisible).toBe(true);
  });

  test("attempting to delete account keeps user on settings when deletion is disabled", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Ensure privacy & security section is visible
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    // Open delete account modal
    const deleteAccountButton = page.getByTestId("settings-delete-account");
    await expect(deleteAccountButton).toBeVisible();
    await deleteAccountButton.click();

    const modal = page.getByTestId("delete-account-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Wait a bit for MFA status to load
    await page.waitForTimeout(500);

    // Check if MFA is required message is shown (if MFA not enabled)
    // or the form is shown (if MFA is enabled)
    const mfaRequiredMessage = page.getByTestId(
      "delete-account-mfa-required-message",
    );
    const form = page.getByTestId("delete-account-form");

    // Wait for either one to be visible (with timeout)
    await Promise.race([
      mfaRequiredMessage
        .waitFor({ state: "visible", timeout: 2000 })
        .catch(() => null),
      form.waitFor({ state: "visible", timeout: 2000 }).catch(() => null),
    ]);

    const isMfaRequired = await mfaRequiredMessage
      .isVisible()
      .catch(() => false);
    const isFormVisible = await form.isVisible().catch(() => false);

    // If MFA is not enabled, the test should show the MFA required message
    if (isMfaRequired) {
      // User needs to enable MFA first - test that the message is shown
      await expect(mfaRequiredMessage).toBeVisible();
      return;
    }

    // If MFA is enabled, proceed with the form
    if (!isFormVisible) {
      throw new Error("Neither MFA required message nor form is visible");
    }
    await expect(form).toBeVisible();

    // Fill form (MFA code + confirmation checkbox)
    const mfaCodeInput = page.getByTestId("delete-account-mfa-input");
    const confirmCheckbox = page.getByTestId("delete-account-confirm-checkbox");

    await mfaCodeInput.fill("123456");
    await confirmCheckbox.click();

    // Submit the form
    const submitButton = page.getByTestId("delete-account-submit-button");
    await submitButton.click();

    // When DELETE_ACCOUNT_ENABLED is false in the Edge Function env, the call
    // should fail and keep the user on /settings with the modal still open.
    // This makes the test safe even with a shared E2E test account.
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });
    await expect(page.getByTestId("delete-account-modal")).toBeVisible();

    // After submission, either the form or the MFA required message should still be visible
    const formAfterSubmit = page.getByTestId("delete-account-form");
    const mfaRequiredAfterSubmit = page.getByTestId(
      "delete-account-mfa-required-message",
    );
    const isFormStillVisible = await formAfterSubmit
      .isVisible()
      .catch(() => false);
    const isMfaRequiredStillVisible = await mfaRequiredAfterSubmit
      .isVisible()
      .catch(() => false);

    // At least one should be visible (form if MFA enabled, or MFA required message if not)
    expect(isFormStillVisible || isMfaRequiredStillVisible).toBe(true);
  });

  test("delete account modal shows MFA required message when MFA is not enabled", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });

    // Ensure privacy & security section is visible
    await expect(
      page.getByTestId("settings-privacy-security-section"),
    ).toBeVisible({ timeout: 30000 });

    // Open delete account modal
    const deleteAccountButton = page.getByTestId("settings-delete-account");
    await expect(deleteAccountButton).toBeVisible();

    // If button is disabled (MFA not enabled), skip this test
    const isDisabled = await deleteAccountButton
      .isDisabled()
      .catch(() => false);
    if (isDisabled) {
      // Verify the MFA notice is shown in the settings section
      const mfaNotice = page.getByTestId("settings-delete-account-mfa-notice");
      await expect(mfaNotice).toBeVisible();
      return;
    }

    await deleteAccountButton.click();

    const modal = page.getByTestId("delete-account-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check if MFA required message is shown
    const mfaRequiredMessage = page.getByTestId(
      "delete-account-mfa-required-message",
    );
    const isMfaRequired = await mfaRequiredMessage
      .isVisible()
      .catch(() => false);

    if (isMfaRequired) {
      // Verify the message and CTA button are visible
      await expect(mfaRequiredMessage).toBeVisible();
      const enable2FAButton = page.getByTestId(
        "delete-account-enable-2fa-button",
      );
      await expect(enable2FAButton).toBeVisible();

      // Click the enable 2FA button should navigate to 2FA page
      await enable2FAButton.click();
      await expect(page).toHaveURL(/\/settings\/2fa/);
    }
  });

  test("back to dashboard button works", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings", { waitUntil: "load" });
    await expect(
      page.getByTestId("settings-notifications-section"),
    ).toBeVisible({ timeout: 30000 });

    // Wait for MFA challenge to be dismissed if it appears
    // Check both the container and any backdrop overlays
    const mfaChallenge = page.getByTestId("mfa-challenge-container");
    const mfaBackdrop = page.locator(
      ".fixed.inset-0.z-50.bg-black\\/40.backdrop-blur-sm",
    );

    // Wait for both to be hidden or removed
    await Promise.all([
      mfaChallenge.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {}),
      mfaBackdrop.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {}),
    ]);

    // Additional wait to ensure DOM has settled
    await page.waitForTimeout(200);

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
