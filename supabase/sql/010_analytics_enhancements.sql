-- Analytics Enhancements Migration
-- Priority 1: Filter self-clicks
-- Priority 2: Enhanced drop analytics

-- ============================================
-- PRIORITY 1: Filter Self-Clicks on Links
-- ============================================

-- Add user_id column to link_clicks table (nullable for anonymous clicks)
ALTER TABLE public.link_clicks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS link_clicks_user_id_idx ON public.link_clicks(user_id);

-- Update get_clicks_by_profile to exclude owner self-clicks
CREATE OR REPLACE FUNCTION public.get_clicks_by_profile(p_profile_id uuid, p_days int)
RETURNS TABLE (
  link_id uuid,
  label text,
  clicks bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT l.id AS link_id, l.label, COUNT(c.id) AS clicks
  FROM public.links l
  LEFT JOIN public.link_clicks c
    ON c.link_id = l.id
    AND c.clicked_at >= NOW() - MAKE_INTERVAL(days => p_days)
    -- Exclude clicks where user_id matches the profile owner
    AND (
      c.user_id IS NULL 
      OR c.user_id != (
        SELECT p.user_id 
        FROM public.profiles p 
        WHERE p.id = p_profile_id
      )
    )
  WHERE l.profile_id = p_profile_id
  GROUP BY l.id, l.label
  ORDER BY clicks DESC NULLS LAST;
$$;

-- ============================================
-- PRIORITY 2: Enhanced Drop Analytics
-- ============================================

-- Add uploaded_by column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS submissions_uploaded_by_idx ON public.submissions(uploaded_by);

-- Create drop_views table
CREATE TABLE IF NOT EXISTS public.drop_views (
  id BIGSERIAL PRIMARY KEY,
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null for anonymous
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for drop_views
CREATE INDEX IF NOT EXISTS drop_views_drop_id_idx ON public.drop_views(drop_id);
CREATE INDEX IF NOT EXISTS drop_views_viewed_at_idx ON public.drop_views(viewed_at);
CREATE INDEX IF NOT EXISTS drop_views_user_id_idx ON public.drop_views(user_id);

-- Enable RLS on drop_views
ALTER TABLE public.drop_views ENABLE ROW LEVEL SECURITY;

-- Public can insert (for tracking views)
DROP POLICY IF EXISTS drop_views_public_insert ON public.drop_views;
CREATE POLICY drop_views_public_insert ON public.drop_views
  FOR INSERT WITH CHECK (true);

-- Owners can read their own drop views
DROP POLICY IF EXISTS drop_views_owner_read ON public.drop_views;
CREATE POLICY drop_views_owner_read ON public.drop_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drops d
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE d.id = drop_views.drop_id AND p.user_id = auth.uid()
    )
  );

-- Create file_downloads table
CREATE TABLE IF NOT EXISTS public.file_downloads (
  id BIGSERIAL PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null for anonymous
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for file_downloads
CREATE INDEX IF NOT EXISTS file_downloads_submission_id_idx ON public.file_downloads(submission_id);
CREATE INDEX IF NOT EXISTS file_downloads_downloaded_at_idx ON public.file_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS file_downloads_user_id_idx ON public.file_downloads(user_id);

-- Enable RLS on file_downloads
ALTER TABLE public.file_downloads ENABLE ROW LEVEL SECURITY;

-- Public can insert (for tracking downloads)
DROP POLICY IF EXISTS file_downloads_public_insert ON public.file_downloads;
CREATE POLICY file_downloads_public_insert ON public.file_downloads
  FOR INSERT WITH CHECK (true);

-- Owners can read their own file downloads
DROP POLICY IF EXISTS file_downloads_owner_read ON public.file_downloads;
CREATE POLICY file_downloads_owner_read ON public.file_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.drops d ON d.id = s.drop_id
      JOIN public.profiles p ON p.id = d.profile_id
      WHERE s.id = file_downloads.submission_id AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- NEW RPC FUNCTIONS FOR ENHANCED ANALYTICS
-- ============================================

-- Get drop views by profile
CREATE OR REPLACE FUNCTION public.get_drop_views_by_profile(p_profile_id uuid, p_days int)
RETURNS TABLE (
  drop_id uuid,
  drop_label text,
  views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT d.id AS drop_id,
         d.label AS drop_label,
         COUNT(v.id)::bigint AS views
  FROM public.drops d
  LEFT JOIN public.drop_views v ON v.drop_id = d.id
    AND v.viewed_at >= NOW() - MAKE_INTERVAL(days => p_days)
    -- Exclude views where user_id matches the profile owner
    AND (
      v.user_id IS NULL 
      OR v.user_id != (
        SELECT p.user_id 
        FROM public.profiles p 
        WHERE p.id = p_profile_id
      )
    )
  WHERE d.profile_id = p_profile_id
  GROUP BY d.id, d.label
  ORDER BY views DESC, d.label ASC;
$$;

REVOKE ALL ON FUNCTION public.get_drop_views_by_profile(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.get_drop_views_by_profile(uuid, int) TO authenticated;

-- Get upload stats (owner vs visitor breakdown)
CREATE OR REPLACE FUNCTION public.get_upload_stats_by_profile(p_profile_id uuid, p_days int)
RETURNS TABLE (
  drop_id uuid,
  drop_label text,
  owner_uploads bigint,
  visitor_uploads bigint,
  total_uploads bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT d.id AS drop_id,
         d.label AS drop_label,
         COUNT(CASE WHEN s.uploaded_by = (
           SELECT p.user_id 
           FROM public.profiles p 
           WHERE p.id = p_profile_id
         ) THEN 1 END)::bigint AS owner_uploads,
         COUNT(CASE WHEN s.uploaded_by IS NULL OR s.uploaded_by != (
           SELECT p.user_id 
           FROM public.profiles p 
           WHERE p.id = p_profile_id
         ) THEN 1 END)::bigint AS visitor_uploads,
         COUNT(s.id)::bigint AS total_uploads
  FROM public.drops d
  LEFT JOIN public.submissions s ON s.drop_id = d.id
    AND s.created_at >= NOW() - MAKE_INTERVAL(days => p_days)
  WHERE d.profile_id = p_profile_id
  GROUP BY d.id, d.label
  ORDER BY total_uploads DESC, d.label ASC;
$$;

REVOKE ALL ON FUNCTION public.get_upload_stats_by_profile(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.get_upload_stats_by_profile(uuid, int) TO authenticated;

-- Get file download counts by profile
CREATE OR REPLACE FUNCTION public.get_file_downloads_by_profile(p_profile_id uuid, p_days int)
RETURNS TABLE (
  drop_id uuid,
  drop_label text,
  downloads bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT d.id AS drop_id,
         d.label AS drop_label,
         COUNT(fd.id)::bigint AS downloads
  FROM public.drops d
  LEFT JOIN public.submissions s ON s.drop_id = d.id
  LEFT JOIN public.file_downloads fd ON fd.submission_id = s.id
    AND fd.downloaded_at >= NOW() - MAKE_INTERVAL(days => p_days)
    -- Exclude downloads where user_id matches the profile owner
    AND (
      fd.user_id IS NULL 
      OR fd.user_id != (
        SELECT p.user_id 
        FROM public.profiles p 
        WHERE p.id = p_profile_id
      )
    )
  WHERE d.profile_id = p_profile_id
  GROUP BY d.id, d.label
  ORDER BY downloads DESC, d.label ASC;
$$;

REVOKE ALL ON FUNCTION public.get_file_downloads_by_profile(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.get_file_downloads_by_profile(uuid, int) TO authenticated;

-- Update get_submission_counts_by_profile to include owner/visitor breakdown
-- (Keep existing function for backward compatibility, but we'll use get_upload_stats_by_profile for detailed stats)
