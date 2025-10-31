-- OneMeet: Base Schema (run this FIRST)
-- Creates all tables, triggers, and initial RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 1) USERS meta table (ties to auth.users via id)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_id text,
  plan text not null default 'free', -- 'free' | 'pro'
  status text not null default 'active', -- 'active' | 'past_due' | 'canceled'
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_idx on public.users(lower(email));

-- 2) PROFILES
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_slug_idx on public.profiles(slug);

-- 3) LINKS
create table if not exists public.links (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  emoji text,
  url text not null,
  "order" int not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists links_profile_id_idx on public.links(profile_id);

-- 4) CUSTOM DOMAINS
create table if not exists public.custom_domains (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  domain text not null unique,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists custom_domains_profile_id_idx on public.custom_domains(profile_id);
create index if not exists custom_domains_domain_idx on public.custom_domains(domain);

-- 5) LINK CLICKS (analytics)
create table if not exists public.link_clicks (
  id bigserial primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  user_agent text,
  ip_address inet
);

create index if not exists link_clicks_link_id_idx on public.link_clicks(link_id);
create index if not exists link_clicks_clicked_at_idx on public.link_clicks(clicked_at);

-- 6) TRIGGERS

-- Auto-update profiles.updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create users row when auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 7) INITIAL RLS POLICIES (basic ones; 001 will tighten links)

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.custom_domains enable row level security;
alter table public.link_clicks enable row level security;

-- users: owner can read/update self
drop policy if exists users_owner_rw on public.users;
create policy users_owner_rw on public.users
  for select using (auth.uid() = id);


drop policy if exists users_owner_update on public.users;
create policy users_owner_update on public.users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles: public can read by slug; owner full access
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select using (true);

drop policy if exists profiles_owner_cud on public.profiles;
create policy profiles_owner_cud on public.profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- links: public can read (001 will lock this down to RPC-only)
drop policy if exists links_public_read on public.links;
create policy links_public_read on public.links
  for select using (true);

drop policy if exists links_owner_cud on public.links;
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

-- custom_domains: public can read for routing; owner CUD
drop policy if exists custom_domains_public_read on public.custom_domains;
create policy custom_domains_public_read on public.custom_domains
  for select using (true);

drop policy if exists custom_domains_owner_cud on public.custom_domains;
create policy custom_domains_owner_cud on public.custom_domains
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = custom_domains.profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = custom_domains.profile_id and p.user_id = auth.uid()
    )
  );

-- link_clicks: public can insert (for click tracking); owner can read
drop policy if exists link_clicks_public_insert on public.link_clicks;
create policy link_clicks_public_insert on public.link_clicks
  for insert with check (true);

drop policy if exists link_clicks_owner_read on public.link_clicks;
create policy link_clicks_owner_read on public.link_clicks
  for select using (
    exists (
      select 1 from public.links l
      join public.profiles p on p.id = l.profile_id
      where l.id = link_clicks.link_id and p.user_id = auth.uid()
    )
  );

-- 8) INITIAL RPC: get_links_by_slug (public profile page uses this)
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
  where pr.slug = p_slug
    and (l.starts_at is null or l.starts_at <= now())
    and (l.ends_at is null or l.ends_at >= now())
  order by l."order" asc;
$$;

grant execute on function public.get_links_by_slug(text) to anon, authenticated;

