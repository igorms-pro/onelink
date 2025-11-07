-- Drops: Public/Private Visibility
-- Safe to run after 002_drops_and_submissions.sql
-- Adds is_public column and share_token for private drops

-- 1) Add is_public column (default true for backward compatibility)
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'drops' 
    and column_name = 'is_public'
  ) then
    alter table public.drops add column is_public boolean not null default true;
  end if;
end $$;

-- 2) Add share_token column for private drops (link-only access)
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'drops' 
    and column_name = 'share_token'
  ) then
    alter table public.drops add column share_token text unique default gen_random_uuid()::text;
    -- Generate tokens for existing drops
    update public.drops set share_token = gen_random_uuid()::text where share_token is null;
  end if;
end $$;

-- 3) Update RLS policy to only allow public drops to be read by anonymous users
do $$ begin
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'drops' 
    and policyname = 'drops_public_read_active'
  ) then
    drop policy "drops_public_read_active" on public.drops;
  end if;
end $$;

create policy "drops_public_read_active"
on public.drops for select
to anon
using (is_active = true and is_public = true);

-- 4) Update get_drops_by_slug RPC to only return public drops
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
  where p.slug = p_slug and d.is_active = true and d.is_public = true
  order by d."order" asc, d.created_at asc;
$$;

grant execute on function public.get_drops_by_slug(text) to anon, authenticated;

