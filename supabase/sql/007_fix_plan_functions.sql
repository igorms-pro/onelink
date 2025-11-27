-- Fix plan functions to read from profiles.plan instead of users.plan
-- Run this after adding the 'plan' column to profiles table

-- Update get_plan_by_slug to read from profiles.plan
CREATE OR REPLACE FUNCTION public.get_plan_by_slug(p_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(pr.plan, 'free')::text
  FROM public.profiles pr
  WHERE pr.slug = p_slug
  LIMIT 1;
$$;

-- Update get_plan_by_user to read from profiles.plan
CREATE OR REPLACE FUNCTION public.get_plan_by_user(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(pr.plan, 'free')::text
  FROM public.profiles pr
  WHERE pr.user_id = p_user_id
  LIMIT 1;
$$;

-- Update the view to use profiles.plan
CREATE OR REPLACE VIEW public.v_profiles_with_plan AS
SELECT 
  pr.id,
  pr.user_id,
  pr.slug,
  pr.display_name,
  pr.bio,
  pr.avatar_url,
  pr.created_at,
  pr.updated_at,
  COALESCE(pr.plan, 'free') AS plan,
  pr.stripe_id
FROM public.profiles pr;

-- Grant permissions
GRANT SELECT ON public.v_profiles_with_plan TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_plan_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_plan_by_user(uuid) TO authenticated;

