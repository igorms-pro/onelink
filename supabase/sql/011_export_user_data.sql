-- Data Export RPC
-- Task 1: Create RPC export_user_data(p_user_id uuid)
-- Aggregates a user's data (profiles, links, drops, submissions, analytics)
-- into a single JSON blob suitable for GDPR-style export.
--
-- Notes on payload size:
-- - Each collection is capped with LIMITs to keep exports reasonably small.
-- - For very large accounts, consider follow-up paginated/collection-specific exports.

create or replace function public.export_user_data(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profiles        jsonb;
  v_links           jsonb;
  v_drops           jsonb;
  v_submissions     jsonb;
  v_link_clicks     jsonb;
  v_drop_views      jsonb;
  v_file_downloads  jsonb;
begin
  -- Enforce owner-only access: caller must match target user
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Access denied'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  -- PROFILES (all profiles owned by this user)
  select coalesce(
    jsonb_agg(to_jsonb(p) order by p.created_at),
    '[]'::jsonb
  )
  into v_profiles
  from public.profiles p
  where p.user_id = p_user_id;

  -- LINKS (capped)
  select coalesce(
    jsonb_agg(to_jsonb(l) order by l.created_at),
    '[]'::jsonb
  )
  into v_links
  from (
    select l.*
    from public.links l
    join public.profiles p on p.id = l.profile_id
    where p.user_id = p_user_id
    order by l.created_at
    limit 5000
  ) l;

  -- DROPS (capped)
  select coalesce(
    jsonb_agg(to_jsonb(d) order by d.created_at),
    '[]'::jsonb
  )
  into v_drops
  from (
    select d.*
    from public.drops d
    join public.profiles p on p.id = d.profile_id
    where p.user_id = p_user_id
    order by d.created_at
    limit 2000
  ) d;

  -- SUBMISSIONS (capped)
  select coalesce(
    jsonb_agg(to_jsonb(s) order by s.created_at),
    '[]'::jsonb
  )
  into v_submissions
  from (
    select s.*
    from public.submissions s
    join public.drops d on d.id = s.drop_id
    join public.profiles p on p.id = d.profile_id
    where p.user_id = p_user_id
    order by s.created_at
    limit 10000
  ) s;

  -- LINK CLICKS (capped, with actor classification)
  select coalesce(
    jsonb_agg(to_jsonb(x) order by x.clicked_at),
    '[]'::jsonb
  )
  into v_link_clicks
  from (
    select
      c.*,
      l.profile_id,
      p.user_id as owner_user_id,
      case
        when c.user_id = p_user_id then 'owner'
        when c.user_id is null then 'anonymous'
        else 'visitor'
      end as actor_type
    from public.link_clicks c
    join public.links l on l.id = c.link_id
    join public.profiles p on p.id = l.profile_id
    where p.user_id = p_user_id
    order by c.clicked_at
    limit 10000
  ) x;

  -- DROP VIEWS (capped, with actor classification)
  select coalesce(
    jsonb_agg(to_jsonb(x) order by x.viewed_at),
    '[]'::jsonb
  )
  into v_drop_views
  from (
    select
      v.*,
      d.profile_id,
      p.user_id as owner_user_id,
      case
        when v.user_id = p_user_id then 'owner'
        when v.user_id is null then 'anonymous'
        else 'visitor'
      end as actor_type
    from public.drop_views v
    join public.drops d on d.id = v.drop_id
    join public.profiles p on p.id = d.profile_id
    where p.user_id = p_user_id
    order by v.viewed_at
    limit 10000
  ) x;

  -- FILE DOWNLOADS (capped, with actor classification)
  select coalesce(
    jsonb_agg(to_jsonb(x) order by x.downloaded_at),
    '[]'::jsonb
  )
  into v_file_downloads
  from (
    select
      fd.*,
      s.drop_id,
      d.profile_id,
      p.user_id as owner_user_id,
      case
        when fd.user_id = p_user_id then 'owner'
        when fd.user_id is null then 'anonymous'
        else 'visitor'
      end as actor_type
    from public.file_downloads fd
    join public.submissions s on s.id = fd.submission_id
    join public.drops d on d.id = s.drop_id
    join public.profiles p on p.id = d.profile_id
    where p.user_id = p_user_id
    order by fd.downloaded_at
    limit 10000
  ) x;

  -- Final aggregated JSON payload
  return jsonb_build_object(
    'user_id', p_user_id,
    'generated_at', now(),
    'profiles', coalesce(v_profiles, '[]'::jsonb),
    'links', coalesce(v_links, '[]'::jsonb),
    'drops', coalesce(v_drops, '[]'::jsonb),
    'submissions', coalesce(v_submissions, '[]'::jsonb),
    'analytics', jsonb_build_object(
      'link_clicks', coalesce(v_link_clicks, '[]'::jsonb),
      'drop_views', coalesce(v_drop_views, '[]'::jsonb),
      'file_downloads', coalesce(v_file_downloads, '[]'::jsonb)
    )
  );
end;
$$;

grant execute on function public.export_user_data(uuid) to authenticated;


