# Debug Summary: useUserPreferences Hook Issue

## Current Problem

The `useUserPreferences` hook is failing to fetch data from Supabase. The queries are timing out after 10 seconds, and **no `user_preferences` requests appear in the Network tab**. This prevents the "Notifications" and "Email Preferences" sections from displaying correctly.

**Key Symptoms:**
- Console logs show "Fetching preferences from Supabase..." but nothing after
- No network requests for `user_preferences` in the browser Network tab
- Other Supabase calls (for `links` and `drops` via `useDashboardData`) work correctly
- The issue occurs intermittently - works initially but fails on page reload

## Current Implementation

### File: `apps/web/src/routes/Settings/hooks/useUserPreferences.ts`

The hook has been refactored to match the pattern used in `useDashboardData` (which works):

```typescript
useEffect(() => {
  const userId = user?.id ?? null;
  
  if (!userId) {
    setPreferences(DEFAULT_PREFERENCES);
    return;
  }

  execute(async () => {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    // ... handle data/error
  });
}, [user?.id ?? null, execute]);
```

### Key Differences from Working Code

**useDashboardData (WORKS):**
- Uses `userId: string | null` parameter (not from `useAuth()`)
- Dependencies: `[userId, execute]`
- No `authLoading` check

**useUserPreferences (NOT WORKING):**
- Gets `user` from `useAuth()` hook
- Dependencies: `[user?.id ?? null, execute]`
- Includes `authLoading` in returned `loading` state

## Architecture Context

### Component Structure
- `Settings/index.tsx` calls `useUserPreferences()` once at parent level
- Passes `{...userPreferences}` as props to `NotificationsSection` and `EmailPreferencesSection`
- This was refactored to prevent multiple hook calls (previously each child called the hook)

### Database Schema
- Table: `public.user_preferences`
- RLS Policy: `user_preferences_owner_all` (users can only read/update their own preferences)
- Migration: `supabase/sql/005_settings_tables.sql` (already run)

### Related Working Code
- `apps/web/src/routes/Dashboard/hooks/useDashboardData.ts` - **WORKS** (fetches links, drops, etc.)
- `apps/web/src/routes/Settings/pages/SessionsPage/useSessions.ts` - **WORKS** (fetches sessions, login history)

## Previous Attempts

1. ✅ Removed `localStorage` fallback (now uses Supabase only)
2. ✅ Added `isSavingRef` to prevent rapid clicks
3. ✅ Added optimistic updates with rollback on error
4. ✅ Refactored to prevent multiple hook calls in child components
5. ✅ Removed `AbortController` and refs (`loadingUserIdRef`, `lastLoadedUserIdRef`)
6. ✅ Aligned `useEffect` pattern with `useDashboardData`
7. ✅ Removed redundant `supabase.auth.getSession()` call

## Potential Root Causes

1. **RLS Policy Issue**: The RLS policy might be blocking the query silently
2. **Auth State Timing**: `useAuth()` might not be ready when `useEffect` runs
3. **Supabase Client Issue**: The `supabase` client might not be properly initialized for this query
4. **Network/Connection Issue**: The query might be blocked at the network level
5. **Dependency Array Issue**: The `execute` function reference might be changing, causing re-renders

## Next Steps to Debug

1. **Compare with useSessions.ts**: It uses `useAuth()` and works - check the exact pattern
2. **Add more detailed logging**: Log the exact Supabase query being constructed
3. **Check RLS policies**: Verify the policy is correctly applied and allows the query
4. **Test with direct Supabase call**: Try calling the query directly in browser console
5. **Check auth state**: Verify `user` and `authLoading` states are correct when query runs
6. **Network inspection**: Check if the query is being blocked or filtered by browser/dev tools

## Files to Review

- `/Users/igorms/Documents/Dev/onelink/apps/web/src/routes/Settings/hooks/useUserPreferences.ts`
- `/Users/igorms/Documents/Dev/onelink/apps/web/src/routes/Dashboard/hooks/useDashboardData.ts` (working reference)
- `/Users/igorms/Documents/Dev/onelink/apps/web/src/routes/Settings/pages/SessionsPage/useSessions.ts` (working reference with useAuth)
- `/Users/igorms/Documents/Dev/onelink/apps/web/src/lib/AuthProvider.tsx`
- `/Users/igorms/Documents/Dev/onelink/apps/web/src/lib/supabase.ts`
- `/Users/igorms/Documents/Dev/onelink/supabase/sql/005_settings_tables.sql` (RLS policies)

## User's Frustration

The user has expressed frustration that "fetching data from the database should not be this difficult", especially since other Supabase calls work correctly. The goal is to make the `user_preferences` query work consistently, just like `links` and `drops` queries do.

