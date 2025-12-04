-- 009_cleanup_unverified_mfa_factors.sql
-- Script to manually clean up unverified MFA factors
-- Run this in Supabase SQL Editor if you're stuck with an unverified factor

-- ============================================
-- STEP 1: VIEW YOUR USER ID
-- ============================================
-- First, find your user ID by email
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'igorms.pro@gmail.com';  -- Replace with your email

-- ============================================
-- STEP 2: VIEW ALL MFA FACTORS (including unverified)
-- ============================================
-- See ALL factors for your user (verified and unverified)
SELECT 
  id,
  user_id,
  friendly_name,
  factor_type,
  status,
  created_at,
  updated_at
FROM auth.mfa_factors
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'igorms.pro@gmail.com')  -- Replace with your email
ORDER BY created_at DESC;

-- ============================================
-- STEP 3: VIEW ONLY UNVERIFIED FACTORS
-- ============================================
-- See only unverified factors (these block new enrollment)
SELECT 
  id,
  user_id,
  friendly_name,
  factor_type,
  status,
  created_at
FROM auth.mfa_factors
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'igorms.pro@gmail.com')  -- Replace with your email
  AND status = 'unverified'
ORDER BY created_at DESC;

-- ============================================
-- STEP 4: DELETE UNVERIFIED FACTORS
-- ============================================
-- Option A: Delete unverified factors for your user by email
DELETE FROM auth.mfa_factors
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'igorms.pro@gmail.com')  -- Replace with your email
  AND status = 'unverified';

-- Option B: Delete unverified factors for your user by user ID (if you know it)
-- Replace 'YOUR_USER_ID_HERE' with the ID from Step 1
DELETE FROM auth.mfa_factors
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND status = 'unverified';

-- Option C: Delete ALL unverified factors older than 24 hours (safer cleanup)
DELETE FROM auth.mfa_factors
WHERE status = 'unverified'
  AND created_at < NOW() - INTERVAL '24 hours';

