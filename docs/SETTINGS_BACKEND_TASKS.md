# Settings Backend Integration Tasks

**Branch:** `31-update-from-localstorage-to-supabase`  
**Status:** In Progress  
**Goal:** Complete backend integration for Settings features

---

## Task Overview

### ✅ Already Completed
- **Task 2:** Session tracking (on login, create session record) - ✅ Done in `AuthProvider.tsx`
- **Task 3:** Login history logging (on auth events) - ✅ Done in `AuthProvider.tsx`

### 🔄 Remaining Tasks

1. **Task 1:** Update `useUserPreferences` hook to use Supabase instead of localStorage ✅ **COMPLETED**
2. **Task 4:** Implement 2FA backend encryption (TOTP secrets and backup codes)
3. **Task 5:** Connect billing page to Stripe API (invoices, payment methods, renewal date)

---

## Parallel Execution Strategy

**All 3 remaining tasks can be done simultaneously** - they are independent and touch different parts of the codebase:

- **Task 1** → Only touches `apps/web/src/routes/Settings/hooks/useUserPreferences.ts`
- **Task 4** → Only touches `apps/web/src/routes/Settings/pages/TwoFactor/useTwoFactor.ts` and encryption utilities
- **Task 5** → Only touches `apps/web/src/routes/Settings/pages/BillingPage.tsx` and billing utilities

**No conflicts expected** - each task modifies different files.

---

## Task 1: Remove localStorage Fallback from useUserPreferences ✅ **COMPLETED**

**File:** `apps/web/src/routes/Settings/hooks/useUserPreferences.ts`  
**Estimated Time:** 15 minutes  
**Priority:** Low (fallback is working, but we want to use Supabase only)  
**Status:** ✅ **COMPLETED**

### Changes Made
1. ✅ Removed all `localStorage.getItem()` calls in load function
2. ✅ Removed all `localStorage.setItem()` calls in save function
3. ✅ Updated error handling to show toast errors instead of silent fallback
4. ✅ Added translation key `settings_preferences_load_error` for error messages
5. ✅ Hook gracefully handles cases where table doesn't exist (shows error, uses defaults)

### Implementation Details
- **Load function:** Now shows toast error and uses defaults if Supabase query fails
- **Save function:** Removed localStorage backup saving, errors are shown via toast
- **Error handling:** All errors are logged to console and shown to user via toast notifications
- **No fallback:** Hook now uses Supabase exclusively, no localStorage fallback

### Files Modified
- ✅ `apps/web/src/routes/Settings/hooks/useUserPreferences.ts` - Removed all localStorage code
- ✅ `apps/web/src/lib/locales/en.json` - Added `settings_preferences_load_error` translation key

### Acceptance Criteria
- ✅ No localStorage code remains in `useUserPreferences.ts` (verified: 0 occurrences)
- ✅ All preferences are stored in Supabase only
- ✅ Error messages are user-friendly (toast notifications)
- ✅ Hook handles table missing gracefully (shows error, uses defaults)

---

## Task 4: Implement 2FA Backend Encryption

**Files:**
- `apps/web/src/routes/Settings/pages/TwoFactor/useTwoFactor.ts`
- Create: `apps/web/src/lib/utils/encryption.ts` (if doesn't exist)

**Estimated Time:** 1-2 hours  
**Priority:** Medium (security requirement)

### Current State
- 2FA TOTP generation and verification works
- Secrets and backup codes are stored in plaintext (TODOs on lines 138-139)
- Database has `user_2fa` table ready

### Requirements
1. Create encryption utility functions
2. Encrypt secrets before storing in database
3. Decrypt secrets when reading from database
4. Encrypt backup codes array before storing
5. Handle encryption/decryption errors gracefully

### Implementation Options

#### Option A: Use Web Crypto API (Recommended)
- Browser-native, no dependencies
- Use AES-GCM for authenticated encryption
- Store encryption key in environment variable or derive from user password

#### Option B: Use a library (e.g., `crypto-js`)
- Easier to use but adds dependency
- Less secure than Web Crypto API

### Steps
1. Create encryption utility file:
   ```typescript
   // apps/web/src/lib/utils/encryption.ts
   - encrypt(plaintext: string, key: string): string
   - decrypt(ciphertext: string, key: string): string
   - generateKey(): string (or use env var)
   ```

2. Update `useTwoFactor.ts`:
   - Encrypt `secret` before storing (line 138)
   - Encrypt `backupCodes` array before storing (line 139)
   - Decrypt when reading from database
   - Handle decryption errors (show error toast)

3. Consider key management:
   - Option 1: Use environment variable `VITE_ENCRYPTION_KEY`
   - Option 2: Derive key from user password (more secure, but requires password)
   - Option 3: Use Supabase Vault (if available)

### Testing
- Test encrypt/decrypt roundtrip
- Test 2FA setup flow with encryption
- Test 2FA verification with encrypted secret
- Test error handling when decryption fails
- Test backup codes encryption/decryption

### Security Notes
- Never log plaintext secrets
- Use authenticated encryption (AES-GCM)
- Consider key rotation strategy
- Document key management approach

### Acceptance Criteria
- ✅ Secrets are encrypted before storing
- ✅ Backup codes are encrypted before storing
- ✅ Decryption works correctly when reading
- ✅ Error handling for encryption/decryption failures
- ✅ No plaintext secrets in database
- ✅ Tests pass

---

## Task 5: Connect Billing Page to Stripe API

**Files:**
- `apps/web/src/routes/Settings/pages/BillingPage.tsx`
- `apps/web/src/routes/Settings/pages/Billing/SubscriptionSection.tsx`
- Create/Update: `apps/web/src/lib/billing.ts`

**Estimated Time:** 2-3 hours  
**Priority:** Medium (enhances user experience)

### Current State
- Billing page displays plan information
- `goToPortal()` and `goToCheckout()` functions work
- Missing: invoices list, payment methods, renewal date (TODO on line 72)

### Requirements
1. Fetch subscription details from Stripe (renewal date, status)
2. Fetch invoices list from Stripe
3. Fetch payment methods from Stripe
4. Display renewal date (replace placeholder)
5. Display invoices in a list
6. Display payment method (last 4 digits, brand)

### Implementation Approach

#### Option A: Use Supabase Edge Function (Recommended)
Create edge function `stripe-get-subscription` that:
- Gets user's Stripe customer ID from `profiles.stripe_id`
- Calls Stripe API to get subscription, invoices, payment methods
- Returns formatted data

#### Option B: Direct Stripe API calls from frontend
- Requires Stripe publishable key
- Less secure (exposes more to frontend)
- Simpler but not recommended for sensitive data

### Steps

1. **Create Edge Function** (if using Option A):
   ```
   supabase/functions/stripe-get-subscription/index.ts
   ```
   - Get user's `stripe_id` from database
   - Call Stripe API:
     - `customers.retrieve()` - get customer
     - `subscriptions.list()` - get active subscription
     - `invoices.list()` - get invoices
     - `paymentMethods.list()` - get payment methods
   - Return formatted data

2. **Update `billing.ts`**:
   ```typescript
   - getSubscriptionDetails(): Promise<SubscriptionDetails>
   - getInvoices(): Promise<Invoice[]>
   - getPaymentMethods(): Promise<PaymentMethod[]>
   ```

3. **Update `BillingPage.tsx`**:
   - Fetch subscription details on mount
   - Display renewal date (replace line 73 TODO)
   - Display invoices list
   - Display payment method

4. **Create components** (if needed):
   - `InvoicesList.tsx` - Display invoices
   - `PaymentMethodCard.tsx` - Display payment method

### Data Structures

```typescript
interface SubscriptionDetails {
  renewalDate: string | null;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  created: number;
  invoicePdf?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}
```

### Testing
- Test fetching subscription details
- Test fetching invoices (empty list, with invoices)
- Test fetching payment methods
- Test error handling (no Stripe customer, API errors)
- Test display of renewal date
- Test display of invoices list
- Test display of payment method

### Acceptance Criteria
- ✅ Renewal date is fetched from Stripe (no placeholder)
- ✅ Invoices list is displayed
- ✅ Payment method is displayed
- ✅ Error handling for missing Stripe customer
- ✅ Error handling for API failures
- ✅ Loading states while fetching
- ✅ Tests pass

---

## Testing Strategy

### Unit Tests
- Each task should have unit tests for new functions
- Mock Supabase/Stripe API calls
- Test error cases

### Integration Tests
- Test full flows (e.g., 2FA setup with encryption)
- Test billing page with real API structure

### Manual Testing
- Test in browser with real Supabase database
- Test 2FA encryption/decryption
- Test billing page with Stripe test mode

---

## Dependencies

### Task 1
- None (just code cleanup)

### Task 4
- Web Crypto API (browser-native) OR
- `crypto-js` package (if using library approach)

### Task 5
- Stripe API access
- Supabase Edge Function (if using Option A)
- Stripe test keys for testing

---

## Notes

- All tasks are independent and can be done in parallel
- No merge conflicts expected
- Each task should be tested independently
- Consider creating separate PRs for each task OR one PR with all tasks
- Document any new environment variables needed

---

## Completion Checklist

- [x] Task 1: Remove localStorage fallback ✅
- [ ] Task 4: Implement 2FA encryption
- [ ] Task 5: Connect billing to Stripe API
- [ ] All tests pass
- [ ] Manual testing completed
- [x] Documentation updated ✅
- [ ] Environment variables documented

