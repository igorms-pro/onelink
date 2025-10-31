# Supabase Storage Setup for OneLink

## Create the `drops` bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `drops`
4. Public: **Yes** (files need public URLs for download)
5. File size limit: set to your max (e.g., 1GB for Starter, 5GB for Pro)
6. Allowed MIME types: leave empty (or restrict to safe types like `image/*,application/pdf,application/zip`)

## Storage policies (via SQL or Dashboard)

Run this SQL to allow public uploads and owner reads:

```sql
-- Allow public to upload (anon insert)
create policy "Public can upload to drops"
on storage.objects for insert
to anon
with check (bucket_id = 'drops');

-- Allow public to read (anon select)
create policy "Public can read from drops"
on storage.objects for select
to anon
using (bucket_id = 'drops');

-- Owner can read their own submissions
create policy "Owners can read their submissions"
on storage.objects for select
to authenticated
using (
  bucket_id = 'drops'
  and (storage.foldername(name))[1] in (
    select d.id::text from public.drops d
    join public.profiles p on p.id = d.profile_id
    where p.user_id = auth.uid()
  )
);

-- Optional: cleanup policy (delete old files via retention job)
-- Note: This is enforced via retention job, not via policy
```

## Storage URL format

Files are stored as: `{drop_id}/{timestamp}-{random}.{ext}`

Public URL: `https://{project-ref}.supabase.co/storage/v1/object/public/drops/{path}`

Access via Supabase JS:
```ts
const { data } = supabase.storage.from("drops").getPublicUrl(filePath);
const url = data.publicUrl;
```

## Retention cleanup

See `supabase/sql/003_retention_job.sql` for automated cleanup of files older than `retention_days`.

