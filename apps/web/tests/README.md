# Testing Guide

## Unit Tests (Vitest)

Run unit tests:
```bash
pnpm test
```

Run with coverage:
```bash
pnpm test --coverage
```

Run in watch mode:
```bash
pnpm test --watch
```

Run in CI:
```bash
pnpm test:ci
```

### Test Files
- `tests/domain.test.ts` - Domain utility functions
- `tests/i18n.test.ts` - Internationalization
- `tests/profile.test.ts` - Profile management utilities

## E2E Tests (Playwright)

Install browsers:
```bash
pnpm exec playwright install
```

Run E2E tests:
```bash
pnpm e2e:ci
```

Run with UI:
```bash
pnpm exec playwright test --ui
```

Run specific test:
```bash
pnpm exec playwright test e2e/public.spec.ts
```

### Test Files
- `e2e/public.spec.ts` - Public profile page tests
- `e2e/auth.spec.ts` - Authentication flow tests

## CI/CD

GitHub Actions runs:
1. **Lint & Type Check** - ESLint + TypeScript validation
2. **Unit Tests** - All Vitest tests
3. **E2E Tests** - Playwright tests against preview build
4. **Build** - Production build verification

CD workflow (on main branch):
- Builds production bundle
- Ready for Vercel deployment (uncomment when ready)

## Setting Up Test Data

For E2E tests that require Supabase data:

1. Create a test Supabase project
2. Seed test profiles/users:
   ```sql
   INSERT INTO profiles (user_id, slug, display_name) 
   VALUES ('test-user-id', 'test-slug', 'Test User');
   ```
3. Add test credentials to GitHub Secrets (for CI)
4. Uncomment test cases in `e2e/*.spec.ts`

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from "vitest";

describe("MyComponent", () => {
  it("does something", () => {
    expect(true).toBe(true);
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from "@playwright/test";

test("user can do something", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
```

