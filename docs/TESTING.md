# Testing Guide

This document explains how to run all tests in the OneLink project.

## Test Types

### 1. Unit Tests (Vitest)
**Location:** `apps/web/src/**/__tests__/`
**Framework:** Vitest
**When to run:** Before committing, during development

```bash
# From project root
cd apps/web

# Run all unit tests
pnpm test

# Run tests in CI mode (single run, no watch)
pnpm test:ci

# Run with coverage
pnpm coverage
```

**What they test:**
- React components (hooks, UI components)
- Utility functions
- Business logic

---

### 2. E2E Tests (Playwright)
**Location:** `apps/web/e2e/`
**Framework:** Playwright
**When to run:** Before merging PRs, in CI/CD

```bash
# From project root
cd apps/web

# Run all E2E tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test e2e/notifications-realtime.spec.ts

# Run in UI mode (interactive)
pnpm exec playwright test --ui
```

**Requirements:**
- E2E test credentials must be set in environment:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `E2E_TEST_EMAIL`
  - `E2E_TEST_PASSWORD`

**What they test:**
- Full user workflows
- Browser interactions
- Real-time features
- Integration between components

---

### 3. Edge Function Tests (Deno)
**Location:** `supabase/functions/**/__tests__/`
**Framework:** Deno Test
**When to run:** Before deploying Edge Functions, in CI/CD

```bash
# From project root (requires Deno installed)

# Run all Edge Function tests
pnpm test:deno

# Run tests for specific function
pnpm test:deno:send-notification
pnpm test:deno:weekly-digest

# Run in watch mode (auto-rerun on changes)
pnpm test:deno:watch
```

**Installing Deno:**
```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Or using Homebrew
brew install deno

# Verify installation
deno --version
```

**What they test:**
- Edge Function request handling
- Error cases (400, 404, 500, etc.)
- Business logic (rate limiting, email preferences)
- Template rendering
- Database interactions (mocked)

**Important:** These tests use **mocks** - they do NOT:
- Send real emails
- Make real API calls
- Cost money
- Access real databases

---

## CI/CD Pipeline

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### CI Workflow Jobs:

1. **lint-and-type-check** - TypeScript and ESLint
2. **unit-tests** - Runs `pnpm test:ci` in `apps/web`
3. **edge-function-tests** - Runs Deno tests for Edge Functions
4. **e2e-tests** - Runs Playwright tests (requires credentials)
5. **build** - Builds the app (only if previous tests pass)

### Running Tests Locally

**Quick test (unit tests only):**
```bash
cd apps/web && pnpm test:ci
```

**Full test suite (if you have Deno installed):**
```bash
# Unit tests
cd apps/web && pnpm test:ci

# Edge Function tests
cd .. && pnpm test:deno

# E2E tests (requires credentials)
cd apps/web && pnpm exec playwright test
```

---

## Test File Structure

```
onelink/
├── apps/web/
│   ├── src/
│   │   └── **/__tests__/          # Unit tests (Vitest)
│   └── e2e/                        # E2E tests (Playwright)
│
└── supabase/functions/
    ├── send-notification-email/
    │   └── __tests__/
    │       └── index.test.ts       # Deno tests
    └── send-weekly-digest/
        └── __tests__/
            └── index.test.ts      # Deno tests
```

---

## Troubleshooting

### Deno tests fail with "command not found"
- Install Deno: `curl -fsSL https://deno.land/install.sh | sh`
- Add to PATH: `export PATH="$HOME/.deno/bin:$PATH"`

### E2E tests are skipped
- Set environment variables: `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`
- Or tests will skip gracefully (expected behavior)

### Unit tests fail
- Run `pnpm install` in `apps/web/`
- Check for TypeScript errors: `pnpm type-check`

---

## Best Practices

1. **Before committing:** Run unit tests locally
2. **Before PR:** Run all test types if possible
3. **In CI:** All tests run automatically
4. **Edge Functions:** Test locally before deploying
5. **E2E:** Run on critical paths before releases
