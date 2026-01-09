# OneLink

**One link. Multiple lives.**

OneLink is a unified link-in-bio platform that combines routing and file sharing into a single branded profile. Route by intent, not by link.

## 🌐 Live Applications

- **Landing Page**: [getonelink.io](https://getonelink.io)
- **Web App**: [app.getonelink.io](https://app.getonelink.io)

## 📦 Monorepo Structure

This is a monorepo containing two main applications:

### `apps/landing/` - Marketing Landing Page

Marketing website showcasing OneLink's features, pricing, and value proposition.

- **Live**: [getonelink.io](https://getonelink.io)
- **Tech**: React 19, Vite, Tailwind CSS, i18next
- **See**: [apps/landing/README.md](./apps/landing/README.md) for details

### `apps/web/` - Main Web Application

The core OneLink application with profiles, routes, drops, and dashboard.

- **Live**: [app.getonelink.io](https://app.getonelink.io)
- **Tech**: React 19, Vite, Supabase, Stripe, Tailwind CSS
- **See**: [apps/web/README.md](./apps/web/README.md) for details

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account (for web app)
- Vercel account (for deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Start landing page dev server
cd apps/landing && pnpm dev

# Start web app dev server (in another terminal)
cd apps/web && pnpm dev
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Billing**: Stripe (Checkout + Portal)
- **Hosting**: Vercel
- **Analytics**: PostHog
- **Monitoring**: Sentry
- **Testing**: Vitest, Playwright

### Key Features

- **Routes (OneMeet)**: Intent-first buttons linking to schedulers, documentation, portfolios
- **Drops (DropRequest)**: Public file inboxes with optional metadata collection
- **Custom Domains**: Professional branding with custom domains
- **Analytics**: Click tracking and submission analytics
- **Multi-language**: 10+ languages supported

## 📚 Documentation

- **Product Vision**: [docs/GOLDEN_CIRCLE.md](./docs/GOLDEN_CIRCLE.md)
- **Landing Page**: [apps/landing/README.md](./apps/landing/README.md)
- **Web App**: [apps/web/README.md](./apps/web/README.md)
- **Issues & Progress**: [docs/issues/ISSUE.md](./docs/issues/ISSUE.md)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm e2e:ci

# Run tests for specific app
cd apps/landing && pnpm test
cd apps/web && pnpm test
```

## 🚢 Deployment

Both applications are deployed on Vercel:

- **Landing**: `getonelink.io` (Root: `apps/landing`)
- **Web App**: `app.getonelink.io` (Root: `apps/web`)

See individual README files for deployment details.

## 📄 License

Private - All rights reserved

## 🔗 Links

- **Website**: [getonelink.io](https://getonelink.io)
- **App**: [app.getonelink.io](https://app.getonelink.io)
- **GitHub**: [igorms-pro/onelink](https://github.com/igorms-pro/onelink)

---

Built with ❤️ by the OneLink team
