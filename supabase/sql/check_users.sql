-- Check users in different tables

-- 1. Count users in auth.users (Supabase Auth table)
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- 2. Count users in public.users (if exists)
SELECT COUNT(*) as public_users_count FROM public.users;

-- 3. Count profiles in public.profiles
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- 4. Detailed view of auth.users (without sensitive data)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 5. Detailed view of public.users (if exists)
SELECT * FROM public.users
ORDER BY created_at DESC;

-- 6. Detailed view of profiles
SELECT 
  id,
  user_id,
  slug,
  display_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

