-- Drops and Submissions (DropRequest) – additive migration
-- Safe to run after base schema and 001_rls_and_plan.sql

-- 1) Drops: configurable public inbox blocks per profile
create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  emoji text,
  "order" int not null default 1,
  is_active boolean not null default true,
  max_file_size_mb int not null default 50,
  retention_days int not null default 7,
  require_email boolean not null default false,
  custom_fields jsonb not null default '[]'::jsonb, -- e.g. [{key,label,required,type}]
  created_at timestamptz not null default now()
);

alter table public.drops enable row level security;

-- Public can read active drops for public rendering
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'drops' and policyname = 'drops_public_read_active'
  ) then
    create policy "drops_public_read_active"
    on public.drops for select
    to anon
    using (is_active = true);
  end if;
end $$;

-- Owner full access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'drops' and policyname = 'drops_owner_all'
  ) then
    create policy "drops_owner_all"
    on public.drops for all
    to authenticated
    using (profile_id in (select id from public.profiles where user_id = auth.uid()))
    with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
  end if;
end $$;

-- 2) Submissions: one row per upload event (write-only to public)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid not null references public.drops(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text,
  email text,
  note text,
  files jsonb not null default '[]'::jsonb, -- e.g. [{path,size,content_type}]
  ip inet,
  user_agent text
);

alter table public.submissions enable row level security;

-- Public can insert (write-only)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_public_insert'
  ) then
    create policy "submissions_public_insert"
    on public.submissions for insert
    to anon
    with check (true);
  end if;
end $$;

-- Owners can read their own submissions
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_owner_select'
  ) then
    create policy "submissions_owner_select"
    on public.submissions for select
    to authenticated
    using (drop_id in (
      select d.id from public.drops d
      join public.profiles p on p.id = d.profile_id
      where p.user_id = auth.uid()
    ));
  end if;
end $$;

-- 3) RPCs

-- Public: list active drops by slug (for public profile page)
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
  where p.slug = p_slug and d.is_active = true
  order by d."order" asc, d.created_at asc;
$$;

grant execute on function public.get_drops_by_slug(text) to anon, authenticated;

-- Owner-only: list submissions for a profile (dashboard inbox)
create or replace function public.get_submissions_by_profile(p_profile_id uuid)
returns table (
  submission_id uuid,
  created_at timestamptz,
  drop_id uuid,
  drop_label text,
  name text,
  email text,
  note text,
  files jsonb
)
language sql
stable
security definer
as $$
  select s.id as submission_id,
         s.created_at,
         s.drop_id,
         d.label as drop_label,
         s.name,
         s.email,
         s.note,
         s.files
  from public.submissions s
  join public.drops d on d.id = s.drop_id
  join public.profiles p on p.id = d.profile_id
  where p.id = p_profile_id and p.user_id = auth.uid()
  order by s.created_at desc;
$$;

revoke all on function public.get_submissions_by_profile(uuid) from public;
grant execute on function public.get_submissions_by_profile(uuid) to authenticated;

-- Owner-only: simple counts per drop (analytics)
create or replace function public.get_submission_counts_by_profile(p_profile_id uuid, p_days int)
returns table (
  drop_id uuid,
  drop_label text,
  submissions int
)
language sql
stable
security definer
as $$
  select d.id as drop_id,
         d.label as drop_label,
         count(s.id)::int as submissions
  from public.drops d
  left join public.submissions s on s.drop_id = d.id
    and s.created_at >= now() - make_interval(days => p_days)
  where d.profile_id = p_profile_id and exists (
    select 1 from public.profiles p where p.id = p_profile_id and p.user_id = auth.uid()
  )
  group by d.id, d.label
  order by submissions desc, d.label asc;
$$;

revoke all on function public.get_submission_counts_by_profile(uuid, int) from public;
grant execute on function public.get_submission_counts_by_profile(uuid, int) to authenticated;

-- 4) Optional: helper check constraint to keep reasonable limits
alter table public.drops
  add constraint drops_reasonable_limits check (
    max_file_size_mb between 1 and 10240 and retention_days between 1 and 365
  );


