-- Download Notifications - Get Downloads by Profile
-- Adds function to get file downloads with submission details for inbox display
-- Safe to run after 010_analytics_enhancements.sql

-- Function to get file downloads by profile with submission details
CREATE OR REPLACE FUNCTION public.get_downloads_by_profile(p_profile_id uuid)
RETURNS TABLE (
  download_id bigint,
  downloaded_at timestamptz,
  submission_id uuid,
  drop_id uuid,
  drop_label text,
  file_path text,
  file_name text,
  submission_name text,
  submission_email text,
  submission_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT fd.id as download_id,
         fd.downloaded_at,
         fd.submission_id,
         s.drop_id,
         d.label as drop_label,
         fd.file_path,
         (string_to_array(fd.file_path, '/'))[array_length(string_to_array(fd.file_path, '/'), 1)] as file_name,
         s.name as submission_name,
         s.email as submission_email,
         s.created_at as submission_created_at
  FROM public.file_downloads fd
  JOIN public.submissions s ON s.id = fd.submission_id
  JOIN public.drops d ON d.id = s.drop_id
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE p.id = p_profile_id
    AND p.user_id = auth.uid()
    AND s.deleted_at IS NULL  -- Exclude downloads from deleted submissions
    -- Exclude downloads where user_id matches the profile owner (owner's own downloads)
    AND (
      fd.user_id IS NULL 
      OR fd.user_id != p.user_id
    )
  ORDER BY fd.downloaded_at DESC;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.get_downloads_by_profile(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_downloads_by_profile(uuid) TO authenticated;
