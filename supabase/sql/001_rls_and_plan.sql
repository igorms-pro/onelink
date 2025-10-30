-- OneMeet: RLS hardening + plan source of truth + analytics RPCs
-- Safe to run multiple times; DROP/CREATE guarded where sensible.

-- 1) LINKS: lock down anon SELECT; keep owner access; enforce RPC-only for public reads
alter table if exists public.links enable row level security;

-- Remove public read policy if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'links' AND policyname = 'links_public_read'
  ) THEN
    EXECUTE 'drop policy links_public_read on public.links';
  END IF;
END $$;

-- Recreate owner-only policy for all ops (select/insert/update/delete)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'links' AND policyname = 'links_owner_cud'
  ) THEN
    EXECUTE 'drop policy links_owner_cud on public.links';
  END IF;
END $$;

create policy links_owner_cud on public.links
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = links.profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = links.profile_id and p.user_id = auth.uid()
    )
  );

-- Ensure anon can call the public RPC (assumes function exists)
GRANT EXECUTE ON FUNCTION public.get_links_by_slug(text) TO anon, authenticated;


-- 2) PLAN lives in users: add view + RPCs to expose plan consistently
create or replace view public.v_profiles_with_plan as
select
  pr.id,
  pr.user_id,
  pr.slug,
  pr.display_name,
  pr.bio,
  pr.avatar_url,
  (u.plan)::text as plan
from public.profiles pr
join public.users u on u.id = pr.user_id;

GRANT SELECT ON public.v_profiles_with_plan TO anon, authenticated;

-- Fetch plan by slug (anon)
create or replace function public.get_plan_by_slug(p_slug text)
returns text
language sql
stable
security definer
as $$
  select (u.plan)::text
  from public.profiles pr
  join public.users u on u.id = pr.user_id
  where pr.slug = p_slug
  limit 1;
$$;

-- Fetch plan by user id (authenticated)
create or replace function public.get_plan_by_user(p_user_id uuid)
returns text
language sql
stable
security definer
as $$
  select (u.plan)::text
  from public.users u
  where u.id = p_user_id
  limit 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_plan_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_plan_by_user(uuid) TO authenticated;


-- 3) OPTIONAL: free plan limit at 3 links per profile (owner insert only)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'links' AND policyname = 'links_free_limit_insert'
  ) THEN
    EXECUTE 'drop policy links_free_limit_insert on public.links';
  END IF;
END $$;

create policy links_free_limit_insert on public.links
  for insert
  with check (
    exists (
      select 1
      from public.profiles pr
      join public.users u on u.id = pr.user_id
      where pr.id = links.profile_id
        and pr.user_id = auth.uid()
        and (
          u.plan = 'pro'
          or (
            select count(*) from public.links l2 where l2.profile_id = pr.id
          ) < 3
        )
    )
  );


-- 4) OPTIONAL: clicks summary RPC for dashboard analytics
create or replace function public.get_clicks_by_profile(p_profile_id uuid, p_days int)
returns table (
  link_id uuid,
  label text,
  clicks bigint
)
language sql
stable
security definer
as $$
  select l.id as link_id, l.label, count(c.id) as clicks
  from public.links l
  left join public.link_clicks c
    on c.link_id = l.id
    and c.clicked_at >= now() - make_interval(days => p_days)
  where l.profile_id = p_profile_id
  group by l.id, l.label
  order by clicks desc nulls last;
$$;

GRANT EXECUTE ON FUNCTION public.get_clicks_by_profile(uuid, int) TO authenticated;


