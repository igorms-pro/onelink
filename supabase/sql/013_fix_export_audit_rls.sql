-- Fix export_audit RLS to allow INSERT from Edge Function
-- Edge Function uses authenticated user's JWT, so we need INSERT policy

-- Allow authenticated users to insert their own export audit rows
drop policy if exists "Users can insert their own export audit rows" on public.export_audit;
create policy "Users can insert their own export audit rows"
  on public.export_audit
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow authenticated users to update their own export audit rows (for status updates)
drop policy if exists "Users can update their own export audit rows" on public.export_audit;
create policy "Users can update their own export audit rows"
  on public.export_audit
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Grant necessary permissions
grant insert, update on table public.export_audit to authenticated;

