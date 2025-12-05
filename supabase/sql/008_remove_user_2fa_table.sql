-- 008_remove_user_2fa_table.sql
-- Cleanup script to remove legacy custom 2FA table now that Supabase MFA is used
-- Run this AFTER migrating to Supabase MFA and confirming no data is needed.

-- Drop policies and table only if they exist to make script idempotent
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_2fa'
  ) then
    -- Drop RLS policies first
    drop policy if exists "user_2fa_owner_all" on public.user_2fa;

    -- Drop trigger and function if they exist
    drop trigger if exists user_2fa_updated_at on public.user_2fa;
    drop function if exists update_user_2fa_updated_at();

    -- Finally drop the table
    drop table public.user_2fa;
  end if;
end
$$;


