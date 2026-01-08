# OneLink Web App

Main web application for OneLink, deployed at [app.getonelink.io](https://app.getonelink.io).

## Overview

OneLink is a unified link-in-bio platform that combines routing and file sharing into a single branded profile. The web app provides:

- **Public Profile Pages**: Customizable profile pages (`/:slug` or custom domain)
- **Routes (OneMeet)**: Intent-first buttons linking to external destinations
- **Drops (DropRequest)**: Public file inboxes with optional metadata
- **Dashboard**: Profile management, analytics, and settings
- **Billing**: Stripe integration for subscriptions

## Tech Stack

- **Framework**: React 19 + Vite
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Billing**: Stripe (Checkout + Portal)
- **Analytics**: PostHog, Sentry
- **i18n**: i18next
- **Testing**: Vitest + Playwright

## Prerequisites

### Supabase Setup

1. **Apply SQL Scripts** (in order):

   ```bash
   # Run in Supabase SQL Editor:
   - supabase/sql/000_base_schema.sql
   - supabase/sql/001_rls_and_plan.sql
   - supabase/sql/002_drops_and_submissions.sql
   - supabase/sql/003_retention_job.sql (optional)
   ```

2. **Storage Setup**:
   - Create bucket `drops` (public: Yes)
   - Apply storage policies (see `docs/storage-setup.md`)

3. **Edge Functions** (set in each function environment):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PRICE_ID`
   - `SITE_URL`

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run E2E tests
pnpm e2e:ci
```

## Environment Variables

Required variables (see `.env.local.example`):

**Required:**

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**

- `VITE_POSTHOG_KEY` - PostHog analytics API key
- `VITE_POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)
- `VITE_SENTRY_DSN` - Sentry DSN for error tracking
- `VITE_SENTRY_ENVIRONMENT` - Sentry environment (default: development)

## Deployment

Deployed on Vercel at `app.getonelink.io`:

1. **Root Directory**: `apps/web`
2. **Framework**: Vite
3. **Build Command**: `pnpm build`
4. **Output Directory**: `dist`
5. **Rewrites**: All routes redirect to `/index.html` for SPA routing

## Features

### Plans

- **Free**: 1 profile, 3 actions, 50MB/file, 7-day retention
- **Starter ($5/mo)**: Unlimited actions, 1GB/file, 30-day retention, custom domain
- **Pro ($10/mo)**: 5GB/file, 90-day retention, advanced fields, GA integration

### Routes

- `/` - Onboarding/landing (redirects to dashboard if logged in)
- `/auth` - Authentication (sign in/sign up)
- `/dashboard` - Main dashboard
- `/settings` - Settings page
- `/pricing` - Pricing page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/:slug` - Public profile page
- `/drop/:token` - Drop submission page

## Project Structure

```
apps/web/
├── src/
│   ├── components/     # Reusable components
│   ├── routes/         # Page components
│   ├── lib/            # Utilities, Supabase client, etc.
│   ├── hooks/          # Custom React hooks
│   └── main.tsx        # App entry point
├── e2e/                # Playwright E2E tests
├── supabase/           # SQL scripts and Supabase config
└── vercel.json         # Vercel deployment config
```

## Testing

- **Unit Tests**: Vitest (`pnpm test`)
- **E2E Tests**: Playwright (`pnpm e2e:ci`)
- **Coverage**: Run `pnpm coverage` for coverage report

## Internationalization

Supports multiple languages via i18next. Language files in `src/lib/locales/`.
