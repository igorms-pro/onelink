-- Case Insensitive Slug RPCs
-- Makes all slug-based RPC functions case-insensitive
-- Safe to run after 000_base_schema.sql, 001_rls_and_plan.sql, 002_drops_and_submissions.sql, 004_drops_public_private.sql

-- Update get_links_by_slug to be case-insensitive
create or replace function public.get_links_by_slug(p_slug text)
returns table (
  link_id uuid,
  label text,
  emoji text,
  url text,
  "order" int
) language sql stable security definer as $$
  select l.id, l.label, l.emoji, l.url, l."order"
  from public.links l
  join public.profiles pr on pr.id = l.profile_id
  where lower(pr.slug) = lower(p_slug)
    and (l.starts_at is null or l.starts_at <= now())
    and (l.ends_at is null or l.ends_at >= now())
  order by l."order" asc;
$$;

-- Update get_plan_by_slug to be case-insensitive
create or replace function public.get_plan_by_slug(p_slug text)
returns text
language sql
stable
security definer
as $$
  select (u.plan)::text
  from public.profiles pr
  join public.users u on u.id = pr.user_id
  where lower(pr.slug) = lower(p_slug)
  limit 1;
$$;

-- Update get_drops_by_slug to be case-insensitive
create or replace function public.get_drops_by_slug(p_slug text)
returns table (
  drop_id uuid,
  label text,
  emoji text,
  "order" int,
  max_file_size_mb int
)
language sql
stable
security definer
as $$
  select d.id as drop_id, d.label, d.emoji, d."order", d.max_file_size_mb
  from public.drops d
  join public.profiles p on p.id = d.profile_id
  where lower(p.slug) = lower(p_slug) and d.is_active = true and d.is_public = true
  order by d."order" asc, d.created_at asc;
$$;
