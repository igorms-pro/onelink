-- Setup test account profile for E2E tests
-- Simple script - creates profile, one drop, and one submission

-- Step 1: Ensure users row exists
INSERT INTO public.users (id, email)
VALUES ('6a59c70e-dfea-40b4-b44f-7ad619369404', 'test@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Step 2: Create profile (user_id is now unique, so this will update if exists)
INSERT INTO profiles (user_id, slug, display_name)
VALUES ('6a59c70e-dfea-40b4-b44f-7ad619369404', 'testuser', 'Test User')
ON CONFLICT (user_id) DO UPDATE SET slug = EXCLUDED.slug, display_name = EXCLUDED.display_name;

-- Step 3: Create one drop and one submission
DO $$
DECLARE
  v_profile_id uuid;
  v_drop_id uuid;
BEGIN
  -- Get profile ID
  SELECT id INTO v_profile_id 
  FROM profiles 
  WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404';
  
  -- Create one drop if doesn't exist
  SELECT id INTO v_drop_id 
  FROM drops 
  WHERE profile_id = v_profile_id 
  LIMIT 1;
  
  IF v_drop_id IS NULL THEN
    INSERT INTO drops (profile_id, label, is_public, max_file_size_mb, share_token)
    VALUES (v_profile_id, 'Test Drop', true, 50, gen_random_uuid()::text)
    RETURNING id INTO v_drop_id;
  ELSE
    -- Ensure existing drop has share_token (in case it was created before share_token was added)
    UPDATE drops 
    SET share_token = COALESCE(share_token, gen_random_uuid()::text)
    WHERE id = v_drop_id AND share_token IS NULL;
  END IF;
  
  -- Create one unread submission if doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM submissions 
    WHERE drop_id = v_drop_id 
    AND email = 'test@example.com'
  ) THEN
    INSERT INTO submissions (drop_id, name, email, note, files, read_at)
    VALUES (v_drop_id, 'Test Submitter', 'test@example.com', 'Test submission', '[]', NULL);
  END IF;
  
  RAISE NOTICE '✓ Setup complete! Profile: %, Drop: %', v_profile_id, v_drop_id;
END $$;

-- Verify setup
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.slug,
  (SELECT COUNT(*)::int FROM drops WHERE profile_id = p.id) as drops,
  (SELECT COUNT(*)::int FROM drops WHERE profile_id = p.id AND share_token IS NOT NULL) as drops_with_token,
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
