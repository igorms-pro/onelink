# OneLink – Monitoring & Observability Stack

## Overview

OneLink uses a modern observability stack to ensure reliability, performance, and user experience insights.

## The 5 Pillars of Observability

### 1. Monitoring (Metrics)
**Purpose:** Track system health and performance metrics

**Current Stack:**
- ✅ **Supabase Dashboard** - Database metrics, Edge Functions metrics, Storage usage
- ✅ **Vercel Analytics** (if deployed on Vercel) - Core Web Vitals, frontend performance

**Future:**
- Consider Prometheus + Grafana if we need custom metrics

**What we track:**
- Database CPU/Memory usage
- Edge Function execution time
- Storage usage
- Request rates

---

### 2. Error Tracking
**Purpose:** Capture and alert on application errors

**Current Stack:**
- 🔄 **Sentry** (to be implemented)
  - Frontend error tracking (React)
  - Backend error tracking (Edge Functions)
  - Automatic stack traces
  - Email/Slack alerts

**What we track:**
- JavaScript errors in React app
- Edge Function errors (500s, exceptions)
- API errors
- User-reported issues

---

### 3. Logging
**Purpose:** Structured logs for debugging and audit trails

**Current Stack:**
- ✅ **Supabase Logs** - Edge Functions logs, Database logs
- ✅ **Console.log** - Structured logging in code

**Best Practices:**
- Use structured JSON logs
- Include request IDs for tracing
- Log levels: DEBUG, INFO, WARN, ERROR

**What we log:**
- Edge Function executions
- User actions (sign in, sign up, delete account)
- API calls
- Database queries (via Supabase)

---

### 4. Analytics (Product Analytics)
**Purpose:** Understand user behavior and product usage

**Current Stack:**
- 🔄 **PostHog** (to be implemented)
  - Event tracking
  - User funnels
  - Feature flags
  - A/B testing

**What we track:**
- User signups
- Link creation
- Drop creation
- Profile views
- Conversion funnels (signup → create link → share)

---

### 5. Tracing (Distributed Tracing)
**Purpose:** Track requests across services to identify bottlenecks

**Current Stack:**
- 🔄 **Sentry Performance** (included with Sentry)
  - Automatic performance tracing
  - Request waterfall visualization
  - Performance bottlenecks identification

**What we trace:**
- Frontend → Edge Function → Database requests
- API call chains
- Slow queries identification

---

## Implementation Roadmap

### Phase 1: Essential (Current Priority)
- [ ] **Sentry Setup**
  - Install `@sentry/react` for frontend
  - Install `@sentry/deno` for Edge Functions
  - Configure error tracking
  - Set up alerts (email/Slack)
  - Enable performance tracing

- [ ] **PostHog Setup**
  - Install PostHog SDK
  - Configure event tracking
  - Set up user identification
  - Track key events (signup, create link, create drop)
  - Create funnels

**Timeline:** 2-3 hours

### Phase 2: Enhanced Monitoring (Future)
- [ ] Custom metrics dashboard (if needed)
- [ ] Advanced alerting rules
- [ ] Performance budgets
- [ ] Custom dashboards

### Phase 3: Scale (If needed)
- [ ] Consider Datadog if infrastructure grows
- [ ] Custom Prometheus metrics
- [ ] Advanced tracing with OpenTelemetry

---

## Tools Comparison

| Tool | Purpose | Cost | Status |
|------|---------|------|--------|
| **Sentry** | Error Tracking + Tracing | Free tier generous | 🔄 To implement |
| **PostHog** | Product Analytics | Free up to 1M events/mo | 🔄 To implement |
| **Supabase Logs** | Logging | Included | ✅ Active |
| **Vercel Analytics** | Frontend Performance | Included | ✅ Active (if on Vercel) |
| **Datadog** | Full-stack monitoring | Paid | ❌ Not needed |

---

## Architecture

```
┌─────────────────────────────────────────┐
│         User Browser                     │
│  ┌───────────────────────────────────┐   │
│  │ Sentry (Error Tracking)          │   │
│  │ PostHog (Analytics)               │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Edge Functions (Deno)              │
│  ┌───────────────────────────────────┐   │
│  │ Sentry (Error Tracking + Tracing)│   │
│  │ PostHog (Event Tracking)         │   │
│  │ Supabase Logs                    │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Supabase (Backend)                  │
│  ┌───────────────────────────────────┐   │
│  │ Supabase Dashboard (Metrics)     │   │
│  │ Supabase Logs                    │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Key Events to Track (PostHog)

### User Lifecycle
- `user_signed_up`
- `user_signed_in`
- `user_signed_out`
- `user_deleted_account`

### Profile Actions
- `profile_created`
- `profile_viewed` (public)
- `profile_updated`

### Link Actions
- `link_created`
- `link_updated`
- `link_deleted`
- `link_clicked`

### Drop Actions
- `drop_created`
- `drop_updated`
- `drop_deleted`
- `drop_viewed` (public)
- `submission_received`

### Conversion Funnels
1. **Signup → Create Profile → Create Link → Share**
2. **Signup → Create Drop → Receive Submission**
3. **Free → Pro Upgrade**

---

## Environment Variables Needed

### Sentry
**Setup:**
1. Go to https://sentry.io → Your Organization
2. Create **two separate projects**:
   - **"onelink-web"** (React) - for frontend
   - **"onelink-edge-functions"** (Deno) - for Edge Functions
3. Copy the DSNs from each project

**Variables:**
```bash
# Frontend (React)
VITE_SENTRY_DSN=https://xxx@o4509609481928704.ingest.de.sentry.io/xxx

# Backend (Edge Functions)
SENTRY_DSN=https://xxx@o4509609481928704.ingest.de.sentry.io/xxx

# Environment
SENTRY_ENVIRONMENT=production|staging|development
```

**Note:** Create separate projects for OneLink (don't reuse neodash-ui projects)

### PostHog
**Setup:**
1. Go to https://app.posthog.com → Your Organization
2. Create **new project** named "OneLink"
3. Copy the Project API Key

**Variables:**
```bash
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://app.posthog.com
# Or EU: https://eu.i.posthog.com
```

**Note:** Create a separate project for OneLink (don't reuse neodash-ui project)

---

## Notes

- **Sentry** handles errors and performance tracing
- **PostHog** handles product analytics and user behavior
- **Supabase** provides built-in logging and metrics
- **Datadog** not needed - Sentry + PostHog cover our needs
- All tools have generous free tiers for MVP stage

