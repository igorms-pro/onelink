# How to Get Your Supabase Database Connection String

## Option 1: From Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/tdxzkceksiqcvposgcsm
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Option 2: Construct It Manually

From your project URL: `https://tdxzkceksiqcvposgcsm.supabase.co`

Your project ref is: `tdxzkceksiqcvposgcsm`

Connection string format:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or direct connection:
```
postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**You need:**
- Your database password (set when you created the project, or reset it in Dashboard → Settings → Database)

## Option 3: Use Supabase CLI

If you have Supabase CLI installed:
```bash
supabase db remote commit
```

This will connect and show you the connection details.

