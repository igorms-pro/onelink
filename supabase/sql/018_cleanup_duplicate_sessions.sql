-- Function to clean up duplicate sessions for the same device/browser
-- Keeps only the most recent session per device/browser combination
-- Revokes all older duplicate sessions

create or replace function public.cleanup_duplicate_sessions(p_user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_revoked_count integer;
begin
  -- Revoke all duplicate sessions, keeping only the most recent one per device/browser combination
  -- Uses a window function to identify the most recent session per device/browser group
  with ranked_sessions as (
    select 
      id,
      row_number() over (
        partition by device_os, device_browser 
        order by last_activity desc, created_at desc
      ) as rn
    from public.user_sessions
    where user_id = p_user_id
      and revoked_at is null
  ),
  sessions_to_keep as (
    select id
    from ranked_sessions
    where rn = 1
  )
  update public.user_sessions
  set revoked_at = now()
  where user_id = p_user_id
    and revoked_at is null
    and id not in (select id from sessions_to_keep);
  
  -- Get count of revoked sessions
  get diagnostics v_revoked_count = row_count;
  
  return v_revoked_count;
end;
$$;

grant execute on function public.cleanup_duplicate_sessions(uuid) to authenticated;

-- Also create a function that can be called without parameters (for current user)
create or replace function public.cleanup_my_duplicate_sessions()
returns integer
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_revoked_count integer;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;
  
  -- Call the main cleanup function
  select cleanup_duplicate_sessions(v_user_id) into v_revoked_count;
  
  return v_revoked_count;
end;
$$;

grant execute on function public.cleanup_my_duplicate_sessions() to authenticated;

-- Example usage:
-- SELECT cleanup_duplicate_sessions('user-uuid-here'); -- For specific user
-- SELECT cleanup_my_duplicate_sessions(); -- For current authenticated user
