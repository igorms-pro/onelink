-- Check users and profiles for test account

-- Check user in auth.users
SELECT 'auth.users' as table_name, id, email, email_confirmed_at 
FROM auth.users 
WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404';

-- Check user in public.users
SELECT 'public.users' as table_name, id, email, plan 
FROM public.users 
WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404';

-- Check profile
SELECT 'profiles' as table_name, id, user_id, slug, display_name, created_at 
FROM profiles 
WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404';
