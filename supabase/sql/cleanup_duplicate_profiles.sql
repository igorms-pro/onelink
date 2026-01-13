-- Cleanup duplicate testuser profiles - keep only one

DO $$
DECLARE
  v_user_id uuid := '6a59c70e-dfea-40b4-b44f-7ad619369404';
  v_keep_profile_id uuid;
BEGIN
  -- Get the first profile for this user (or create one if none exists)
  SELECT id INTO v_keep_profile_id 
  FROM profiles 
  WHERE user_id = v_user_id 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF v_keep_profile_id IS NULL THEN
    -- No profile exists, create one
    INSERT INTO profiles (user_id, slug, display_name)
    VALUES (v_user_id, 'testuser', 'Test User')
    RETURNING id INTO v_keep_profile_id;
    RAISE NOTICE 'Created new profile: %', v_keep_profile_id;
  ELSE
    RAISE NOTICE 'Keeping profile: %', v_keep_profile_id;
  END IF;
  
  -- Delete all other profiles for this user
  DELETE FROM profiles 
  WHERE user_id = v_user_id 
    AND id != v_keep_profile_id;
  
  RAISE NOTICE 'Deleted duplicate profiles';
  
  -- Update the kept profile to ensure it has the right slug
  UPDATE profiles 
  SET slug = 'testuser', display_name = 'Test User'
  WHERE id = v_keep_profile_id;
  
  RAISE NOTICE '✓ Cleanup complete! Kept profile: %', v_keep_profile_id;
END $$;

-- Verify - should show only 1 profile now
SELECT COUNT(*) as profile_count, user_id, slug 
FROM profiles 
WHERE user_id = '6a59c70e-dfea-40b4-b44f-7ad619369404'
GROUP BY user_id, slug;
