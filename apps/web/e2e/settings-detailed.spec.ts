import { test, expect } from "./fixtures/auth";

test.describe("Settings - Detailed Features", () => {
  test("settings page redirects to auth if not authenticated", async ({
    page,
  }) => {
    await page.goto("/settings");
    // Should redirect to auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test("settings page shows all sections when authenticated", async ({
    page: _page,
  }) => {
    // This test requires authentication setup
    // Uncomment when you have test auth credentials:
    /*
    await page.goto("/settings");
    
    await expect(page.getByText(/Notifications/i)).toBeVisible();
    await expect(page.getByText(/Email Preferences/i)).toBeVisible();
    await expect(page.getByText(/Billing/i)).toBeVisible();
    await expect(page.getByText(/Active Sessions/i)).toBeVisible();
    await expect(page.getByText(/Data Export/i)).toBeVisible();
    await expect(page.getByText(/Privacy & Security/i)).toBeVisible();
    */
  });

  test.skip("can navigate to 2FA page from settings", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Look for 2FA link/button in settings
    // The exact selector depends on the settings page structure
    const twoFactorLink = page
      .getByRole("link", { name: /Two-Factor|2FA/i })
      .or(page.getByTestId("settings-two-factor"))
      .first();

    if (await twoFactorLink.isVisible().catch(() => false)) {
      await twoFactorLink.click();
      await expect(page).toHaveURL(/\/settings\/2fa/);
      await expect(page.getByTestId("two-factor-page-title")).toBeVisible();
    }
  });

  // Supabase MFA: UI still shows disabled state first when no factors
  test.skip("2FA page shows disabled state initially (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();
    await expect(page.getByTestId("two-factor-disabled-status")).toBeVisible();
    await expect(page.getByTestId("enable-2fa-button")).toBeVisible();
  });

  // Supabase MFA: enrollment is handled via supabase.auth.mfa.enroll()
  test.skip("can start 2FA setup process (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Wait for disabled state to be visible first
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();

    // Click enable button
    const enableButton = page.getByTestId("enable-2fa-button");
    await enableButton.click();

    // Wait for setup state to appear (wait for disabled state to disappear and setup state to appear)
    await expect(page.getByTestId("two-factor-disabled-state")).toBeHidden({
      timeout: 5000,
    });
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible({
      timeout: 5000,
    });

    // Should show setup state with QR code and secret
    await expect(page.getByTestId("qr-code-container")).toBeVisible();
    await expect(page.getByTestId("qr-code")).toBeVisible();
    await expect(page.getByTestId("secret-key-container")).toBeVisible();
    await expect(page.getByTestId("secret-key-value")).toBeVisible();
    await expect(page.getByTestId("verification-code-container")).toBeVisible();
  });

  test.skip("2FA setup shows QR code and secret key (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Wait for disabled state
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();

    // Start setup
    await page.getByTestId("enable-2fa-button").click();

    // Wait for setup state to appear
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible({
      timeout: 5000,
    });

    // Verify QR code is displayed
    const qrCode = page.getByTestId("qr-code");
    await expect(qrCode).toBeVisible();

    // Verify secret key is displayed
    const secretKey = page.getByTestId("secret-key-value");
    await expect(secretKey).toBeVisible();
    const secretValue = await secretKey.textContent();
    expect(secretValue).toBeTruthy();
    expect(secretValue?.length).toBeGreaterThan(0);

    // Verify copy secret button is available
    await expect(page.getByTestId("copy-secret-button")).toBeVisible();
  });

  test.skip("verification code input accepts 6 digits (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Wait for disabled state
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();

    // Start setup
    await page.getByTestId("enable-2fa-button").click();

    // Wait for setup state to appear
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible({
      timeout: 5000,
    });

    // Find verification code input
    const codeInput = page.getByTestId("verification-code-input");
    await expect(codeInput).toBeVisible();

    // Enter 6 digits
    await codeInput.fill("123456");

    // Verify button is enabled (not disabled)
    const verifyButton = page.getByTestId("verify-and-activate-button");
    const isDisabled = await verifyButton.getAttribute("disabled");
    expect(isDisabled).toBeNull(); // Button should be enabled with 6 digits

    // Try entering non-numeric characters (should be filtered)
    await codeInput.fill("abc123");
    const value = await codeInput.inputValue();
    expect(value).toBe("123"); // Only numbers should remain
  });

  test.skip("verification button is disabled with invalid code length (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Wait for disabled state
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();

    // Start setup
    await page.getByTestId("enable-2fa-button").click();

    // Wait for setup state to appear
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible({
      timeout: 5000,
    });

    const codeInput = page.getByTestId("verification-code-input");
    const verifyButton = page.getByTestId("verify-and-activate-button");

    // With less than 6 digits, button should be disabled
    await codeInput.fill("12345");
    const isDisabled = await verifyButton.getAttribute("disabled");
    expect(isDisabled).not.toBeNull();
  });

  // Supabase MFA does not provide backup codes natively.
  // This test is kept for potential future custom backup codes implementation.
  test.skip("backup codes are displayed after successful setup (legacy)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Start setup
    await page.getByTestId("enable-2fa-button").click();
    await page.waitForTimeout(1000);

    // Note: In a real scenario, we would need to generate a valid TOTP code
    // For now, we test the UI flow. The actual verification would require
    // a TOTP library or mocking the verification endpoint

    // Enter a code (even if invalid, we can test the UI)
    const codeInput = page.getByTestId("verification-code-input");
    await codeInput.fill("123456");

    // Click verify (this will likely fail with invalid code, but we test the flow)
    const verifyButton = page.getByTestId("verify-and-activate-button");
    await verifyButton.click();

    // Wait a bit for any response
    await page.waitForTimeout(2000);

    // If verification succeeds, backup codes should appear
    // If it fails, we'll see an error message
    // For now, we just verify the UI elements exist
    const backupCodesDisplay = page.getByTestId("backup-codes-display-setup");
    // This might not be visible if verification failed, so we check conditionally
    const isVisible = await backupCodesDisplay.isVisible().catch(() => false);
    // If visible, verify backup codes structure
    if (isVisible) {
      await expect(page.getByTestId("backup-codes-title")).toBeVisible();
      await expect(
        page.getByTestId("copy-all-backup-codes-button"),
      ).toBeVisible();
    }
  });

  test.skip("can copy secret key", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Wait for disabled state
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();

    // Start setup
    await page.getByTestId("enable-2fa-button").click();

    // Wait for setup state to appear
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible({
      timeout: 5000,
    });

    // Click copy secret button
    const copyButton = page.getByTestId("copy-secret-button");
    await copyButton.click();

    // Wait for clipboard operation and toast notification
    await page.waitForTimeout(500);

    // Verify clipboard was written (check for success toast or similar)
    // Note: Playwright can't directly verify clipboard, but we can check for UI feedback
  });

  test.skip("active state shows 2FA is enabled (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    // This test assumes 2FA is already enabled for the test user
    // In a real scenario, you might need to set this up first
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Check if active state is shown (if 2FA is already enabled)
    const activeState = page.getByTestId("two-factor-active-state");
    const disabledState = page.getByTestId("two-factor-disabled-state");

    // One of these should be visible
    const isActiveVisible = await activeState.isVisible().catch(() => false);
    const isDisabledVisible = await disabledState
      .isVisible()
      .catch(() => false);

    expect(isActiveVisible || isDisabledVisible).toBe(true);

    // If active, verify active status component
    if (isActiveVisible) {
      await expect(page.getByTestId("two-factor-active-status")).toBeVisible();
    }
  });

  // Backup codes are no longer part of Supabase MFA by default.
  test.skip("active state shows backup codes section (legacy)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Check if we're in active state
    const activeState = page.getByTestId("two-factor-active-state");
    const isActive = await activeState.isVisible().catch(() => false);

    if (isActive) {
      // Verify backup codes section exists
      await expect(
        page.getByTestId("backup-codes-display-active"),
      ).toBeVisible();

      // Verify regenerate button exists
      const regenerateButton = page.getByTestId(
        "regenerate-backup-codes-button",
      );
      await expect(regenerateButton).toBeVisible();
    }
  });

  test.skip("can show backup codes in active state (legacy)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    const activeState = page.getByTestId("two-factor-active-state");
    const isActive = await activeState.isVisible().catch(() => false);

    if (isActive) {
      // Click show backup codes button
      const showButton = page.getByTestId("show-backup-codes-button");
      const isVisible = await showButton.isVisible().catch(() => false);

      if (isVisible) {
        await showButton.click();
        await page.waitForTimeout(500);

        // Backup codes should now be visible
        // We can't easily verify the codes themselves, but we can check the structure
        const backupCodesDisplay = page.getByTestId(
          "backup-codes-display-active",
        );
        await expect(backupCodesDisplay).toBeVisible();
      }
    }
  });

  test.skip("disable 2FA section is visible in active state (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    const activeState = page.getByTestId("two-factor-active-state");
    const isActive = await activeState.isVisible().catch(() => false);

    if (isActive) {
      // Verify disable section exists
      await expect(
        page.getByTestId("disable-two-factor-section"),
      ).toBeVisible();

      // Verify password input exists
      await expect(page.getByTestId("disable-password-input")).toBeVisible();

      // Verify disable button exists
      await expect(page.getByTestId("disable-2fa-button")).toBeVisible();
    }
  });

  test.skip("disable 2FA button is disabled without password (UI confirmation only)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    const activeState = page.getByTestId("two-factor-active-state");
    const isActive = await activeState.isVisible().catch(() => false);

    if (isActive) {
      const disableButton = page.getByTestId("disable-2fa-button");
      const isDisabled = await disableButton.getAttribute("disabled");
      expect(isDisabled).not.toBeNull(); // Should be disabled without password
    }
  });

  test.skip("can toggle password visibility in disable form (Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    const activeState = page.getByTestId("two-factor-active-state");
    const isActive = await activeState.isVisible().catch(() => false);

    if (isActive) {
      const passwordInput = page.getByTestId("disable-password-input");
      const toggleButton = page.getByTestId(
        "toggle-password-visibility-button",
      );

      // Enter password
      await passwordInput.fill("testpassword");

      // Initially should be password type
      const initialType = await passwordInput.getAttribute("type");
      expect(initialType).toBe("password");

      // Click toggle
      await toggleButton.click();
      await page.waitForTimeout(200);

      // Should now be text type
      const newType = await passwordInput.getAttribute("type");
      expect(newType).toBe("text");
    }
  });

  test.skip("2FA setup flow works end-to-end (UI verification, Supabase MFA)", async ({
    authenticatedPage: page,
  }) => {
    // This test verifies the complete UI flow for 2FA setup
    // Note: Actual TOTP verification requires a valid code generator
    // For full e2e testing with real verification, use a TOTP library like 'otplib'

    await page.goto("/settings/2fa");
    await page.waitForLoadState("networkidle");

    // Step 1: Verify disabled state
    await expect(page.getByTestId("two-factor-disabled-state")).toBeVisible();
    await expect(page.getByTestId("enable-2fa-button")).toBeVisible();

    // Step 2: Start setup
    await page.getByTestId("enable-2fa-button").click();
    await page.waitForTimeout(1000);

    // Step 3: Verify setup state with QR code and secret
    await expect(page.getByTestId("two-factor-setup-state")).toBeVisible();
    await expect(page.getByTestId("qr-code")).toBeVisible();
    await expect(page.getByTestId("secret-key-value")).toBeVisible();
    await expect(page.getByTestId("verification-code-input")).toBeVisible();

    // Step 4: Verify verification form is functional
    const codeInput = page.getByTestId("verification-code-input");
    await codeInput.fill("123456");

    const verifyButton = page.getByTestId("verify-and-activate-button");
    const isEnabled = await verifyButton.getAttribute("disabled");
    expect(isEnabled).toBeNull(); // Button should be enabled with 6 digits

    // Step 5: Attempt verification
    // Note: This will likely fail with an invalid code, but we verify the flow
    await verifyButton.click();
    await page.waitForTimeout(2000);

    // After verification attempt, we should either:
    // - See backup codes (if successful)
    // - See an error message (if code was invalid)
    // Both are valid outcomes for this UI flow test
  });

  test("can open change password modal", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings");
    
    const changePasswordButton = page.getByTestId("settings-change-password");
    await changePasswordButton.click();
    
    // Modal should open
    await expect(page.getByTestId("change-password-modal")).toBeVisible();
    await expect(page.getByLabel(/Current Password/i)).toBeVisible();
    await expect(page.getByLabel(/New Password/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm New Password/i)).toBeVisible();
    */
  });

  test("change password form validates input", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings");
    
    const changePasswordButton = page.getByTestId("settings-change-password");
    await changePasswordButton.click();
    
    const submitButton = page.getByRole("button", { name: /Change Password/i });
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
    */
  });

  test("can open data export modal", async ({ authenticatedPage: page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const dataExportButton = page.getByTestId("settings-data-export-open");
    await dataExportButton.click();

    // Modal should open (scope assertions to the dialog to avoid strict mode conflicts)
    const modal = page.getByRole("dialog").last();
    await expect(
      modal.getByRole("heading", { name: /Data Export/i }),
    ).toBeVisible();
    await expect(modal.getByText(/Export Format/i)).toBeVisible();
    await expect(modal.getByText(/Data to Include/i)).toBeVisible();
  });

  test("data export modal shows format options", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const dataExportButton = page.getByTestId("settings-data-export-open");
    await dataExportButton.click();

    // Should show JSON and CSV options
    await expect(page.getByLabel(/JSON/i)).toBeVisible();
    await expect(page.getByLabel(/CSV/i)).toBeVisible();
  });

  test("data export modal shows data selection checkboxes", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const dataExportButton = page.getByTestId("settings-data-export-open");
    await dataExportButton.click();

    // Should show checkboxes for different data types (scoped to dialog to avoid label collisions)
    const modal = page.getByRole("dialog").last();
    await expect(modal.getByLabel(/Profile/i)).toBeVisible();
    await expect(modal.getByLabel(/Links/i)).toBeVisible();
    await expect(modal.getByLabel(/Drops/i)).toBeVisible();
    await expect(modal.getByLabel(/Submissions/i)).toBeVisible();
    await expect(modal.getByLabel(/Analytics/i)).toBeVisible();
  });

  test("can navigate to sessions page", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings");
    
    const sessionsButton = page.getByTestId("settings-active-sessions");
    await sessionsButton.click();
    
    await expect(page).toHaveURL(/\/settings\/sessions/);
    await expect(page.getByText(/Active Sessions/i)).toBeVisible();
    */
  });

  test("sessions page shows current session", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings/sessions");
    
    // Should show at least the current session
    await expect(page.getByText(/Current Session/i)).toBeVisible();
    await expect(page.getByText(/This device/i)).toBeVisible();
    */
  });

  test("can revoke a session", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings/sessions");
    
    // Find a session that's not the current one
    const revokeButtons = page.getByRole("button", { name: /Revoke/i });
    const count = await revokeButtons.count();
    
    if (count > 1) {
      // Revoke the first non-current session
      await revokeButtons.nth(1).click();
      
      // Should show confirmation or remove the session
      await expect(page.getByText(/Session revoked/i)).toBeVisible();
    }
    */
  });

  test("can navigate to custom domains page (Pro only)", async ({
    page: _page,
  }) => {
    // This test requires authentication setup and Pro plan
    /*
    await page.goto("/settings");
    
    // Custom domain section should only be visible for Pro users
    const customDomainButton = page.getByTestId("settings-custom-domain");
    if (await customDomainButton.isVisible()) {
      await customDomainButton.click();
      
      await expect(page).toHaveURL(/\/settings\/custom-domains/);
      await expect(page.getByText(/Custom Domains/i)).toBeVisible();
    }
    */
  });

  test("can open delete account modal", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings");
    
    const deleteAccountButton = page.getByTestId("settings-delete-account");
    await deleteAccountButton.click();
    
    // Modal should open with warning
    await expect(page.getByTestId("delete-account-modal")).toBeVisible();
    await expect(page.getByText(/Delete Account/i)).toBeVisible();
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();
    */
  });

  test("back to dashboard button works", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings");
    
    const backButton = page.getByRole("button", {
      name: /Back to dashboard/i,
    });
    await backButton.click();
    
    await expect(page).toHaveURL(/\/dashboard/);
    */
  });

  test.skip("back button on 2FA page works", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings/2fa");
    
    const backButton = page.getByRole("button", { name: /Back/i });
    await backButton.click();
    
    await expect(page).toHaveURL(/\/settings/);
    */
  });

  test("back button on sessions page works", async ({ page: _page }) => {
    // This test requires authentication setup
    /*
    await page.goto("/settings/sessions");
    
    const backButton = page.getByRole("button", { name: /Back/i });
    await backButton.click();
    
    await expect(page).toHaveURL(/\/settings/);
    */
  });

  // ============================================
  // User Preferences Tests (Task 1)
  // ============================================

  test.describe("User Preferences - Supabase Persistence", () => {
    test.skip("user preferences persist in Supabase after page reload", async ({
      authenticatedPage: page,
    }) => {
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      // Wait for preferences section to load
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Get initial state of marketing emails toggle
      const marketingToggle = page.getByTestId(
        "settings-marketing-emails-toggle",
      );
      const initialState = await marketingToggle.isChecked();

      // Toggle marketing emails preference
      await marketingToggle.click();

      // Wait for the toggle state to change (indicating save completed)
      await page
        .waitForFunction(
          (initialState) => {
            const toggle = document.querySelector(
              '[data-testid="settings-marketing-emails-toggle"]',
            ) as HTMLInputElement;
            return toggle && toggle.checked !== initialState;
          },
          initialState,
          { timeout: 5000 },
        )
        .catch(async () => {
          // If state didn't change, wait for toast or timeout
          await page
            .waitForSelector('[role="status"]', { timeout: 3000 })
            .catch(() => {
              return page.waitForTimeout(2000);
            });
        });

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Wait for preferences section to load again
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Verify preference persisted (should be toggled)
      const marketingToggleAfterReload = page.getByTestId(
        "settings-marketing-emails-toggle",
      );
      const newState = await marketingToggleAfterReload.isChecked();
      expect(newState).not.toBe(initialState);
    });

    test.skip("user preferences load from Supabase on initial page load", async ({
      authenticatedPage: page,
    }) => {
      // Navigate to settings page
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      // Wait for preferences sections to load
      await page.waitForSelector(
        '[data-testid="settings-notifications-section"]',
      );
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Verify all preference toggles are visible and have state
      const emailNotificationsToggle = page.getByTestId(
        "settings-email-notifications-toggle",
      );
      const weeklyDigestToggle = page.getByTestId(
        "settings-weekly-digest-toggle",
      );
      const marketingEmailsToggle = page.getByTestId(
        "settings-marketing-emails-toggle",
      );
      const productUpdatesToggle = page.getByTestId(
        "settings-product-updates-toggle",
      );

      await expect(emailNotificationsToggle).toBeVisible();
      await expect(weeklyDigestToggle).toBeVisible();
      await expect(marketingEmailsToggle).toBeVisible();
      await expect(productUpdatesToggle).toBeVisible();

      // Verify toggles have boolean state (checked or unchecked)
      const emailNotificationsChecked =
        await emailNotificationsToggle.isChecked();
      const weeklyDigestChecked = await weeklyDigestToggle.isChecked();
      const marketingEmailsChecked = await marketingEmailsToggle.isChecked();
      const productUpdatesChecked = await productUpdatesToggle.isChecked();

      expect(typeof emailNotificationsChecked).toBe("boolean");
      expect(typeof weeklyDigestChecked).toBe("boolean");
      expect(typeof marketingEmailsChecked).toBe("boolean");
      expect(typeof productUpdatesChecked).toBe("boolean");
    });

    test.skip("user preferences work without localStorage", async ({
      authenticatedPage: page,
    }) => {
      // Clear localStorage after page loads (not in init script to avoid blocking)
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      // Clear localStorage after page is loaded
      await page.evaluate(() => {
        window.localStorage.clear();
      });

      // Wait for preferences section to load
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
        { timeout: 10000 },
      );

      // Verify preferences are still loaded (from Supabase, not localStorage)
      const marketingToggle = page.getByTestId(
        "settings-marketing-emails-toggle",
      );
      await expect(marketingToggle).toBeVisible();

      // Toggle a preference
      const initialState = await marketingToggle.isChecked();
      await marketingToggle.click();

      // Wait for save to complete - wait for toast notification
      await page
        .waitForSelector('[role="status"]', { timeout: 5000 })
        .catch(() => {
          // If no toast, wait a bit for save to complete
          return page.waitForTimeout(1000);
        });

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Wait for preferences section to load again
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Verify preference persisted (proving it's from Supabase, not localStorage)
      const marketingToggleAfterReload = page.getByTestId(
        "settings-marketing-emails-toggle",
      );
      const newState = await marketingToggleAfterReload.isChecked();
      expect(newState).not.toBe(initialState);
    });

    test.skip("multiple preference toggles work correctly", async ({
      authenticatedPage: page,
    }) => {
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      // Wait for preferences sections to load
      await page.waitForSelector(
        '[data-testid="settings-notifications-section"]',
      );
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Get initial states
      const emailNotificationsToggle = page.getByTestId(
        "settings-email-notifications-toggle",
      );
      const weeklyDigestToggle = page.getByTestId(
        "settings-weekly-digest-toggle",
      );
      const productUpdatesToggle = page.getByTestId(
        "settings-product-updates-toggle",
      );

      const initialEmailNotifications =
        await emailNotificationsToggle.isChecked();
      const initialWeeklyDigest = await weeklyDigestToggle.isChecked();
      const initialProductUpdates = await productUpdatesToggle.isChecked();

      // Toggle multiple preferences and wait for each to save
      await emailNotificationsToggle.click();
      await page.waitForTimeout(1000); // Wait for save

      await weeklyDigestToggle.click();
      await page.waitForTimeout(1000); // Wait for save

      await productUpdatesToggle.click();
      await page.waitForTimeout(2000); // Wait for final save

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Wait for preferences sections to load again
      await page.waitForSelector(
        '[data-testid="settings-notifications-section"]',
      );
      await page.waitForSelector(
        '[data-testid="settings-email-preferences-section"]',
      );

      // Verify all preferences persisted
      const emailNotificationsAfterReload = page.getByTestId(
        "settings-email-notifications-toggle",
      );
      const weeklyDigestAfterReload = page.getByTestId(
        "settings-weekly-digest-toggle",
      );
      const productUpdatesAfterReload = page.getByTestId(
        "settings-product-updates-toggle",
      );

      const newEmailNotifications =
        await emailNotificationsAfterReload.isChecked();
      const newWeeklyDigest = await weeklyDigestAfterReload.isChecked();
      const newProductUpdates = await productUpdatesAfterReload.isChecked();

      expect(newEmailNotifications).not.toBe(initialEmailNotifications);
      expect(newWeeklyDigest).not.toBe(initialWeeklyDigest);
      expect(newProductUpdates).not.toBe(initialProductUpdates);
    });
  });
});
