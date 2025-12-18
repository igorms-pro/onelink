-- Export Audit Table & Permissions
-- Supports Task 3 (API Surface) of docs/data-export-plan.md

create table if not exists public.export_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('pending', 'success', 'error')),
  file_path text,
  file_size_bytes bigint,
  error_message text
);

comment on table public.export_audit is 'Audit trail for user data export requests';
comment on column public.export_audit.user_id is 'User who requested the export';
comment on column public.export_audit.status is 'Export status: pending/success/error';

-- Index for quick lookups by user + recency (used for rate limiting)
create index if not exists export_audit_user_requested_at_idx
  on public.export_audit (user_id, requested_at desc);

-- Basic RLS: users can only see their own audit rows
alter table public.export_audit enable row level security;

create policy "Users can view their own export audit rows"
  on public.export_audit
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete access from client; managed only by Edge Function

grant select on table public.export_audit to authenticated;



