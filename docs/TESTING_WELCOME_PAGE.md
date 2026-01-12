# Testing the Welcome Page

## Quick Start

### 1. Unit Tests ✅
```bash
cd apps/web

# Run all tests
pnpm test:ci

# Run welcome page tests only
pnpm test:ci src/routes/__tests__/Welcome.test.tsx
pnpm test:ci src/hooks/__tests__/useUsernameAvailability.test.ts
```

**Status:** All 18 tests passing ✅

### 2. E2E Tests

**Setup:**
1. Create `apps/web/.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
E2E_TEST_EMAIL=test@example.com
E2E_TEST_PASSWORD=testpassword123
```

2. Run tests:
```bash
cd apps/web

# Run all E2E tests
pnpm e2e:ci

# Run only welcome page tests
pnpm exec playwright test e2e/welcome.spec.ts

# Interactive UI mode
pnpm exec playwright test e2e/welcome.spec.ts --ui

# See browser (headed mode)
pnpm exec playwright test e2e/welcome.spec.ts --headed
```

**E2E Tests Coverage:**
- ✅ Redirects to welcome when user has no profile
- ✅ Welcome page loads with username input
- ✅ Username from localStorage is pre-filled
- ✅ Validates username format (invalid characters)
- ✅ Continue button disabled when username is taken
- ✅ Creates profile and redirects to dashboard

### 3. Manual Testing

**Start dev server:**
```bash
cd apps/web
pnpm dev
```

**Test scenarios:**

1. **New User Flow:**
   - Create a new account OR delete your profile from database
   - Navigate to `/dashboard`
   - Should redirect to `/welcome`

2. **Username Validation:**
   - Try `user@name` → Should show error
   - Try `user name` → Should show error
   - Try `ab` → Should show "must be at least 3 characters"
   - Try `a`.repeat(31) → Should show "must be at most 30 characters"

3. **Username Availability:**
   - Type `testuser123` → Wait 500ms → Should show "Available" or "Checking..."
   - Type a taken username → Should show "Username already taken"
   - Continue button should be disabled for invalid/taken usernames

4. **Profile Creation:**
   - Enter valid, available username
   - Click "Continue"
   - Should show loading state
   - Should redirect to `/dashboard`
   - Profile should be created in database

5. **localStorage Persistence:**
   - Enter username
   - Refresh page
   - Username should be pre-filled

## Test Files

- **Unit Tests:**
  - `apps/web/src/routes/__tests__/Welcome.test.tsx` - Welcome component tests
  - `apps/web/src/hooks/__tests__/useUsernameAvailability.test.ts` - Username availability hook tests

- **E2E Tests:**
  - `apps/web/e2e/welcome.spec.ts` - End-to-end welcome page flow tests

## Troubleshooting

**E2E tests skip:**
- Check that `.env.local` has all required variables
- Make sure Supabase credentials are valid
- Tests will skip if credentials are placeholders

**Unit tests timing out:**
- Fixed! Now using real timers (takes ~9s)
- All 18 tests passing reliably

**Manual testing - no redirect:**
- Make sure user has no profile (check `profiles` table)
- Check browser console for errors
- Verify routing in `apps/web/src/routes/App.tsx`
