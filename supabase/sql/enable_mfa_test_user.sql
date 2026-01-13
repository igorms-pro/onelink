-- Enable MFA for test user
-- Note: Supabase MFA enrollment must be done via API, not SQL
-- This script helps check status and clean up, but enrollment requires API call
-- 
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Find test user ID
-- ============================================
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'test@example.com';

-- ============================================
-- STEP 2: Check current MFA status
-- ============================================
SELECT 
  mf.id,
  mf.user_id,
  au.email,
  mf.friendly_name,
  mf.factor_type,
  mf.status,
  mf.created_at,
  mf.updated_at
FROM auth.mfa_factors mf
JOIN auth.users au ON mf.user_id = au.id
WHERE au.email = 'test@example.com'
ORDER BY mf.created_at DESC;

-- ============================================
-- STEP 3: Clean up unverified factors (if any)
-- ============================================
-- Unverified factors can block new enrollment
DELETE FROM auth.mfa_factors
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com')
  AND status = 'unverified';

-- ============================================
-- STEP 4: Verify cleanup
-- ============================================
SELECT 
  COUNT(*) as unverified_count
FROM auth.mfa_factors
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com')
  AND status = 'unverified';

-- ============================================
-- ATTEMPT: Direct SQL Insert (may fail due to auth schema protection)
-- ============================================
-- WARNING: auth.mfa_factors is typically read-only for security
-- This might fail, but worth trying if you have superuser access

DO $$
DECLARE
  test_user_id uuid;
  factor_id uuid := gen_random_uuid();
  -- Generate a dummy secret (32 chars base32)
  dummy_secret text := 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found';
  END IF;

  -- Try to insert directly (this will likely fail with permission error)
  BEGIN
    INSERT INTO auth.mfa_factors (
      id,
      user_id,
      friendly_name,
      factor_type,
      status,
      secret,
      created_at,
      updated_at
    ) VALUES (
      factor_id,
      test_user_id,
      'Test MFA Factor',
      'totp',
      'verified',  -- Try to set as verified directly
      dummy_secret,
      NOW(),
      NOW()
    );

    RAISE NOTICE '✅ Successfully inserted MFA factor!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE '❌ Permission denied: auth.mfa_factors is protected';
      RAISE NOTICE 'You must use the Supabase API to enable MFA';
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Failed to insert: %', SQLERRM;
      RAISE NOTICE 'You must use the Supabase API to enable MFA';
  END;
END $$;

-- ============================================
-- FALLBACK: MFA Enrollment via API (if SQL fails)
-- ============================================
-- If the SQL insert above fails (which it likely will), use one of these:

-- Option 1: Enable manually in the app
--   1. Sign in as test@example.com
--   2. Go to Settings → 2FA
--   3. Click "Enable 2FA"
--   4. Scan QR code and verify

-- Option 2: Use Supabase Admin API
--   POST https://YOUR_PROJECT.supabase.co/auth/v1/admin/users/{user_id}/factors
--   Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--   Body: { "factor_type": "totp", "friendly_name": "Test MFA" }

-- ============================================
-- STEP 5: Verify MFA is enabled (after API enrollment)
-- ============================================
-- Run this after enabling MFA via API to verify it worked
SELECT 
  mf.id,
  mf.user_id,
  au.email,
  mf.friendly_name,
  mf.factor_type,
  mf.status,
  CASE 
    WHEN mf.status = 'verified' THEN '✅ MFA is ACTIVE'
    WHEN mf.status = 'unverified' THEN '⚠️ MFA enrolled but NOT verified'
    ELSE '❌ Unknown status'
  END as status_message,
  mf.created_at
FROM auth.mfa_factors mf
JOIN auth.users au ON mf.user_id = au.id
WHERE au.email = 'test@example.com'
ORDER BY mf.created_at DESC;
