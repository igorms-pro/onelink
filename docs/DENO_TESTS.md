# Deno Edge Function Tests - Quick Guide

## What Are These Tests?

Tests for Supabase Edge Functions (serverless functions that run on Deno):
- `send-notification-email` - Sends email when new submission arrives
- `send-weekly-digest` - Sends weekly summary emails

**These tests use MOCKS - they do NOT send real emails or make real API calls.**

---

## Where to Run Them

### Option 1: From Project Root (Recommended)
```bash
# From /Users/igorms/Documents/Dev/onelink
pnpm test:deno
```

### Option 2: Using Deno Directly
```bash
# From project root
deno test supabase/functions/**/__tests__/*.test.ts --allow-read --allow-env
```

### Option 3: Test Specific Function
```bash
# Test only send-notification-email
pnpm test:deno:send-notification

# Test only send-weekly-digest
pnpm test:deno:weekly-digest
```

---

## When to Run Them

### ✅ Run Before:
- Deploying Edge Functions to Supabase
- Making changes to Edge Function code
- Creating Pull Requests

### ✅ Run Automatically:
- In CI/CD pipeline (GitHub Actions)
- On every push to `main` or `develop`
- On every Pull Request

### ❌ Don't Need to Run:
- When only working on frontend code
- When only working on database migrations
- For quick local development (unit tests are faster)

---

## Installation (One-Time Setup)

If Deno is not installed:

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Add to your shell profile (~/.zshrc or ~/.bashrc)
export PATH="$HOME/.deno/bin:$PATH"

# Verify
deno --version
```

---

## CI/CD Integration

The tests run automatically in GitHub Actions:

1. **When:** On every push/PR to `main` or `develop`
2. **Where:** In the `edge-function-tests` job
3. **What:** Tests both Edge Functions
4. **Result:** Build fails if tests fail

See `.github/workflows/ci.yml` for details.

---

## What Gets Tested?

### send-notification-email tests:
- ✅ Returns 405 for non-POST methods
- ✅ Handles CORS preflight
- ✅ Validates input (submission_id, user_id)
- ✅ Checks email preferences
- ✅ Rate limiting (5 min cooldown)
- ✅ Authorization checks
- ✅ Template rendering
- ✅ Error handling

### send-weekly-digest tests:
- ✅ Returns 405 for non-POST methods
- ✅ Handles CORS preflight
- ✅ Fetches users with weekly_digest enabled
- ✅ Aggregates submissions by drop
- ✅ Skips users without submissions
- ✅ Error handling per user
- ✅ Returns summary statistics

---

## Example Output

```bash
$ pnpm test:deno

running 14 tests from supabase/functions/send-notification-email/__tests__/index.test.ts
running 11 tests from supabase/functions/send-weekly-digest/__tests__/index.test.ts

test send-notification-email: returns 405 for non-POST methods ... ok (5ms)
test send-notification-email: handles CORS preflight ... ok (2ms)
test send-notification-email: returns 400 if submission_id missing ... ok (3ms)
...
test send-weekly-digest: returns 405 for non-POST methods ... ok (4ms)
...

test result: ok. 25 passed; 0 failed; 0 ignored; 0 measured
```

---

## Troubleshooting

**"deno: command not found"**
- Install Deno (see Installation section above)

**Tests fail with permission errors**
- Make sure you're using `--allow-read --allow-env` flags
- The package.json scripts already include these

**Tests pass but you're not sure they work**
- Check the test output - you should see "ok" for each test
- Tests use mocks, so they're fast and safe

---

## Summary

- **Location:** `supabase/functions/**/__tests__/*.test.ts`
- **Run from:** Project root with `pnpm test:deno`
- **When:** Before deploying Edge Functions, in CI/CD automatically
- **Safety:** Uses mocks - no real emails sent, no real API calls
