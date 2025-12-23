-- Fix ambiguous column reference in get_user_sessions function
-- Issue: Column "id" was ambiguous because it wasn't qualified with table alias
-- Fix: Add table alias and qualify all column references

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
  select us.id into v_current_session_id
  from public.user_sessions us
  where us.user_id = p_user_id
    and us.revoked_at is null
  order by us.last_activity desc
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

-- Also fix the same issue in revoke_all_other_sessions function
create or replace function public.revoke_all_other_sessions(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_current_session_id uuid;
begin
  -- Get current session (most recent)
  select us.id into v_current_session_id
  from public.user_sessions us
  where us.user_id = p_user_id
    and us.revoked_at is null
  order by us.last_activity desc
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
