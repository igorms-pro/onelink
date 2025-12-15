-- Fix users table RLS to allow INSERT from authenticated users
-- The trigger handle_new_user should create the row automatically,
-- but frontend code (getOrCreateProfile) tries to ensure it exists with upsert

-- Allow authenticated users to insert their own users row (if trigger didn't fire)
drop policy if exists users_owner_insert on public.users;
create policy users_owner_insert on public.users
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Grant insert permission
grant insert on table public.users to authenticated;

