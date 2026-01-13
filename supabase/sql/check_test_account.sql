-- Check test account setup - simple one row result
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.slug,
  p.display_name,
  (SELECT COUNT(*)::int FROM drops WHERE profile_id = p.id) as drops,
  (SELECT COUNT(*)::int FROM submissions s 
   INNER JOIN drops d ON s.drop_id = d.id 
   WHERE d.profile_id = p.id) as submissions,
  (SELECT COUNT(*)::int FROM submissions s 
   INNER JOIN drops d ON s.drop_id = d.id 
   WHERE d.profile_id = p.id AND s.read_at IS NULL) as unread
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = '6a59c70e-dfea-40b4-b44f-7ad619369404'
LIMIT 1;
