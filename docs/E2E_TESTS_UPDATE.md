# E2E Tests Update Tasks

**Branch:** `31-update-from-localstorage-to-supabase` (or current branch)  
**Status:** Pending  
**Goal:** Add/update e2e tests to verify Settings backend integration changes

---

## Overview of Tasks

1. **Task 1:** Add e2e tests for User Preferences (Supabase persistence) ✅ **COMPLETED**
2. **Task 2:** Add e2e tests for Billing Page (Stripe API integration)
3. **Task 3:** Add e2e tests for 2FA flow (with encryption verification)
4. **Task 4:** Update existing Settings e2e tests to use authentication

---

## Parallel Execution Strategy

**Tasks 1, 2, and 3 can be done simultaneously** - they test different features and touch different files:
- **Task 1** → Only touches `settings-detailed.spec.ts` (user preferences section)
- **Task 2** → Only touches `settings-detailed.spec.ts` or new `billing.spec.ts` (billing section)
- **Task 3** → Only touches `settings-detailed.spec.ts` (2FA section)
- **Task 4** → Updates multiple test files but is independent

**No conflicts expected** - each task modifies different test cases.

---

## Task 1: Add E2E Tests for User Preferences (Supabase Persistence) ✅ **COMPLETED**

**File:** `apps/web/e2e/settings-detailed.spec.ts`  
**Estimated Time:** 1-2 hours  
**Priority:** High  
**Status:** ✅ **COMPLETED**

### Description
Add e2e tests to verify that user preferences are saved to and loaded from Supabase (not localStorage). This ensures the localStorage removal was successful.

### Implementation Completed

1. ✅ **Updated imports to use `authenticatedPage` fixture:**
   - Changed from `@playwright/test` to `../fixtures/auth`
   - All new tests use `authenticatedPage: page` parameter

2. ✅ **Added test for Supabase persistence after page reload:**
   - Test toggles marketing emails preference
   - Verifies preference persists after page reload
   - Uses `data-testid="settings-marketing-emails-toggle"` selector

3. ✅ **Added test for loading preferences from Supabase:**
   - Verifies all preference toggles are visible on initial page load
   - Verifies toggles have boolean state (checked/unchecked)
   - Tests: email notifications, weekly digest, marketing emails, product updates

4. ✅ **Added test to verify localStorage is NOT used:**
   - Clears localStorage before test using `page.addInitScript()`
   - Sets preferences and verifies they persist after reload
   - Proves data comes from Supabase, not localStorage

5. ✅ **Added test for multiple preference toggles:**
   - Tests toggling multiple preferences (email notifications, weekly digest, product updates)
   - Verifies all preferences persist correctly after reload

### Tests Added

1. `user preferences persist in Supabase after page reload` - Tests single toggle persistence
2. `user preferences load from Supabase on initial page load` - Tests initial load from DB
3. `user preferences work without localStorage` - Tests localStorage independence
4. `multiple preference toggles work correctly` - Tests multiple toggles persistence

### Testing Requirements

- ✅ Test that preferences persist after page reload
- ✅ Test that preferences load from Supabase on initial page load
- ✅ Test that localStorage is not required (clear localStorage, preferences still work)
- ✅ Test multiple preference toggles (marketing emails, product updates, etc.)

### Acceptance Criteria

- ✅ At least 2-3 e2e tests for user preferences (4 tests added)
- ✅ Tests use `authenticatedPage` fixture
- ✅ Tests verify Supabase persistence (not localStorage)
- ⏳ All tests pass in CI/CD (requires environment variables)

### Files Modified

- ✅ `apps/web/e2e/settings-detailed.spec.ts` - Added 4 new tests in "User Preferences - Supabase Persistence" describe block

### Notes

- Requires `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` environment variables
- Tests wait for async operations (preference save) with `waitForTimeout(2000)`
- Tests use `waitForSelector` to ensure sections are loaded before interactions
- All tests use `data-testid` selectors for stability

---

## Task 2: Add E2E Tests for Billing Page (Stripe API Integration)

**Files:**
- `apps/web/e2e/settings-detailed.spec.ts` OR
- `apps/web/e2e/billing.spec.ts` (new file)

**Estimated Time:** 2-3 hours  
**Priority:** High

### Description
Add e2e tests to verify that the Billing page correctly displays subscription details, invoices, and payment methods from the Stripe API.

### Implementation Steps

1. **Create or update billing test file:**
   - If creating new file: `apps/web/e2e/billing.spec.ts`
   - If updating existing: Add to `settings-detailed.spec.ts`

2. **Add test for subscription details display:**
   ```typescript
   test("billing page displays subscription details from Stripe", async ({
     authenticatedPage: page,
   }) => {
     // Mock Stripe API response
     await page.route(
       "**/functions/v1/stripe-get-subscription",
       async (route) => {
         await route.fulfill({
           status: 200,
           contentType: "application/json",
           body: JSON.stringify({
             subscription: {
               status: "active",
               renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
               currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
             },
             invoices: [],
             paymentMethods: [],
           }),
         });
       },
     );

     await page.goto("/settings/billing");
     
     // Wait for data to load
     await page.waitForLoadState("networkidle");
     
     // Verify subscription status is displayed
     await expect(page.getByText(/active/i)).toBeVisible();
     
     // Verify renewal date is displayed
     await expect(page.getByText(/renewal date/i)).toBeVisible();
   });
   ```

3. **Add test for invoices list:**
   - Mock Stripe API to return invoices
   - Verify invoices are displayed with correct amount, status, date
   - Verify invoice download links work

4. **Add test for payment methods:**
   - Mock Stripe API to return payment methods
   - Verify payment method card brand, last4, expiry are displayed

5. **Add error handling test:**
   - Mock Stripe API to return error
   - Verify page handles error gracefully (shows error message or loading state)

### Testing Requirements

- Test subscription details display (status, renewal date)
- Test invoices list display (amount, status, date, download links)
- Test payment methods display (brand, last4, expiry)
- Test error handling (API failures)
- Test loading states

### Acceptance Criteria

- ✅ At least 4-5 e2e tests for billing page
- ✅ Tests mock Stripe Edge Function responses
- ✅ Tests verify all displayed data (subscription, invoices, payment methods)
- ✅ Error handling test included
- ✅ All tests pass in CI/CD

### Notes

- Use `page.route()` to mock Stripe Edge Function responses
- Mock responses should match the actual API response structure
- Consider testing both success and error scenarios
- May need to wait for async data loading before assertions

---

## Task 3: Add E2E Tests for 2FA Flow (With Encryption Verification)

**File:** `apps/web/e2e/settings-detailed.spec.ts`  
**Estimated Time:** 2-3 hours  
**Priority:** Medium

### Description
Add e2e tests to verify the complete 2FA setup flow and optionally verify that data is encrypted in the database.

### Implementation Steps

1. **Uncomment and update existing 2FA tests:**
   - Use `authenticatedPage` fixture
   - Update selectors to match current implementation

2. **Add full 2FA setup flow test:**
   ```typescript
   test("2FA setup flow works end-to-end", async ({
     authenticatedPage: page,
   }) => {
     await page.goto("/settings/2fa");
     
     // Start setup
     const enableButton = page.getByRole("button", { name: /Enable 2FA/i });
     await enableButton.click();
     
     // Wait for QR code to generate
     await page.waitForTimeout(1000);
     
     // Verify QR code is displayed
     await expect(page.getByTestId("qr-code-display")).toBeVisible();
     
     // Verify secret key is displayed (visible during setup)
     await expect(page.getByTestId("secret-key-display")).toBeVisible();
     
     // Enter verification code
     // Note: In real test, you'd need to generate a valid TOTP code
     // For now, we can test the UI flow
     const codeInput = page.getByTestId("verification-code-input");
     await codeInput.fill("123456"); // Mock code
     
     // Verify and activate
     const verifyButton = page.getByTestId("verify-and-activate-button");
     await verifyButton.click();
     
     // Wait for activation
     await page.waitForTimeout(1000);
     
     // Verify 2FA is now active (or error if code was invalid)
     // In real test with valid code, should see active state
   });
   ```

3. **Add test for backup codes display:**
   - After successful 2FA setup, verify backup codes are shown
   - Test backup codes copy functionality

4. **Add test for 2FA disable flow:**
   - Test disabling 2FA with password
   - Verify 2FA is disabled after confirmation

5. **Optional: Add test for encryption verification:**
   - Requires direct Supabase database access in test
   - Query `user_2fa` table after setup
   - Verify `secret` and `backup_codes` fields are encrypted (not plaintext)
   - This is optional as it requires database access in e2e tests

### Testing Requirements

- Test full 2FA setup flow (enable → QR code → verify → activate)
- Test backup codes generation and display
- Test 2FA disable flow
- Optional: Test encryption in database

### Acceptance Criteria

- ✅ At least 3-4 e2e tests for 2FA flow
- ✅ Tests use `authenticatedPage` fixture
- ✅ Tests verify complete setup flow
- ✅ Tests verify backup codes display
- ✅ All tests pass in CI/CD
- ✅ Optional: Encryption verification test (if database access available)

### Notes

- TOTP code generation requires a library (e.g., `otplib`) or manual calculation
- Consider mocking TOTP verification for faster tests
- Encryption verification requires Supabase client in test environment
- May need to handle async operations (QR code generation, verification)

---

## Task 4: Update Existing Settings E2E Tests to Use Authentication

**Files:**
- `apps/web/e2e/settings.spec.ts`
- `apps/web/e2e/settings-detailed.spec.ts`

**Estimated Time:** 1 hour  
**Priority:** Medium

### Description
Uncomment and update existing Settings e2e tests to use the `authenticatedPage` fixture and ensure they work with current implementation.

### Implementation Steps

1. **Update imports:**
   ```typescript
   // Change from:
   import { test, expect } from "@playwright/test";
   
   // To:
   import { test, expect } from "../fixtures/auth";
   ```

2. **Update test signatures:**
   ```typescript
   // Change from:
   test("my test", async ({ page }) => {
   
   // To:
   test("my test", async ({ authenticatedPage: page }) => {
   ```

3. **Uncomment commented tests:**
   - Go through both files
   - Uncomment tests that are currently commented out
   - Update selectors to match current implementation
   - Update assertions to match current UI

4. **Fix any broken tests:**
   - Update selectors (use `data-testid` where available)
   - Fix navigation expectations
   - Update text matchers

5. **Add missing test cases:**
   - Fill gaps in test coverage
   - Add tests for error scenarios

### Testing Requirements

- All uncommented tests should pass
- Tests should use `authenticatedPage` fixture
- Tests should match current UI/UX
- No flaky tests

### Acceptance Criteria

- ✅ All existing tests uncommented and working
- ✅ Tests use `authenticatedPage` fixture
- ✅ All tests pass in CI/CD
- ✅ No broken selectors or assertions

### Notes

- Requires `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` environment variables
- May need to update selectors based on current implementation
- Consider adding `data-testid` attributes if missing for better test stability

---

## Environment Setup

### Required Environment Variables

```bash
# For authentication in e2e tests
E2E_TEST_EMAIL=test@example.com
E2E_TEST_PASSWORD=testpassword123

# Supabase credentials (already required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Helper Functions (Optional)

Consider creating helper functions in `apps/web/e2e/helpers/`:

- `supabase.ts` - For direct Supabase queries in tests
- `test-data.ts` - For setting up test data (preferences, 2FA, etc.)

---

## Current Status

- ✅ E2E test structure exists
- ✅ Authentication fixture available (`apps/web/e2e/fixtures/auth.ts`)
- ✅ Basic Settings tests exist (but commented out)
- ⏳ Need to add tests for new backend integrations
- ⏳ Need to uncomment and update existing tests

---

## Next Steps

1. **Start with Task 1** (User Preferences) - Highest priority, tests Supabase integration
2. **Then Task 2** (Billing Page) - Tests Stripe API integration
3. **Then Task 3** (2FA Flow) - Tests complete 2FA functionality
4. **Finally Task 4** (Update Existing) - Clean up and activate existing tests

All tasks can be done in parallel by different agents if needed.
