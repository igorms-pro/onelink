## OneLink Monorepo (OneMeet + DropRequest)

OneLink unifies two use cases into a single profile page:
- Routes (OneMeet): intent-first buttons that link out to schedulers (Calendly, Cal.com, etc.)
- Drops (DropRequest): public file inboxes with optional fields; owners view an inbox

See `docs/onelink.md` for the product overview.

### Apply SQL (DB/RLS, Plan RPCs, and Drops/Submissions)
- Required files (run in order):
  1. `supabase/sql/000_base_schema.sql` - Tables, triggers, initial RLS
  2. `supabase/sql/001_rls_and_plan.sql` - RLS hardening, plan view/RPCs, analytics
  3. `supabase/sql/002_drops_and_submissions.sql` - Drops + submissions tables/RPCs
  4. `supabase/sql/003_retention_job.sql` - Optional: cleanup function
- Apply via Supabase Dashboard (SQL editor) or CLI:
  - Dashboard: open SQL editor, paste 000 → 001 → 002 (→ 003), run each.
  - CLI:
    ```bash
    supabase db push --include ./supabase/sql/000_base_schema.sql
    supabase db push --include ./supabase/sql/001_rls_and_plan.sql
    supabase db push --include ./supabase/sql/002_drops_and_submissions.sql
    supabase db push --include ./supabase/sql/003_retention_job.sql  # optional
    ```

Notes:
- 000: Creates all base tables (users, profiles, links, custom_domains, link_clicks), triggers, and initial RLS.
- 001: Removes anon SELECT on `links`, adds owner policies, exposes `get_links_by_slug`, and provides plan surface via `v_profiles_with_plan` and RPCs `get_plan_by_slug`, `get_plan_by_user`.
- 002: Adds DropRequest models: `drops`, `submissions`, RLS (public write-only submissions; owner read), and RPCs `get_drops_by_slug`, `get_submissions_by_profile`, `get_submission_counts_by_profile`.
- 003: Optional cleanup function for old submissions; requires pg_cron or manual scheduling.

### Storage Setup (for Drops file uploads)
- See `docs/storage-setup.md` for full instructions.
- Quick steps:
  1. Supabase Dashboard → Storage → New bucket: name `drops`, public: Yes
  2. Run storage policies SQL (see `docs/storage-setup.md`)
  3. Set bucket file size limit per plan (50MB Free, 1GB Starter, 5GB Pro)

### Required Supabase Function secrets (set in each Function environment)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- PRICE_ID
- SITE_URL

After setting secrets, redeploy functions so new env is picked up.
