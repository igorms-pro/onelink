# Manual Testing Guide - Welcome Page

Based on the flow described in `docs/issues/ISSUE.md`, here's how to manually test the Welcome Page functionality.

## Prerequisites

1. **Start the dev server:**
```bash
cd apps/web
pnpm dev
```

2. **Have access to Supabase dashboard** (to check/delete profiles)

3. **Have a test email account** (for magic link authentication)

---

## Test Flow 1: New User (No Profile) - Email Magic Link

### Step 1: Prepare a New User
1. **Option A:** Create a completely new account with a new email
2. **Option B:** Delete existing profile from Supabase:
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - Find your user's profile (by `user_id`)
   - Delete the profile row
   - This simulates a "new user" without a profile

### Step 2: Authenticate
1. Navigate to `http://localhost:5173/auth` (or your dev URL)
2. Enter your email address
3. Click "Send magic link" or enter the code
4. Complete authentication

### Step 3: Verify Redirect to Welcome
✅ **Expected:** After authentication, you should be automatically redirected to `/welcome`

**Check:**
- URL should be `http://localhost:5173/welcome`
- You should see the Welcome page with username input
- You should NOT see the dashboard

### Step 4: Test Username Input

#### 4a. Test Invalid Characters
1. Try entering: `user@name`
   - ✅ **Expected:** Special characters should be filtered out automatically
   - ✅ **Expected:** Input should only contain: `username`

2. Try entering: `user name`
   - ✅ **Expected:** Spaces should be filtered out
   - ✅ **Expected:** Input should show: `username`

3. Try entering: `USERNAME`
   - ✅ **Expected:** Should be automatically converted to lowercase: `username`

#### 4b. Test Length Validation
1. Try entering: `ab` (too short)
   - ✅ **Expected:** Error message: "Username must be at least 3 characters"
   - ✅ **Expected:** Continue button should be disabled

2. Try entering: `a`.repeat(31) (too long)
   - ✅ **Expected:** Error message: "Username must be at most 30 characters"
   - ✅ **Expected:** Continue button should be disabled

#### 4c. Test Availability Check (Real-time)
1. Enter a username: `testuser123`
   - ✅ **Expected:** After ~500ms, should show "Checking availability..."
   - ✅ **Expected:** Then show either:
     - "✓ Available" (if username is free)
     - "✗ Username already taken" (if username exists)

2. Try a taken username (e.g., `admin` or any existing username)
   - ✅ **Expected:** Should show "Username already taken"
   - ✅ **Expected:** Continue button should be disabled

3. Try a unique username
   - ✅ **Expected:** Should show "Available"
   - ✅ **Expected:** Continue button should be enabled

### Step 5: Test Profile Creation
1. Enter a valid, available username (e.g., `myuniquename123`)
2. Click "Continue" button
   - ✅ **Expected:** Button should show loading state ("Creating profile...")
   - ✅ **Expected:** Button should be disabled during creation
   - ✅ **Expected:** After success, should redirect to `/dashboard`
   - ✅ **Expected:** Profile should be created in Supabase `profiles` table

### Step 6: Verify Profile Creation
1. Check Supabase Dashboard:
   - Go to Table Editor → `profiles`
   - Find your user's profile
   - ✅ **Expected:** `slug` should match the username you entered
   - ✅ **Expected:** `user_id` should match your authenticated user

---

## Test Flow 2: localStorage Persistence

### Step 1: Enter Username
1. Navigate to `/welcome` (as a new user)
2. Enter a username: `mytestuser`
3. **Don't click Continue yet**

### Step 2: Refresh Page
1. Refresh the browser (F5 or Cmd+R)
   - ✅ **Expected:** Username should be pre-filled from localStorage
   - ✅ **Expected:** Availability check should run again automatically

### Step 3: Verify localStorage
1. Open browser DevTools → Application → Local Storage
2. Look for key: `onelink_pending_username`
   - ✅ **Expected:** Value should be the username you entered

---

## Test Flow 3: Direct Navigation to Welcome

### Step 1: Navigate Directly
1. As an authenticated user WITHOUT a profile
2. Navigate directly to: `http://localhost:5173/welcome`
   - ✅ **Expected:** Should show the Welcome page
   - ✅ **Expected:** Should NOT redirect away

### Step 2: Try to Access Dashboard
1. As an authenticated user WITHOUT a profile
2. Navigate to: `http://localhost:5173/dashboard`
   - ✅ **Expected:** Should automatically redirect to `/welcome`
   - ✅ **Expected:** Should NOT show dashboard

---

## Test Flow 4: User WITH Profile

### Step 1: Ensure Profile Exists
1. Make sure your user has a profile in Supabase
2. (Or complete Test Flow 1 to create a profile)

### Step 2: Authenticate
1. Log out and log back in
2. After authentication:
   - ✅ **Expected:** Should redirect directly to `/dashboard`
   - ✅ **Expected:** Should NOT show Welcome page

### Step 3: Try to Access Welcome
1. Navigate to: `http://localhost:5173/welcome`
   - ✅ **Expected:** Should redirect to `/dashboard`
   - ✅ **Expected:** Users with profiles should not see Welcome page

---

## Test Flow 5: Error Handling

### Step 5a: Network Error
1. Open DevTools → Network tab
2. Set network to "Offline" or block Supabase requests
3. Enter a valid username
4. Click "Continue"
   - ✅ **Expected:** Should show error message
   - ✅ **Expected:** Should NOT redirect
   - ✅ **Expected:** Error toast notification

### Step 5b: Username Taken (Race Condition)
1. Open two browser windows/tabs
2. In both, enter the same username
3. Click "Continue" in both simultaneously
   - ✅ **Expected:** One should succeed, one should show error
   - ✅ **Expected:** Error message: "Username is already taken"

---

## Visual/UI Checks

Based on **Design Requirements** from ISSUE.md:

✅ **Style:**
- Should look similar to Auth page (logo, background, centered)
- Should have the same visual style

✅ **Username Input:**
- Should show prefix: `app.getonelink.io/` (or your domain)
- Input field should be clearly visible

✅ **Availability Indicator:**
- ✓ Available (green checkmark)
- ✗ Username already taken (red X)
- ⏳ Checking availability... (loading spinner)

✅ **Help Message:**
- Should show: "You can always change it later"

✅ **Continue Button:**
- Should be disabled when:
  - Username is invalid (too short, too long, invalid chars)
  - Username is taken
  - Checking availability
- Should be enabled when:
  - Username is valid AND available

---

## Checklist

- [ ] New user redirects to `/welcome` after auth
- [ ] User with profile redirects to `/dashboard` after auth
- [ ] Invalid characters are filtered automatically
- [ ] Username length validation works (min 3, max 30)
- [ ] Real-time availability check works (debounce ~500ms)
- [ ] Continue button disabled for invalid/taken usernames
- [ ] Continue button enabled for valid/available usernames
- [ ] Profile creation works and redirects to dashboard
- [ ] localStorage persistence works (username pre-filled on refresh)
- [ ] Direct navigation to `/welcome` works for users without profile
- [ ] Direct navigation to `/dashboard` redirects to `/welcome` for users without profile
- [ ] Error handling works (network errors, race conditions)
- [ ] UI matches design requirements (style, indicators, messages)

---

## Quick Test Commands

```bash
# Start dev server
cd apps/web
pnpm dev

# Check if profile exists (Supabase SQL)
SELECT * FROM profiles WHERE user_id = 'your-user-id';

# Delete profile to test new user flow (Supabase SQL)
DELETE FROM profiles WHERE user_id = 'your-user-id';
```

---

## Troubleshooting

**Issue:** Not redirecting to `/welcome`
- Check: Does user have a profile? (Check Supabase `profiles` table)
- Check: Is `getOrCreateProfile()` returning `null` for new users?
- Check: Browser console for errors

**Issue:** Username availability not checking
- Check: Network tab - are Supabase requests being made?
- Check: Browser console for errors
- Check: Is `useUsernameAvailability` hook working?

**Issue:** Profile not being created
- Check: Network tab - is Edge Function being called?
- Check: Supabase Edge Function logs
- Check: Browser console for errors
- Check: Is user authenticated? (Check `user` object)

---

## Notes

- The Welcome page should only show for users **without** a profile
- Users with existing profiles should go directly to dashboard
- The flow works for both email magic link AND social auth (when implemented)
- Username is stored in localStorage as `onelink_pending_username` for persistence
