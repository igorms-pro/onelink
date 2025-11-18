-- Fix submissions RLS policy to ensure drop is active
-- Safe to run after 002_drops_and_submissions.sql

-- Drop and recreate the public insert policy with proper check
do $$ begin
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'submissions' 
    and policyname = 'submissions_public_insert'
  ) then
    drop policy submissions_public_insert on public.submissions;
  end if;
end $$;

-- Recreate policy with check that drop exists and is active
create policy "submissions_public_insert"
on public.submissions for insert
to anon
with check (
  exists (
    select 1 from public.drops d
    where d.id = submissions.drop_id
    and d.is_active = true
  )
);

-- Also allow authenticated users to insert submissions on active drops
-- This allows logged-in users (not just owners) to upload files to public drops
do $$ begin
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'submissions' 
    and policyname = 'submissions_authenticated_insert'
  ) then
    drop policy submissions_authenticated_insert on public.submissions;
  end if;
end $$;

create policy "submissions_authenticated_insert"
on public.submissions for insert
to authenticated
with check (
  exists (
    select 1 from public.drops d
    where d.id = submissions.drop_id
    and d.is_active = true
  )
);

