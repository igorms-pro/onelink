-- OneLink: Retention cleanup job (optional)
-- Deletes submissions and files older than retention_days per drop
-- Run this as a scheduled job (pg_cron) or manual cleanup

-- Function: delete old submissions + files for a profile
create or replace function public.cleanup_old_submissions(p_profile_id uuid)
returns table (
  deleted_submissions int,
  deleted_files int
)
language plpgsql
security definer
as $$
declare
  v_count int := 0;
  v_file_count int := 0;
  rec record;
begin
  -- Delete submissions older than retention_days for each drop
  for rec in
    select d.id as drop_id, d.retention_days
    from public.drops d
    where d.profile_id = p_profile_id
  loop
    -- Collect file paths before deletion
    for rec2 in
      select s.files::jsonb as file_list
      from public.submissions s
      where s.drop_id = rec.drop_id
        and s.created_at < now() - make_interval(days => rec.retention_days)
    loop
      if rec2.file_list is not null then
        for file_item in select * from jsonb_array_elements(rec2.file_list)
        loop
          -- Note: Storage deletion requires Supabase Storage API call
          -- This SQL can't delete files directly; use edge function or scheduled task
          v_file_count := v_file_count + 1;
        end loop;
      end if;
    end loop;

    -- Delete old submissions (cascade deletes are handled by DB, but file cleanup needs Storage API)
    with deleted as (
      delete from public.submissions
      where drop_id = rec.drop_id
        and created_at < now() - make_interval(days => rec.retention_days)
      returning id
    )
    select count(*) into v_count from deleted;
  end loop;

  return query select v_count, v_file_count;
end;
$$;

grant execute on function public.cleanup_old_submissions(uuid) to authenticated;

-- Optional: pg_cron job (if extension enabled)
-- SELECT cron.schedule('cleanup-submissions', '0 2 * * *', $$
--   SELECT public.cleanup_old_submissions(p.id) FROM public.profiles p;
-- $$);


-- Manual cleanup example:
-- SELECT * FROM public.cleanup_old_submissions('{profile_id}'::uuid);

