-- Check all users to see what's left
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM auth.users;

-- Check profiles
SELECT 
  p.id,
  p.user_id,
  p.slug as username,
  au.email
FROM public.profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;
