# Data Export Backend – Implementation Plan

## Objectives
- Provide GDPR-style export (JSON/CSV) of a user’s data (profile, links, drops, submissions, downloads/views).
- Secure, authenticated endpoint/RPC; owner-only access.
- Download link delivered via signed URL; optionally email notification.

## Work Breakdown (who can work in parallel)
- Backend (Supabase SQL + RPC) — **parallel** with API handler and storage plumbing.
- API handler (Edge Function or API route) — **parallel** with frontend wiring.
- Frontend (Settings → Data Export) — **after** API contract stable.
- Ops/Secrets/Testing — **after** backend/API merged.

## Tasks (numbered)

**Task 1 — Schema/RPC**
- [x] Create RPC `export_user_data(p_user_id uuid)` assembling JSON blob: profile, links, drops, submissions, drop views, file downloads (owner/visitor split), link clicks, timestamps.
- [x] Keep payload small: paginate/cap lists or return summaries + per-collection URLs. *(implemented via hard LIMIT caps per collection in `011_export_user_data.sql` – adjust as needed later)*
- [x] Add indexes if needed for heavy joins (user_id on downloads/views/clicks already present). *(no new indexes required beyond existing analytics indexes; revisit if query plans regress)*

**Task 2 — Storage & Delivery**
- [x] Write export JSON to private bucket `exports/{user_id}/{timestamp}.json`. *(implemented via `export-user-data` Edge Function writing to private `exports` bucket with folder = user_id and timestamped filename)*
- [x] Generate short-lived signed URL (optional CSV per collection). *(implemented in `export-user-data` with ~20 minute TTL)*
- [ ] (Optional) Email the URL via existing mailer; otherwise return URL to client. *(not implemented; function currently returns URL in JSON response only)*

**Task 3 — API Surface**
- [x] Edge Function/API route `POST /export` (Supabase auth) → call RPC, store file, return signed URL. *(implemented as Supabase Edge Function `export-user-data`, invoked via authenticated POST; calls `export_user_data`, stores file, returns signed URL JSON)*
- [x] Rate-limit per user (e.g., 1 active export at a time, cooldown ~1h). *(implemented via `export_audit` lookup enforcing ~1 hour cooldown on recent pending/success exports)*
- [x] Log audit entry (who, when, size/status). *(implemented via `public.export_audit` table and updates in `export-user-data` function)*

**Task 4 — Frontend**
- [x] Settings → Data Export: “Request export” button; show spinner; display signed URL + expiry; copy button.
- [x] Cooldown UI (disabled state with tooltip/message). *(handled primarily backend-side via rate limits; frontend reflects disabled state/messages based on API responses)*
- [x] Error toasts; retry flow. *(hook now surfaces backend failures from `export-user-data` edge function and shows localized error toasts)*

**Task 5 — Security/Compliance**
- [x] Enforce owner-only access (auth user_id === target).
- [x] Include only owner’s own records; avoid leaking others’ data.
- [x] Signed URLs short TTL (15–30 minutes); private bucket default.

**Task 6 — Testing**
- [x] Unit: mock RPC/API, ensure URL returned, cooldown enforced.
- [ ] Integration: run RPC on seeded data; verify JSON shape and counts.
- [ ] E2E: request export → see URL → download succeeds within TTL.

## Open Decisions
- CSV support now or later? (JSON first; CSV per table as follow-up).
- Blocking vs. async job: start synchronous (small datasets), move to queued job if payload grows.
- Include signed URLs to actual files? Probably **no** (respect access controls); include metadata only.
