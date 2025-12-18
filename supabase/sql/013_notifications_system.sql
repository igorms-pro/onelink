-- Notifications System - Read/Unread Status
-- Adds read/unread tracking for submissions
-- Safe to run after 012_submissions_clear.sql

-- Add read_at column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS submissions_read_at_idx ON public.submissions(read_at);

-- Function to mark single submission as read
CREATE OR REPLACE FUNCTION public.mark_submission_read(
  p_submission_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.submissions s
  SET read_at = now()
  FROM public.drops d
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE s.id = p_submission_id
    AND s.drop_id = d.id
    AND p.user_id = auth.uid()
    AND s.read_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to mark all submissions as read for a profile
CREATE OR REPLACE FUNCTION public.mark_all_submissions_read(
  p_profile_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.submissions s
  SET read_at = now()
  FROM public.drops d
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE s.drop_id = d.id
    AND p.id = p_profile_id
    AND p.user_id = auth.uid()
    AND s.read_at IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Drop existing function first (to change return type)
DROP FUNCTION IF EXISTS public.get_submissions_by_profile(uuid);

-- Update get_submissions_by_profile to include read_at
CREATE OR REPLACE FUNCTION public.get_submissions_by_profile(p_profile_id uuid)
RETURNS TABLE (
  submission_id uuid,
  created_at timestamptz,
  drop_id uuid,
  drop_label text,
  name text,
  email text,
  note text,
  files jsonb,
  read_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT s.id as submission_id,
         s.created_at,
         s.drop_id,
         d.label as drop_label,
         s.name,
         s.email,
         s.note,
         s.files,
         s.read_at
  FROM public.submissions s
  JOIN public.drops d on d.id = s.drop_id
  JOIN public.profiles p on p.id = d.profile_id
  WHERE p.id = p_profile_id 
    AND p.user_id = auth.uid()
    AND s.deleted_at IS NULL  -- Exclude deleted submissions
  ORDER BY s.created_at desc;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.mark_submission_read(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_submission_read(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.mark_all_submissions_read(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_all_submissions_read(uuid) TO authenticated;
