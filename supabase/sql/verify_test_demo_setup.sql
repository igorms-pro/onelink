-- Comprehensive verification script for test/demo database setup
-- Run this to check if everything is properly configured for E2E tests
-- Works in Supabase SQL Editor

-- Test user ID (used in E2E tests)
-- User ID: 6a59c70e-dfea-40b4-b44f-7ad619369404

-- ============================================================================
-- 1. CHECK AUTH USER (auth.users)
-- ============================================================================
SELECT '=== 1. AUTH USER CHECK ===' as section;

SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_verified,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email not verified'
    ELSE '✅ Email verified'
  END as status
FROM auth.users 
WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid;

-- ============================================================================
-- 2. CHECK PUBLIC USER (public.users)
-- ============================================================================
SELECT '=== 2. PUBLIC USER CHECK ===' as section;

SELECT 
  id,
  email,
  plan,
  status,
  created_at,
  CASE 
    WHEN id IS NULL THEN '❌ User not in public.users table'
    ELSE '✅ User exists in public.users'
  END as status
FROM public.users 
WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid;

-- ============================================================================
-- 3. CHECK PROFILE
-- ============================================================================
SELECT '=== 3. PROFILE CHECK ===' as section;

SELECT 
  p.id as profile_id,
  p.user_id,
  p.slug,
  p.display_name,
  p.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ No profile found'
    WHEN p.slug IS NULL THEN '❌ Profile missing slug'
    ELSE '✅ Profile exists'
  END as status
FROM profiles p
WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid;

-- ============================================================================
-- 4. CHECK DROPS
-- ============================================================================
SELECT '=== 4. DROPS CHECK ===' as section;

SELECT 
  d.id as drop_id,
  d.label,
  d.is_public,
  d.share_token,
  d.max_file_size_mb,
  d.is_active,
  d.created_at,
  CASE 
    WHEN d.share_token IS NULL THEN '❌ Drop missing share_token'
    WHEN d.is_active = false THEN '⚠️ Drop is inactive'
    ELSE '✅ Drop is valid'
  END as status
FROM drops d
INNER JOIN profiles p ON d.profile_id = p.id
WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid
ORDER BY d.created_at DESC;

-- ============================================================================
-- 5. CHECK SUBMISSIONS
-- ============================================================================
SELECT '=== 5. SUBMISSIONS CHECK ===' as section;

SELECT 
  s.id as submission_id,
  s.name,
  s.email,
  s.note,
  s.read_at IS NULL as is_unread,
  s.created_at,
  d.label as drop_label,
  CASE 
    WHEN s.read_at IS NULL THEN '📬 Unread'
    ELSE '📭 Read'
  END as status
FROM submissions s
INNER JOIN drops d ON s.drop_id = d.id
INNER JOIN profiles p ON d.profile_id = p.id
WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid
ORDER BY s.created_at DESC;

-- ============================================================================
-- 6. SUMMARY STATISTICS
-- ============================================================================
SELECT '=== 6. SUMMARY STATISTICS ===' as section;

SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) as auth_user_exists,
  (SELECT COUNT(*) FROM public.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) as public_user_exists,
  (SELECT COUNT(*) FROM profiles WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) as profile_count,
  (SELECT COUNT(*) FROM drops d 
   INNER JOIN profiles p ON d.profile_id = p.id 
   WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) as drops_count,
  (SELECT COUNT(*) FROM drops d 
   INNER JOIN profiles p ON d.profile_id = p.id 
   WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid 
   AND d.share_token IS NOT NULL) as drops_with_token,
  (SELECT COUNT(*) FROM submissions s 
   INNER JOIN drops d ON s.drop_id = d.id 
   INNER JOIN profiles p ON d.profile_id = p.id 
   WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) as submissions_count,
  (SELECT COUNT(*) FROM submissions s 
   INNER JOIN drops d ON s.drop_id = d.id 
   INNER JOIN profiles p ON d.profile_id = p.id 
   WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid 
   AND s.read_at IS NULL) as unread_submissions_count;

-- ============================================================================
-- 7. OVERALL STATUS CHECK
-- ============================================================================
SELECT '=== 7. OVERALL STATUS ===' as section;

WITH checks AS (
  SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid AND email_confirmed_at IS NOT NULL) > 0 as auth_ok,
    (SELECT COUNT(*) FROM public.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) > 0 as public_user_ok,
    (SELECT COUNT(*) FROM profiles WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) > 0 as profile_ok,
    (SELECT COUNT(*) FROM drops d 
     INNER JOIN profiles p ON d.profile_id = p.id 
     WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid 
     AND d.share_token IS NOT NULL 
     AND d.is_active = true) > 0 as drops_ok,
    (SELECT COUNT(*) FROM submissions s 
     INNER JOIN drops d ON s.drop_id = d.id 
     INNER JOIN profiles p ON d.profile_id = p.id 
     WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) > 0 as submissions_ok
)
SELECT 
  CASE WHEN auth_ok THEN '✅' ELSE '❌' END as auth_user,
  CASE WHEN public_user_ok THEN '✅' ELSE '❌' END as public_user,
  CASE WHEN profile_ok THEN '✅' ELSE '❌' END as profile,
  CASE WHEN drops_ok THEN '✅' ELSE '❌' END as drops,
  CASE WHEN submissions_ok THEN '✅' ELSE '❌' END as submissions,
  CASE 
    WHEN auth_ok AND public_user_ok AND profile_ok AND drops_ok AND submissions_ok 
    THEN '✅ ALL CHECKS PASSED - Ready for E2E tests!'
    ELSE '❌ SOME CHECKS FAILED - Run setup_test_account_profile.sql to fix'
  END as overall_status
FROM checks;

-- ============================================================================
-- 8. QUICK FIX SUGGESTIONS
-- ============================================================================
SELECT '=== 8. QUICK FIX SUGGESTIONS ===' as section;

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) 
    THEN 'Run: create_test_user.sql (or create user manually in Supabase Dashboard)'
    WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) 
    THEN 'Run: setup_test_account_profile.sql (creates public.users row)'
    WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid) 
    THEN 'Run: setup_test_account_profile.sql (creates profile)'
    WHEN NOT EXISTS (
      SELECT 1 FROM drops d 
      INNER JOIN profiles p ON d.profile_id = p.id 
      WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid AND d.share_token IS NOT NULL
    )
    THEN 'Run: setup_test_account_profile.sql (creates drop with share_token)'
    WHEN NOT EXISTS (
      SELECT 1 FROM submissions s 
      INNER JOIN drops d ON s.drop_id = d.id 
      INNER JOIN profiles p ON d.profile_id = p.id 
      WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'::uuid
    )
    THEN 'Run: setup_test_account_profile.sql (creates test submissions)'
    ELSE '✅ Everything looks good!'
  END as recommendation;
