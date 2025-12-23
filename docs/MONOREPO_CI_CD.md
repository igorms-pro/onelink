# Monorepo CI/CD Strategy

This document explains how CI/CD is set up for the OneLink monorepo, following best practices used by big tech companies.

## 📁 Monorepo Structure

```
onelink/
├── apps/
│   ├── web/          # Main web application
│   └── landing/      # Landing page
├── supabase/         # Edge functions
└── .github/
    └── workflows/
        ├── ci.yml           # CI for web app
        ├── ci-landing.yml   # CI for landing app
        ├── cd.yml           # CD for web app
        └── cd-landing.yml   # CD for landing app
```

## 🎯 Monorepo CI/CD Best Practices

### 1. **Path-Based Filtering** (Used by Google, Facebook, Microsoft)

**Why:** Only run CI/CD when relevant files change, saving compute and time.

**How it works:**
- Each workflow uses `paths` filter to trigger only when relevant files change
- `apps/web/**` changes → triggers `ci.yml`
- `apps/landing/**` changes → triggers `ci-landing.yml`
- Shared code changes → triggers both workflows

**Example:**
```yaml
on:
  push:
    paths:
      - 'apps/landing/**'
      - '.github/workflows/ci-landing.yml'
```

### 2. **Independent Workflows** (Used by Uber, Airbnb)

**Why:** Each app can be developed, tested, and deployed independently.

**Benefits:**
- Faster feedback loops
- Parallel execution
- Independent versioning
- Reduced blast radius

**Our setup:**
- `ci.yml` - Web app CI (lint, type-check, unit tests, E2E)
- `ci-landing.yml` - Landing app CI (lint, type-check, unit tests, E2E)
- `cd.yml` - Web app deployment
- `cd-landing.yml` - Landing app deployment

### 3. **Caching Strategy** (Used by Netflix, Spotify)

**Why:** Speed up builds by caching dependencies and build artifacts.

**Our implementation:**
- **pnpm cache:** Per-app lockfile (`apps/web/pnpm-lock.yaml`, `apps/landing/pnpm-lock.yaml`)
- **Playwright cache:** Per-app browser cache
- **Build artifacts:** Uploaded for deployment

### 4. **Matrix Strategy** (Optional - for future scaling)

For larger monorepos, you can use matrix builds:

```yaml
jobs:
  test:
    strategy:
      matrix:
        app: [web, landing]
    steps:
      - run: cd apps/${{ matrix.app }} && pnpm test:ci
```

**When to use:**
- When you have 5+ apps
- When tests are similar across apps
- When you want to reduce workflow duplication

### 5. **Dependency Management** (Used by Google, Microsoft)

**Our approach:**
- Each app has its own `package.json` and `pnpm-lock.yaml`
- Root-level scripts for shared tooling (Deno tests)
- Independent dependency updates per app

## 🔄 Current Workflow Flow

### On Push to `main` or `develop`:

1. **Path Detection:**
   - Changed files in `apps/web/**` → Run `ci.yml`
   - Changed files in `apps/landing/**` → Run `ci-landing.yml`
   - Changed files in `supabase/**` → Run edge function tests

2. **Parallel Execution:**
   ```
   ┌─────────────────┐
   │  CI - Web       │  (if web files changed)
   ├─────────────────┤
   │  CI - Landing   │  (if landing files changed)
   ├─────────────────┤
   │  Edge Functions │  (if supabase files changed)
   └─────────────────┘
   ```

3. **Build & Deploy:**
   - After CI passes → CD workflows deploy to production

## 📊 Workflow Jobs

### CI - Landing (`ci-landing.yml`)

1. **lint-and-type-check**
   - TypeScript type checking
   - ESLint validation
   - Runs in parallel with unit-tests

2. **unit-tests**
   - Vitest unit tests
   - Coverage reporting
   - Runs in parallel with lint-and-type-check

3. **e2e-tests**
   - Playwright E2E tests
   - Builds app and runs tests
   - Uploads test reports

4. **build**
   - Production build verification
   - Uploads build artifacts
   - Depends on: lint-and-type-check, unit-tests

### CD - Landing (`cd-landing.yml`)

1. **deploy**
   - Builds production bundle
   - Deploys to hosting platform (Vercel/Netlify)
   - Only runs on `main` branch

## 🚀 How Big Tech Handles This

### Google (Bazel)
- Uses Bazel for build system
- Dependency graph analysis
- Incremental builds
- Remote caching

### Facebook/Meta (Buck)
- Build system with dependency tracking
- Parallel test execution
- Smart caching

### Microsoft (Rush)
- Rush.js for monorepo management
- Change detection
- Parallel builds

### Our Approach (Simplified)
- **pnpm workspaces** for dependency management
- **GitHub Actions** with path filters
- **Independent workflows** per app
- **Caching** for dependencies and browsers

## 🔧 Configuration Files

### Husky (Git Hooks)
- Root-level `.husky/` directory
- Hooks run checks for both apps
- Pre-commit: lint-staged for both apps
- Pre-push: type-check and tests for both apps

### Package Management
- Each app has independent `package.json`
- Root `package.json` for shared tooling
- pnpm workspaces for efficient dependency resolution

## 📈 Scaling Considerations

### When to Refactor:

1. **5+ apps:** Consider matrix strategy
2. **10+ apps:** Consider build system (Turborepo, Nx)
3. **Complex dependencies:** Consider dependency graph analysis
4. **Slow builds:** Consider remote caching (Turborepo Remote Cache)

### Current Status:
- ✅ 2 apps (web, landing)
- ✅ Path-based filtering
- ✅ Independent workflows
- ✅ Efficient caching
- ✅ Ready to scale

## 🎓 Key Takeaways

1. **Path filters** prevent unnecessary CI runs
2. **Independent workflows** allow parallel development
3. **Caching** speeds up builds significantly
4. **Per-app dependencies** enable independent updates
5. **Shared tooling** at root level reduces duplication

## 📚 Resources

- [GitHub Actions Path Filters](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpaths)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/repo) - Build system for monorepos
- [Nx](https://nx.dev/) - Monorepo build system
