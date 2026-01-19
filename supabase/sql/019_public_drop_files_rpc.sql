-- Public Drop Files RPC
-- Allows anonymous users to view files from public drops
-- Safe to run after 002_drops_and_submissions.sql and 004_drops_public_private.sql

-- Public RPC: Get files from a public drop (for drop preview page)
-- This allows anonymous users to see files from public drops
create or replace function public.get_drop_files_public(p_drop_id uuid)
returns table (
  path text,
  size bigint,
  content_type text,
  submission_id uuid,
  created_at timestamptz,
  uploaded_by text
)
language sql
stable
security definer
as $$
  -- Flatten files from submissions for a public drop
  select 
    (file->>'path')::text as path,
    (file->>'size')::bigint as size,
    (file->>'content_type')::text as content_type,
    s.id as submission_id,
    s.created_at,
    coalesce(s.name, s.email, null) as uploaded_by
  from public.submissions s
  join public.drops d on d.id = s.drop_id
  join public.profiles p on p.id = d.profile_id
  cross join lateral jsonb_array_elements(s.files) as file
  where d.id = p_drop_id
    and d.is_active = true
    and d.is_public = true
  order by s.created_at desc;
$$;

grant execute on function public.get_drop_files_public(uuid) to anon, authenticated;
