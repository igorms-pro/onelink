-- Submissions Clear Functionality
-- Adds ability to mark submissions as deleted (soft delete)
-- Safe to run after 002_drops_and_submissions.sql

-- Add deleted_at column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS submissions_deleted_at_idx ON public.submissions(deleted_at);

-- Update get_submissions_by_profile to exclude deleted submissions
CREATE OR REPLACE FUNCTION public.get_submissions_by_profile(p_profile_id uuid)
RETURNS TABLE (
  submission_id uuid,
  created_at timestamptz,
  drop_id uuid,
  drop_label text,
  name text,
  email text,
  note text,
  files jsonb
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
         s.files
  FROM public.submissions s
  JOIN public.drops d on d.id = s.drop_id
  JOIN public.profiles p on p.id = d.profile_id
  WHERE p.id = p_profile_id 
    AND p.user_id = auth.uid()
    AND s.deleted_at IS NULL  -- Exclude deleted submissions
  ORDER BY s.created_at desc;
$$;

-- Function to mark submissions as deleted (soft delete)
CREATE OR REPLACE FUNCTION public.delete_submissions_by_profile(
  p_profile_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Mark all submissions for this profile as deleted
  UPDATE public.submissions s
  SET deleted_at = now()
  FROM public.drops d
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE s.drop_id = d.id
    AND p.id = p_profile_id
    AND p.user_id = auth.uid()
    AND s.deleted_at IS NULL;  -- Only mark non-deleted submissions

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.delete_submissions_by_profile(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_submissions_by_profile(uuid) TO authenticated;
