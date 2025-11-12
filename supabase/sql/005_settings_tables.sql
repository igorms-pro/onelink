-- Settings Tables (user preferences, sessions, 2FA)
-- Safe to run after base schema and RLS policies

-- 1) USER PREFERENCES
-- Stores user notification and email preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  email_notifications boolean not null default true,
  weekly_digest boolean not null default false,
  marketing_emails boolean not null default false,
  product_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

-- Users can only read/update their own preferences
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_preferences' and policyname = 'user_preferences_owner_all'
  ) then
    create policy "user_preferences_owner_all"
    on public.user_preferences for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end $$;

-- Trigger to update updated_at
create or replace function update_user_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_preferences_updated_at on public.user_preferences;
create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function update_user_preferences_updated_at();

-- 2) USER SESSIONS
-- Tracks active user sessions for security
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  device_os text,
  device_browser text,
  ip_address inet,
  city text,
  country text,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_active_idx on public.user_sessions(user_id, revoked_at) where revoked_at is null;

alter table public.user_sessions enable row level security;

-- Users can only read/revoke their own sessions
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_sessions' and policyname = 'user_sessions_owner_all'
  ) then
    create policy "user_sessions_owner_all"
    on public.user_sessions for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end $$;

-- 3) LOGIN HISTORY
-- Tracks login attempts (success and failures)
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  status text not null, -- 'success' | 'failed'
  ip_address inet,
  device_info text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_history_user_id_idx on public.login_history(user_id);
create index if not exists login_history_email_idx on public.login_history(email);
create index if not exists login_history_created_at_idx on public.login_history(created_at desc);

alter table public.login_history enable row level security;

-- Users can only read their own login history
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'login_history' and policyname = 'login_history_owner_select'
  ) then
    create policy "login_history_owner_select"
    on public.login_history for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;

-- Public can insert login history (for failed attempts without user_id)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'login_history' and policyname = 'login_history_public_insert'
  ) then
    create policy "login_history_public_insert"
    on public.login_history for insert
    to anon, authenticated
    with check (true);
  end if;
end $$;

-- 4) USER 2FA
-- Stores two-factor authentication secrets and backup codes
create table if not exists public.user_2fa (
  user_id uuid primary key references public.users(id) on delete cascade,
  secret text not null, -- Encrypted TOTP secret
  backup_codes text[] not null default array[]::text[], -- Encrypted backup codes
  enabled boolean not null default false,
  enabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_2fa enable row level security;

-- Users can only read/update their own 2FA settings
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_2fa' and policyname = 'user_2fa_owner_all'
  ) then
    create policy "user_2fa_owner_all"
    on public.user_2fa for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end $$;

-- Trigger to update updated_at
create or replace function update_user_2fa_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_2fa_updated_at on public.user_2fa;
create trigger user_2fa_updated_at
  before update on public.user_2fa
  for each row
  execute function update_user_2fa_updated_at();

-- RPC: Get user sessions
create or replace function public.get_user_sessions(p_user_id uuid)
returns table (
  id uuid,
  device_os text,
  device_browser text,
  ip_address inet,
  city text,
  country text,
  last_activity timestamptz,
  created_at timestamptz,
  is_current boolean
)
language plpgsql
security definer
as $$
declare
  v_current_session_id uuid;
begin
  -- Get current session ID from auth.sessions (if available)
  -- For now, we'll mark the most recent session as current
  select id into v_current_session_id
  from public.user_sessions
  where user_id = p_user_id
    and revoked_at is null
  order by last_activity desc
  limit 1;

  return query
  select
    us.id,
    us.device_os,
    us.device_browser,
    us.ip_address,
    us.city,
    us.country,
    us.last_activity,
    us.created_at,
    (us.id = v_current_session_id) as is_current
  from public.user_sessions us
  where us.user_id = p_user_id
    and us.revoked_at is null
  order by us.last_activity desc;
end;
$$;

grant execute on function public.get_user_sessions(uuid) to authenticated;

-- RPC: Revoke session
create or replace function public.revoke_session(p_session_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_sessions
  set revoked_at = now()
  where id = p_session_id
    and user_id = auth.uid()
    and revoked_at is null;
end;
$$;

grant execute on function public.revoke_session(uuid) to authenticated;

-- RPC: Revoke all other sessions (except current)
create or replace function public.revoke_all_other_sessions(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_current_session_id uuid;
begin
  -- Get current session (most recent)
  select id into v_current_session_id
  from public.user_sessions
  where user_id = p_user_id
    and revoked_at is null
  order by last_activity desc
  limit 1;

  -- Revoke all other sessions
  update public.user_sessions
  set revoked_at = now()
  where user_id = p_user_id
    and id != coalesce(v_current_session_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and revoked_at is null;
end;
$$;

grant execute on function public.revoke_all_other_sessions(uuid) to authenticated;

