# OneLink Landing Page

Marketing landing page for OneLink, deployed at [getonelink.io](https://getonelink.io).

## Overview

The landing page showcases OneLink's features, pricing, and value proposition. It includes:

- **Hero Section**: Main value proposition with username input
- **Features Section**: Key product features
- **How It Works**: Step-by-step explanation
- **Demo Section**: YouTube video embed (optional)
- **Comparison Section**: Feature comparison with competitors
- **Pricing Section**: Free, Starter, and Pro plans
- **Trust Section**: Security and privacy highlights
- **FAQ Section**: Common questions
- **CTA Section**: Final call-to-action

## Routes

- `/` - Homepage with all sections
- `/features` - Detailed features page
- `/pricing` - Pricing page
- `/privacy` - Privacy policy (redirects to app)
- `/terms` - Terms of service (redirects to app)
- `/auth` - Auth redirect (redirects to app)

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **i18n**: i18next (10 languages)
- **SEO**: react-helmet-async
- **Analytics**: PostHog (optional)
- **Testing**: Vitest + Playwright

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

See `.env.example` for all available variables. All are optional:

- `VITE_POSTHOG_KEY` - PostHog analytics API key
- `VITE_POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)
- `VITE_APP_URL` - Web app URL (default: https://app.getonelink.io)
- `VITE_YOUTUBE_VIDEO_ID` - YouTube video ID for demo section

## Deployment

Deployed on Vercel at `getonelink.io`:

1. **Root Directory**: `apps/landing`
2. **Framework**: Vite
3. **Build Command**: `pnpm build`
4. **Output Directory**: `dist`

## Analytics

Tracks the following events in PostHog:

- `sign_up_button_clicked` - When user clicks sign up
- `username_entered` - When user starts typing username
- `pricing_page_viewed` - When user views pricing page
- `cta_clicked` - When user clicks CTA buttons
- `scroll_depth` - User scroll depth milestones

## Internationalization

Supports 10 languages:

- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Italian (it)
- Portuguese (pt)
- Portuguese BR (pt-BR)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)

Language files are in `src/lib/locales/`.
