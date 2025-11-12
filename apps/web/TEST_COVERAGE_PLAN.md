# Test Coverage Plan - Target: 90-95%

**Current Coverage:** 35.69% statements, 30.65% branches, 30.09% functions, 36.84% lines  
**Target:** 90-95% coverage  
**Branch:** `15-unit-e2e-tests`

## Priority 1: Critical Components (Low Coverage)

### Settings Components (Current: 29.83% coverage)

#### 1. ChangePasswordForm (1.38% → 90%+)

**File:** `apps/web/src/routes/Settings/components/ChangePasswordForm.tsx`

- [ ] Test form rendering with all fields
- [ ] Test validation (current password required, new password min length, passwords match)
- [ ] Test password visibility toggle
- [ ] Test form submission success
- [ ] Test form submission error handling
- [ ] Test loading states
- [ ] Test error messages display

**Estimated:** 15-20 test cases

#### 2. ChangePasswordModal (52.94% → 90%+)

**File:** `apps/web/src/routes/Settings/components/ChangePasswordModal.tsx`

- [ ] Test modal open/close
- [ ] Test mobile drawer vs desktop dialog
- [ ] Test integration with ChangePasswordForm
- [ ] Test onOpenChange callback

**Estimated:** 5-8 test cases

#### 3. DataExport Components (0-23% → 90%+)

**Files:**

- `DataExportModal.tsx` (23.07%)
- `DataExportForm.tsx` (0%)
- `DataExportProgress.tsx` (0%)
- `DataExportReadyState.tsx` (0%)
- `DataExportActions.tsx` (0%)

**Tests needed:**

- [ ] DataExportForm: form rendering, checkbox selection, format selection
- [ ] DataExportProgress: progress display, loading states
- [ ] DataExportReadyState: download link display, expiration notice
- [ ] DataExportActions: download button, regenerate button
- [ ] DataExportModal: modal states, form integration

**Estimated:** 20-25 test cases

#### 4. DeleteAccount Components (0-35% → 90%+)

**Files:**

- `DeleteAccountModal.tsx` (35%)
- `DeleteAccountForm.tsx` (0%)
- `DeleteAccountWarning.tsx` (0%)

**Tests needed:**

- [ ] DeleteAccountWarning: warning display
- [ ] DeleteAccountForm: form rendering, password field, confirmation checkbox
- [ ] DeleteAccountForm: validation, submission, error handling
- [ ] DeleteAccountModal: modal states, form integration, mobile/desktop

**Estimated:** 15-20 test cases

#### 5. Other Settings Components

- [ ] PrivacySecuritySection (66.66% → 90%+): button clicks, navigation
- [ ] ActiveSessionsSection (57.14% → 90%+): navigation to sessions page
- [ ] EmailPreferencesSection (57.14% → 90%+): toggle switches, loading states
- [ ] NotificationsSection (100% ✅ - already covered)
- [ ] BillingSection (83.33% → 90%+): plan display, upgrade button
- [ ] CustomDomainSection (75% → 90%+): conditional rendering, navigation

**Estimated:** 15-20 test cases

### Hooks (Current: 68.42% coverage)

#### 1. useUserPreferences (0% → 90%+)

**File:** `apps/web/src/routes/Settings/hooks/useUserPreferences.ts`

- [ ] Test initial loading state
- [ ] Test loading from localStorage
- [ ] Test updatePreference function
- [ ] Test savePreferences function
- [ ] Test error handling
- [ ] Test toast notifications
- [ ] Test user ID requirement

**Estimated:** 10-12 test cases

#### 2. useDashboardData (0% → 90%+)

**File:** `apps/web/src/routes/Dashboard/hooks/useDashboardData.ts`

- [ ] Test data loading
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test profile data fetching
- [ ] Test links/drops fetching
- [ ] Test submissions fetching

**Estimated:** 8-10 test cases

#### 3. useSortableData (0% → 90%+)

**File:** `apps/web/src/hooks/useSortableData.ts`

- [ ] Test sorting by different columns
- [ ] Test sort direction toggle
- [ ] Test initial sort state
- [ ] Test sorted data output

**Estimated:** 6-8 test cases

#### 4. useScrollState (0% → 90%+)

**File:** `apps/web/src/hooks/useScrollState.ts`

- [ ] Test scroll position tracking
- [ ] Test scroll direction detection
- [ ] Test threshold values

**Estimated:** 5-6 test cases

#### 5. use-media-query (68.42% → 90%+)

**File:** `apps/web/src/hooks/use-media-query.ts`

- [ ] Test media query matching
- [ ] Test media query changes
- [ ] Test SSR handling

**Estimated:** 4-5 test cases

## Priority 2: Core Components

### Dashboard Components

- [ ] TabNavigation: tab switching, active state, submission count badge
- [ ] BottomNavigation: mobile navigation, active state
- [ ] DashboardSubHeader: plan display, upgrade button, sign out
- [ ] InboxTab: empty state, submission list, clear all button
- [ ] ContentTab: links section, drops section, limit reached message
- [ ] AccountTab: profile section, analytics section
- [ ] DropForm: form rendering, validation, submission
- [ ] DropList: list rendering, edit/delete actions, toggle switch
- [ ] LinksSection: expand/collapse, link list
- [ ] DropsSection: expand/collapse, drop list
- [ ] ProfileLinkCard: copy link, preview, QR code (Pro feature)

**Estimated:** 30-40 test cases

### Profile Components

- [ ] ProfileHeader: display name, bio, social links
- [ ] LinksSection: expand/collapse, link cards
- [ ] DropsSection: expand/collapse, submission form
- [ ] DropSubmissionForm: file upload, form submission, validation
- [ ] LinkCard: link rendering, click handling
- [ ] ErrorState: error message display
- [ ] LoadingState: loading indicator

**Estimated:** 20-25 test cases

### Shared Components

- [ ] OnboardingCarousel: carousel navigation, skip button, get started
- [ ] Header: mobile/desktop variants, navigation
- [ ] HeaderMobileDashboard: logo, settings button
- [ ] HeaderMobileSignIn: logo, theme/language toggles
- [ ] ThemeToggleButton: theme switching, dropdown
- [ ] LanguageToggleButton: language switching, dropdown
- [ ] Footer: links, copyright, powered by
- [ ] LegalPageLayout: layout structure, back button
- [ ] AnalyticsCard: date filter buttons, expand/collapse
- [ ] LinksAnalyticsCard: table rendering, sorting, loading states
- [ ] NewLinkForm: form rendering, validation, submission
- [ ] LinksList: list rendering, edit/delete actions

**Estimated:** 40-50 test cases

## Priority 3: Routes & Pages

### Main Routes

- [ ] Dashboard: route rendering, authentication check, redirect
- [ ] Auth: form rendering, email input, magic link sending
- [ ] Profile: public profile rendering, data loading
- [ ] Settings: route rendering, section display, navigation
- [ ] Pricing: plan comparison, upgrade buttons
- [ ] CheckoutSuccess: success message, navigation
- [ ] CheckoutCancel: cancel message, navigation
- [ ] Privacy: legal content rendering
- [ ] Terms: legal content rendering

**Estimated:** 15-20 test cases

### Settings Pages

- [ ] BillingPage: plan display, usage, payment method, invoices
- [ ] CustomDomainPage: domain form, domain list, DNS instructions
- [ ] SessionsPage: active sessions, login history, hash navigation
- [ ] TwoFactorPage: 2FA setup flow, QR code, backup codes, verification

**Estimated:** 20-25 test cases

## Priority 4: Utilities & Lib

### Lib Functions

- [ ] profile.ts (63.15% → 90%+): slug validation, profile formatting
- [ ] i18n.ts (80% → 90%+): translation loading, language switching
- [ ] domain.ts (100% ✅ - already covered)
- [ ] utils.ts (100% ✅ - already covered)

**Estimated:** 8-10 test cases

## Priority 5: E2E Tests (Playwright)

### Critical User Flows

- [ ] Onboarding flow: carousel navigation, skip, get started
- [ ] Authentication flow: sign in, magic link
- [ ] Dashboard navigation: tabs, content management
- [ ] Settings navigation: sections, modals
- [ ] Profile viewing: public profile, links, drops
- [ ] File submission: drop form, file upload

**Estimated:** 10-15 E2E test cases

## Implementation Strategy

### Phase 1: Settings Components (Highest Priority)

1. ChangePasswordForm + ChangePasswordModal
2. DataExport components (all 5 files)
3. DeleteAccount components (all 3 files)
4. Other Settings components

**Target:** 70%+ coverage

### Phase 2: Hooks

1. useUserPreferences
2. useDashboardData
3. useSortableData
4. useScrollState
5. use-media-query improvements

**Target:** 80%+ coverage

### Phase 3: Core Components

1. Dashboard components
2. Profile components
3. Shared components

**Target:** 85%+ coverage

### Phase 4: Routes & Pages

1. Main routes
2. Settings pages
3. Legal pages

**Target:** 90%+ coverage

### Phase 5: E2E Tests

1. Critical user flows
2. Integration tests

**Target:** Complete E2E coverage

## Test File Structure

```
apps/web/tests/
├── components/
│   ├── OnboardingCarousel.test.tsx
│   ├── Header.test.tsx
│   ├── ThemeToggleButton.test.tsx
│   ├── LanguageToggleButton.test.tsx
│   ├── Footer.test.tsx
│   ├── AnalyticsCard.test.tsx
│   ├── LinksAnalyticsCard.test.tsx
│   └── ...
├── routes/
│   ├── Dashboard/
│   │   ├── components/
│   │   │   ├── TabNavigation.test.tsx
│   │   │   ├── BottomNavigation.test.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useDashboardData.test.ts
│   ├── Settings/
│   │   ├── components/
│   │   │   ├── ChangePasswordForm.test.tsx
│   │   │   ├── ChangePasswordModal.test.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useUserPreferences.test.ts
│   └── Profile/
│       └── components/
│           └── ...
├── hooks/
│   ├── useSortableData.test.ts
│   ├── useScrollState.test.ts
│   └── use-media-query.test.ts
└── lib/
    ├── profile.test.ts (extend existing)
    └── i18n.test.ts (extend existing)
```

## Estimated Totals

- **Unit Tests:** ~200-250 test cases
- **E2E Tests:** ~10-15 test cases
- **Total Test Files:** ~50-60 files
- **Estimated Time:** 2-3 days for full implementation

## Notes

- All tests should work **without SQL/database** (use mocks)
- Use `vi.mock()` for Supabase, React Router, and other external dependencies
- Focus on component behavior, not implementation details
- Test user interactions, not internal state management
- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interactions
- Mock `window.matchMedia` for responsive tests
- Mock `localStorage` for preference tests

## Success Criteria

- [ ] Coverage ≥ 90% statements
- [ ] Coverage ≥ 90% branches
- [ ] Coverage ≥ 90% functions
- [ ] Coverage ≥ 90% lines
- [ ] All critical user flows have E2E tests
- [ ] All tests pass in CI/CD
- [ ] No flaky tests
