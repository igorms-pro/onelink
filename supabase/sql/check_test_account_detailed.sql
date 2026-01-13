-- Detailed check - see what's actually in the database

-- 1. Check user
SELECT 'User' as type, id, email FROM auth.users WHERE id = '6a59c70e-dfea-40b4-b44f-7ad619369404';

-- 2. Check profile
SELECT 'Profile' as type, id, user_id, slug, display_name FROM profiles WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404';

-- 3. Check drops
SELECT 'Drops' as type, id, profile_id, label FROM drops 
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404');

-- 4. Check submissions count
SELECT 'Submissions Count' as type, COUNT(*) as count FROM submissions s
INNER JOIN drops d ON s.drop_id = d.id
INNER JOIN profiles p ON d.profile_id = p.id
WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404';

-- 5. Check unread submissions count
SELECT 'Unread Count' as type, COUNT(*) as count FROM submissions s
INNER JOIN drops d ON s.drop_id = d.id
INNER JOIN profiles p ON d.profile_id = p.id
WHERE p.user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404' AND s.read_at IS NULL;
