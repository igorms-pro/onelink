# Automatic File Cleanup Setup

## Overview
OneLink automatically cleans up old files based on plan retention:
- **Free plan**: 7 days
- **Starter plan**: 30 days  
- **Pro plan**: 90 days

Files and DB records older than the retention period are automatically deleted.

## Setup (Required)

### Step 1: Deploy the Function

```bash
supabase functions deploy storage-cleanup
```

### Step 2: Schedule Daily Cleanup

You have two options:

#### Option A: Supabase Scheduled Functions (Recommended)

In Supabase Dashboard → Edge Functions → storage-cleanup → Schedule:
- Frequency: Daily
- Time: 02:00 UTC (or your preferred time)
- HTTP Method: POST
- Body: `{}` (empty - function will process all profiles)

#### Option B: External Cron (GitHub Actions, cron-job.org, etc.)

Set up a daily cron job that calls:

```bash
curl -X POST https://{your-project}.functions.supabase.co/storage-cleanup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Note:** No auth needed - the function detects scheduled calls and uses service role.

### Step 3: Verify It's Working

After 24 hours, check Supabase Dashboard:
- Storage → `drops` bucket: old files should be gone
- Table Editor → `submissions`: old records should be deleted

Or manually trigger once:

```bash
curl -X POST https://{your-project}.functions.supabase.co/storage-cleanup \
  -H "Content-Type: application/json" \
  -d '{}'
```

## How It Works

1. Runs daily at scheduled time
2. Processes ALL profiles automatically
3. For each drop, uses its `retention_days` setting:
   - Free plan drops: 7 days
   - Starter plan drops: 30 days
   - Pro plan drops: 90 days
4. Deletes files from Storage AND DB records
5. Respects plan limits automatically

## Manual Cleanup (Optional)

You can also trigger cleanup for a specific profile:

```typescript
// From your Dashboard
const { data } = await supabase.functions.invoke("storage-cleanup", {
  body: { 
    profile_id: yourProfileId,
    use_retention_days: true  // Use plan retention, or false for 365 days
  },
});
```

## Important Notes

- ⚠️ **Deletion is permanent** - no undo
- ✅ Safe: only deletes files older than retention period
- ✅ Respects plan limits automatically
- ✅ No user action needed once scheduled

