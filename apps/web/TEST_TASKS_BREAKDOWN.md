# Test Tasks Breakdown - Ready for Dispatch

## Agent Assignments

### Agent 1: Settings - Change Password Components

**Files to test:**

- `apps/web/src/routes/Settings/components/ChangePasswordForm.tsx`
- `apps/web/src/routes/Settings/components/ChangePasswordModal.tsx`

**Test file:** `apps/web/tests/routes/Settings/components/ChangePasswordForm.test.tsx`  
**Test file:** `apps/web/tests/routes/Settings/components/ChangePasswordModal.test.tsx`

**Tasks:**

1. Test ChangePasswordForm rendering with all fields
2. Test validation (current password, new password min length, passwords match)
3. Test password visibility toggle
4. Test form submission success/error
5. Test loading states
6. Test ChangePasswordModal open/close
7. Test mobile drawer vs desktop dialog
8. Test modal integration with form

**Estimated:** 20-25 test cases

---

### Agent 2: Settings - Data Export Components

**Files to test:**

- `apps/web/src/routes/Settings/components/DataExportModal.tsx`
- `apps/web/src/routes/Settings/components/DataExport/DataExportForm.tsx`
- `apps/web/src/routes/Settings/components/DataExport/DataExportProgress.tsx`
- `apps/web/src/routes/Settings/components/DataExport/DataExportReadyState.tsx`
- `apps/web/src/routes/Settings/components/DataExport/DataExportActions.tsx`

**Test files:** `apps/web/tests/routes/Settings/components/DataExport/*.test.tsx`

**Tasks:**

1. Test DataExportForm: rendering, checkbox selection, format selection
2. Test DataExportProgress: progress display, loading states
3. Test DataExportReadyState: download link, expiration notice
4. Test DataExportActions: download button, regenerate button
5. Test DataExportModal: modal states, form integration

**Estimated:** 20-25 test cases

---

### Agent 3: Settings - Delete Account Components

**Files to test:**

- `apps/web/src/routes/Settings/components/DeleteAccountModal.tsx`
- `apps/web/src/routes/Settings/components/DeleteAccount/DeleteAccountForm.tsx`
- `apps/web/src/routes/Settings/components/DeleteAccount/DeleteAccountWarning.tsx`

**Test files:** `apps/web/tests/routes/Settings/components/DeleteAccount/*.test.tsx`

**Tasks:**

1. Test DeleteAccountWarning: warning display
2. Test DeleteAccountForm: form rendering, password field, confirmation checkbox
3. Test DeleteAccountForm: validation, submission, error handling
4. Test DeleteAccountModal: modal states, form integration, mobile/desktop

**Estimated:** 15-20 test cases

---

### Agent 4: Settings - Other Components

**Files to test:**

- `apps/web/src/routes/Settings/components/PrivacySecuritySection.tsx`
- `apps/web/src/routes/Settings/components/ActiveSessionsSection.tsx`
- `apps/web/src/routes/Settings/components/EmailPreferencesSection.tsx`
- `apps/web/src/routes/Settings/components/BillingSection.tsx`
- `apps/web/src/routes/Settings/components/CustomDomainSection.tsx`

**Test files:** `apps/web/tests/routes/Settings/components/*.test.tsx`

**Tasks:**

1. Test PrivacySecuritySection: button clicks, navigation
2. Test ActiveSessionsSection: navigation to sessions page
3. Test EmailPreferencesSection: toggle switches, loading states
4. Test BillingSection: plan display, upgrade button
5. Test CustomDomainSection: conditional rendering, navigation

**Estimated:** 15-20 test cases

---

### Agent 5: Settings Hooks

**Files to test:**

- `apps/web/src/routes/Settings/hooks/useUserPreferences.ts`

**Test file:** `apps/web/tests/routes/Settings/hooks/useUserPreferences.test.ts`

**Tasks:**

1. Test initial loading state
2. Test loading from localStorage
3. Test updatePreference function
4. Test savePreferences function
5. Test error handling
6. Test toast notifications
7. Test user ID requirement

**Estimated:** 10-12 test cases

---

### Agent 6: Dashboard Hooks & Components

**Files to test:**

- `apps/web/src/routes/Dashboard/hooks/useDashboardData.ts`
- `apps/web/src/routes/Dashboard/components/TabNavigation.tsx`
- `apps/web/src/routes/Dashboard/components/BottomNavigation.tsx`
- `apps/web/src/routes/Dashboard/components/DashboardSubHeader.tsx`

**Test files:**

- `apps/web/tests/routes/Dashboard/hooks/useDashboardData.test.ts`
- `apps/web/tests/routes/Dashboard/components/*.test.tsx`

**Tasks:**

1. Test useDashboardData: data loading, loading states, error handling
2. Test TabNavigation: tab switching, active state, submission count badge
3. Test BottomNavigation: mobile navigation, active state
4. Test DashboardSubHeader: plan display, upgrade button, sign out

**Estimated:** 15-20 test cases

---

### Agent 7: Dashboard Content Components

**Files to test:**

- `apps/web/src/routes/Dashboard/components/InboxTab.tsx`
- `apps/web/src/routes/Dashboard/components/ContentTab.tsx`
- `apps/web/src/routes/Dashboard/components/AccountTab.tsx`
- `apps/web/src/routes/Dashboard/components/DropForm.tsx`
- `apps/web/src/routes/Dashboard/components/DropList.tsx`

**Test files:** `apps/web/tests/routes/Dashboard/components/*.test.tsx`

**Tasks:**

1. Test InboxTab: empty state, submission list, clear all button
2. Test ContentTab: links section, drops section, limit reached message
3. Test AccountTab: profile section, analytics section
4. Test DropForm: form rendering, validation, submission
5. Test DropList: list rendering, edit/delete actions, toggle switch

**Estimated:** 20-25 test cases

---

### Agent 8: Dashboard Sections & Analytics

**Files to test:**

- `apps/web/src/routes/Dashboard/components/LinksSection.tsx`
- `apps/web/src/routes/Dashboard/components/DropsSection.tsx`
- `apps/web/src/routes/Dashboard/components/ProfileLinkCard.tsx`
- `apps/web/src/components/AnalyticsCard.tsx`
- `apps/web/src/components/LinksAnalyticsCard.tsx`

**Test files:** `apps/web/tests/routes/Dashboard/components/*.test.tsx`  
**Test files:** `apps/web/tests/components/*.test.tsx`

**Tasks:**

1. Test LinksSection: expand/collapse, link list
2. Test DropsSection: expand/collapse, drop list
3. Test ProfileLinkCard: copy link, preview, QR code (Pro feature)
4. Test AnalyticsCard: date filter buttons, expand/collapse
5. Test LinksAnalyticsCard: table rendering, sorting, loading states

**Estimated:** 20-25 test cases

---

### Agent 9: Profile Components

**Files to test:**

- `apps/web/src/routes/Profile/components/ProfileHeader.tsx`
- `apps/web/src/routes/Profile/components/LinksSection.tsx`
- `apps/web/src/routes/Profile/components/DropsSection.tsx`
- `apps/web/src/routes/Profile/components/DropSubmissionForm.tsx`
- `apps/web/src/routes/Profile/components/LinkCard.tsx`

**Test files:** `apps/web/tests/routes/Profile/components/*.test.tsx`

**Tasks:**

1. Test ProfileHeader: display name, bio, social links
2. Test LinksSection: expand/collapse, link cards
3. Test DropsSection: expand/collapse, submission form
4. Test DropSubmissionForm: file upload, form submission, validation
5. Test LinkCard: link rendering, click handling

**Estimated:** 20-25 test cases

---

### Agent 10: Shared Components

**Files to test:**

- `apps/web/src/components/OnboardingCarousel.tsx`
- `apps/web/src/components/Header.tsx`
- `apps/web/src/components/HeaderMobileDashboard.tsx`
- `apps/web/src/components/HeaderMobileSignIn.tsx`
- `apps/web/src/components/ThemeToggleButton.tsx`
- `apps/web/src/components/LanguageToggleButton.tsx`

**Test files:** `apps/web/tests/components/*.test.tsx`

**Tasks:**

1. Test OnboardingCarousel: carousel navigation, skip button, get started
2. Test Header: mobile/desktop variants, navigation
3. Test HeaderMobileDashboard: logo, settings button
4. Test HeaderMobileSignIn: logo, theme/language toggles
5. Test ThemeToggleButton: theme switching, dropdown
6. Test LanguageToggleButton: language switching, dropdown

**Estimated:** 25-30 test cases

---

### Agent 11: More Shared Components & Utils

**Files to test:**

- `apps/web/src/components/Footer.tsx`
- `apps/web/src/components/LegalPageLayout.tsx`
- `apps/web/src/components/NewLinkForm.tsx`
- `apps/web/src/components/LinksList.tsx`
- `apps/web/src/hooks/useSortableData.ts`
- `apps/web/src/hooks/useScrollState.ts`

**Test files:**

- `apps/web/tests/components/*.test.tsx`
- `apps/web/tests/hooks/*.test.ts`

**Tasks:**

1. Test Footer: links, copyright, powered by
2. Test LegalPageLayout: layout structure, back button
3. Test NewLinkForm: form rendering, validation, submission
4. Test LinksList: list rendering, edit/delete actions
5. Test useSortableData: sorting by columns, sort direction toggle
6. Test useScrollState: scroll position tracking, direction detection

**Estimated:** 20-25 test cases

---

### Agent 12: Routes & Pages

**Files to test:**

- `apps/web/src/routes/Dashboard/index.tsx`
- `apps/web/src/routes/Auth.tsx`
- `apps/web/src/routes/Profile/index.tsx`
- `apps/web/src/routes/Settings/index.tsx`
- `apps/web/src/routes/Pricing.tsx`
- `apps/web/src/routes/Checkout/Success.tsx`
- `apps/web/src/routes/Checkout/Cancel.tsx`
- `apps/web/src/routes/Legal/Privacy.tsx`
- `apps/web/src/routes/Legal/Terms.tsx`

**Test files:** `apps/web/tests/routes/*.test.tsx`

**Tasks:**

1. Test Dashboard: route rendering, authentication check, redirect
2. Test Auth: form rendering, email input, magic link sending
3. Test Profile: public profile rendering, data loading
4. Test Settings: route rendering, section display, navigation
5. Test Pricing: plan comparison, upgrade buttons
6. Test CheckoutSuccess: success message, navigation
7. Test CheckoutCancel: cancel message, navigation
8. Test Privacy: legal content rendering
9. Test Terms: legal content rendering

**Estimated:** 15-20 test cases

---

### Agent 13: Settings Pages

**Files to test:**

- `apps/web/src/routes/Settings/pages/BillingPage.tsx`
- `apps/web/src/routes/Settings/pages/CustomDomainPage.tsx`
- `apps/web/src/routes/Settings/pages/SessionsPage.tsx`
- `apps/web/src/routes/Settings/pages/TwoFactorPage.tsx`

**Test files:** `apps/web/tests/routes/Settings/pages/*.test.tsx`

**Tasks:**

1. Test BillingPage: plan display, usage, payment method, invoices
2. Test CustomDomainPage: domain form, domain list, DNS instructions
3. Test SessionsPage: active sessions, login history, hash navigation
4. Test TwoFactorPage: 2FA setup flow, QR code, backup codes, verification

**Estimated:** 20-25 test cases

---

### Agent 14: Hooks & Lib Improvements

**Files to test:**

- `apps/web/src/hooks/use-media-query.ts`
- `apps/web/src/lib/profile.ts` (extend existing)
- `apps/web/src/lib/i18n.ts` (extend existing)

**Test files:**

- `apps/web/tests/hooks/use-media-query.test.ts`
- `apps/web/tests/lib/profile.test.ts` (extend)
- `apps/web/tests/lib/i18n.test.ts` (extend)

**Tasks:**

1. Test use-media-query: media query matching, changes, SSR handling
2. Extend profile.ts tests: slug validation, profile formatting edge cases
3. Extend i18n.ts tests: translation loading edge cases, language switching

**Estimated:** 10-12 test cases

---

### Agent 15: E2E Tests (Playwright)

**Files to create:**

- `apps/web/e2e/onboarding.spec.ts`
- `apps/web/e2e/dashboard.spec.ts`
- `apps/web/e2e/settings.spec.ts`
- `apps/web/e2e/profile.spec.ts`
- `apps/web/e2e/file-submission.spec.ts`

**Tasks:**

1. Test onboarding flow: carousel navigation, skip, get started
2. Test dashboard navigation: tabs, content management
3. Test settings navigation: sections, modals
4. Test profile viewing: public profile, links, drops
5. Test file submission: drop form, file upload

**Estimated:** 10-15 E2E test cases

---

## Summary

- **Total Agents:** 15
- **Total Estimated Test Cases:** ~250-300 unit tests + ~10-15 E2E tests
- **Total Test Files:** ~60-70 files
- **Target Coverage:** 90-95%

## Quick Start for Each Agent

1. Read the component/hook file you're testing
2. Create test file in appropriate location
3. Set up mocks for dependencies (Supabase, React Router, etc.)
4. Write tests for:
   - Component rendering
   - User interactions
   - Edge cases
   - Error states
   - Loading states
5. Run tests: `pnpm test`
6. Check coverage: `pnpm coverage`
7. Ensure tests pass in CI: `pnpm test:ci`

## Common Mock Patterns

```typescript
// Supabase mock
vi.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: { signOut: vi.fn(), getUser: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

// React Router mock
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

// Auth mock
vi.mock("../src/lib/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    loading: false,
    signOut: vi.fn(),
  }),
}));
```
