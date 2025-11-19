-- Check which migrations have been applied
-- Run this to see what's already in your database

-- Check if base tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '✅ 000_base_schema.sql - Base tables exist'
    ELSE '❌ 000_base_schema.sql - Base tables missing'
  END as migration_000_status;

-- Check if RLS policies from 001 exist
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'links' 
      AND policyname = 'links_owner_cud'
    ) AND EXISTS (
      SELECT 1 FROM pg_functions 
      WHERE proname = 'get_plan_by_slug'
    )
    THEN '✅ 001_rls_and_plan.sql - RLS and plan functions exist'
    ELSE '❌ 001_rls_and_plan.sql - Missing RLS or plan functions'
  END as migration_001_status;

-- Check if drops table exists (from 002)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drops')
    THEN '✅ 002_drops_and_submissions.sql - Drops table exists'
    ELSE '❌ 002_drops_and_submissions.sql - Drops table missing'
  END as migration_002_status;

-- Check if retention function exists (from 003)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_functions 
      WHERE proname = 'cleanup_old_submissions'
    )
    THEN '✅ 003_retention_job.sql - Retention function exists'
    ELSE '❌ 003_retention_job.sql - Retention function missing'
  END as migration_003_status;

-- Check if drop visibility columns exist (from 004)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'drops' 
      AND column_name = 'is_public'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'drops' 
      AND column_name = 'share_token'
    )
    THEN '✅ 004_drops_public_private.sql - Visibility columns exist'
    ELSE '❌ 004_drops_public_private.sql - Visibility columns missing'
  END as migration_004_status;

-- Check if settings tables exist (from 005)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences')
    THEN '✅ 005_settings_tables.sql - Settings tables exist'
    ELSE '❌ 005_settings_tables.sql - Settings tables missing'
  END as migration_005_status;

