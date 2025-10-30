# OneMeet – MVP hardening and launch checklist

Prioritized, CTO-style task list. Use as GitHub issue description. Check items off as you land them.

## P0 – Security and data integrity
- [ ] DB/RLS: deny anon direct SELECT on public.links; enforce public reads via rpc.get_links_by_slug (schedule window only)
- [ ] Plan source of truth = public.users.plan; add view/rpc:
  - [ ] v_profiles_with_plan view
  - [ ] get_plan_by_slug(slug) (anon)
  - [ ] get_plan_by_user(user_id) (auth)
- [ ] Optional but recommended: RLS policy to cap free plan inserts at 3 links/profile

## P0 – Billing/Infra
- [ ] Supabase Functions: set secrets in prod (Stripe, Supabase, Vercel, SITE_URL)
  - [ ] SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - [ ] STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRICE_ID
  - [ ] SITE_URL, VERCEL_TOKEN, VERCEL_PROJECT_ID
- [ ] Stripe: live product/price + webhook to stripe-webhook function

## P1 – Frontend UX polish
- [ ] Dashboard header shows current plan (Free/Pro)
- [ ] Empty/error states
  - [ ] Public profile: slug not found / domain unverified
  - [ ] Dashboard: no links yet
- [ ] GA: enable only when plan === 'pro' and VITE_GA_ID present (already gated; add .env)
- [ ] Profile editor: basic validation (slug uniqueness surface error)

## P1 – Analytics
- [ ] SQL: get_clicks_by_profile(profile_id, days) RPC (owner-only)
- [ ] Dashboard: wire AnalyticsCard to RPC; add 7/30-day toggle

## P1 – Domains
- [ ] Schedule domain-verify (cron) and observe logs; handle rate limits and retries
- [ ] Owner UI: domain add instructions (DNS CNAME) + verification status

## P2 – Quality & tests
- [ ] Unit tests
  - [ ] isBaseHost, isSafeHttpUrl
  - [ ] getOrCreateProfile happy path (mock supabase)
- [ ] E2E tests
  - [ ] /:slug renders scheduled links only, footer hidden for Pro
  - [ ] Clicking a link doesn’t block navigation and records a click
- [ ] Lighthouse: public profile ≥ 90 Perf/Best/SEO

## P2 – Docs
- [ ] README: environment setup (web + supabase functions)
- [ ] Runbook: rotating Stripe keys, setting webhook secret, replacing PRICE_ID
- [ ] Domain guide: DNS screenshots, expected Vercel state

## P2 – Observability
- [ ] Edge functions: structured logs + error surfaces
- [ ] Optional Sentry on web (release + env tags)

## Nice-to-haves (post-MVP)
- [ ] Drag handle visual / keyboard reordering
- [ ] Avatar upload (to Supabase Storage) instead of URL field
- [ ] Link templates (Calendly/Koalendar presets)
- [ ] Rate limit click inserts (edge middleware or batched writes)

---

Implementation notes
- Public page already uses rpc.get_links_by_slug; locking direct table reads is safe.
- Frontend can switch plan lookups to get_plan_by_* later without UI changes.
- AnalyticsCard only needs the RPC to return { link_id, label, clicks }.
