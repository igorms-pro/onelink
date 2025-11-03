# Storage Cleanup Guide

## Overview
Files uploaded to the `drops` bucket accumulate over time. You can manually clean up old files via the Edge Function.

## Manual Cleanup (1 Year Old Files)

### Option 1: Via Edge Function (Recommended)

Call the `storage-cleanup` function with your profile ID:

```bash
curl -X POST https://{your-project}.functions.supabase.co/storage-cleanup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "your-profile-uuid",
    "use_retention_days": true
  }'
```

Or from your Dashboard code:

```typescript
const { data, error } = await supabase.functions.invoke("storage-cleanup", {
  body: { profile_id: yourProfileId, use_retention_days: true },
});
```

**Note:** By default, it uses each drop's `retention_days` setting (Free: 7, Starter: 30, Pro: 90). Set `use_retention_days: false` to use 365 days for all.

### Option 2: Manual in Supabase Dashboard

1. Go to Supabase Dashboard → Storage → `drops` bucket
2. Browse folders by `drop_id`
3. Delete files manually (one by one, or use Storage API)

### Option 3: SQL + Storage API (Advanced)

The SQL function `cleanup_old_submissions` deletes DB records but not files. For full cleanup:

1. Run SQL to get file paths:
```sql
SELECT s.files 
FROM submissions s
JOIN drops d ON d.id = s.drop_id
WHERE s.created_at < NOW() - INTERVAL '1 year'
AND d.profile_id = 'your-profile-id';
```

2. Use Storage API to delete files (via Edge Function or script)

## Automatic Cleanup (Scheduled)

Currently, automatic cleanup is **not enabled**. To enable it:

1. Set up pg_cron (if available in your Supabase plan)
2. Schedule the cleanup function
3. Or use external cron (GitHub Actions, cron-job.org) to call the Edge Function

## What Gets Deleted

- Files older than specified days (default: 365 days = 1 year)
- Only submissions from your profile's drops
- Both DB records AND Storage files are deleted

## Safety

- Function requires authentication (your JWT token)
- Only deletes files for YOUR profile
- No confirmation dialog (be careful!)
- Consider backing up important files first

