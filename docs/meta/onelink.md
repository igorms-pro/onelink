# OneLink – Unified Product Overview

OneLink combines OneMeet (routing to meetings) and DropRequest (public file inbox) into a single, branded profile.

## What it is
- A public page at `/:slug` (or custom domain) with two block types:
  - Route: button linking to external destinations (Calendly, Koalendar, docs, etc.)
  - Drop: lightweight file intake (no-login), optional name/email/note

## Why
- One link that routes visitors to the right action: book a call or send assets.
- Shared infra (auth, billing, domains, storage) and a simple, clean UX.

## Plans
- Free: 1 profile, 3 actions total (Routes + Drops), 50MB/file, 7-day retention, “Powered by”.
- Starter $5/mo: Unlimited actions, 1GB/file, 30-day retention, custom domain, ZIP export, basic analytics.
- Pro $10/mo: 5GB/file, 90-day retention, advanced fields, GA integration, priority support.

## Tech (MVP)
- Frontend: React (Vite)
- Backend: Supabase (Auth, Postgres, Storage)
- Billing: Stripe (Checkout + Portal)
- Hosting: Vercel; custom domains supported
- Monitoring: Sentry (Error Tracking + Tracing), PostHog (Analytics)
- Logging: Supabase Logs, Vercel Analytics

## Data model (key)
- profiles, links (Routes), link_clicks
- drops, submissions (see `supabase/sql/002_drops_and_submissions.sql`)

## Next steps
- Apply SQL 001 then 002, deploy functions, and wire Drop UI in web (public uploader + dashboard inbox).
