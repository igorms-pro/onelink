-- Auto-verify test user for E2E tests
-- Run this script in Supabase SQL Editor or via CLI
-- 
-- Usage:
--   psql $DATABASE_URL -f create_test_user.sql
--   OR run in Supabase Dashboard → SQL Editor
--
-- This script will:
-- 1. Check if test user exists
-- 2. Auto-verify the user's email (set email_confirmed_at)
-- 3. Ensure the user can sign in without email confirmation

DO $$
DECLARE
  test_user_id uuid := '6a59c70e-dfea-40b4-b44f-7ad619369404';
  test_email text := 'test@example.com';
  user_exists boolean;
BEGIN
  -- Check if the specific user ID exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = test_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Fallback: try to find by email
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email = test_email;
    
    IF test_user_id IS NULL THEN
      RAISE NOTICE 'Test user not found with ID: 6a59c70e-dfea-40b4-b44f-7ad619369404';
      RAISE NOTICE 'Test user not found with email: %', test_email;
      RAISE NOTICE 'Please create the user first via:';
      RAISE NOTICE '1. Supabase Dashboard → Authentication → Users → Add user';
      RAISE NOTICE '   - Email: %', test_email;
      RAISE NOTICE '   - Password: testpassword123';
      RAISE NOTICE '   - Check "Auto Confirm User" when creating';
      RAISE NOTICE '2. Then run this script again to ensure verification';
      RETURN;
    END IF;
  END IF;

  -- Auto-verify the user by setting email_confirmed_at
  -- Note: confirmed_at is a generated column and will be set automatically
  -- This allows the user to sign in without email confirmation
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = test_user_id
    AND email_confirmed_at IS NULL;

  IF FOUND THEN
    RAISE NOTICE '✓ Test user verified successfully!';
    RAISE NOTICE '  User ID: %', test_user_id;
    RAISE NOTICE '  Email: %', test_email;
    RAISE NOTICE '  Email confirmed at: %', (SELECT email_confirmed_at FROM auth.users WHERE id = test_user_id);
  ELSE
    RAISE NOTICE 'Test user already verified';
    RAISE NOTICE '  User ID: %', test_user_id;
    RAISE NOTICE '  Email: %', test_email;
  END IF;

END $$;

-- Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404' OR email = 'test@example.com';
