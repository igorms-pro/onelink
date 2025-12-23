# Landing Page Testing Plan

**Status:** 🟡 In Progress  
**Last Updated:** 2025-01-15

---

## 📋 Overview

This document outlines the comprehensive testing strategy for the OneLink landing page. The landing page is critical for conversion, so thorough testing is essential.

**Testing Stack:**

- **Unit Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Type Checking:** TypeScript
- **Linting:** ESLint

---

## 🎯 Testing Goals

1. **Functionality:** All features work as expected
2. **Responsiveness:** Works on all screen sizes
3. **Performance:** Fast load times and smooth interactions
4. **Accessibility:** WCAG 2.1 AA compliance
5. **SEO:** Meta tags and structured data correct
6. **Cross-browser:** Works on Chrome, Firefox, Safari
7. **Conversion:** CTAs and links work correctly

---

## 📦 Test Structure

```
apps/landing/
├── src/
│   ├── components/
│   │   ├── __tests__/          # Unit tests for components
│   │   │   ├── FeatureCard.test.tsx
│   │   │   ├── PricingCard.test.tsx
│   │   │   ├── StepCard.test.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── Footer.test.tsx
│   │   │   └── SEO.test.tsx
│   │   └── sections/
│   │       └── __tests__/
│   │           ├── HeroSection.test.tsx
│   │           ├── FeaturesSection.test.tsx
│   │           ├── PricingSection.test.tsx
│   │           └── ...
│   └── routes/
│       └── __tests__/
│           ├── HomePage.test.tsx
│           ├── PricingPage.test.tsx
│           └── FeaturesPage.test.tsx
├── e2e/
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   ├── pricing.spec.ts
│   ├── features.spec.ts
│   ├── cta-flows.spec.ts
│   ├── responsive.spec.ts
│   └── accessibility.spec.ts
└── __mocks__/                   # Mock data and utilities
    ├── posthog.ts
    └── router.tsx
```

---

## 🧪 Unit Tests (Vitest)

### Priority 1: Core Components

#### 1. FeatureCard Component

**File:** `src/components/__tests__/FeatureCard.test.tsx`

**Test Cases:**

- [ ] Renders with title and description
- [ ] Displays icon correctly
- [ ] Applies hover effects
- [ ] Handles missing props gracefully
- [ ] Renders correctly in dark mode
- [ ] Is accessible (keyboard navigation, ARIA labels)

#### 2. PricingCard Component

**File:** `src/components/__tests__/PricingCard.test.tsx`

**Test Cases:**

- [ ] Renders Free plan correctly
- [ ] Renders Pro plan correctly
- [ ] Highlights Pro plan when `highlighted={true}`
- [ ] Displays all features correctly
- [ ] CTA button works and tracks analytics
- [ ] Handles click events correctly
- [ ] Renders correctly in dark mode
- [ ] Is accessible

#### 3. StepCard Component

**File:** `src/components/__tests__/StepCard.test.tsx`

**Test Cases:**

- [ ] Renders step number correctly
- [ ] Displays title and description
- [ ] Shows icon correctly
- [ ] Handles different step positions (first, middle, last)
- [ ] Renders correctly in dark mode

#### 4. Header Component

**File:** `src/components/__tests__/Header.test.tsx`

**Test Cases:**

- [ ] Renders navigation links
- [ ] Mobile menu toggles correctly
- [ ] Language toggle works
- [ ] Theme toggle works
- [ ] CTA button renders and links correctly
- [ ] Mobile menu closes on link click
- [ ] Is accessible (keyboard navigation)

#### 5. Footer Component

**File:** `src/components/__tests__/Footer.test.tsx`

**Test Cases:**

- [ ] Renders all footer sections
- [ ] All links are correct
- [ ] Social links work
- [ ] Legal links point to correct pages
- [ ] Copyright year is current
- [ ] Is accessible

#### 6. SEO Component

**File:** `src/components/__tests__/SEO.test.tsx`

**Test Cases:**

- [ ] Sets document title correctly
- [ ] Sets meta description correctly
- [ ] Sets Open Graph tags
- [ ] Sets Twitter Card tags
- [ ] Sets canonical URL
- [ ] Handles missing props gracefully

### Priority 2: Section Components

#### 7. HeroSection Component

**File:** `src/components/sections/__tests__/HeroSection.test.tsx`

**Test Cases:**

- [ ] Renders headline and subheadline
- [ ] Primary CTA button works and tracks analytics
- [ ] Secondary CTA button scrolls to demo section
- [ ] Visual placeholder renders
- [ ] Responsive layout works
- [ ] Is accessible

#### 8. FeaturesSection Component

**File:** `src/components/sections/__tests__/FeaturesSection.test.tsx`

**Test Cases:**

- [ ] Renders all 6 feature cards
- [ ] Grid layout is correct (3x2 desktop, 1x6 mobile)
- [ ] Features data is correct
- [ ] Icons render correctly
- [ ] Responsive layout works
- [ ] Scroll animations trigger

#### 9. PricingSection Component

**File:** `src/components/sections/__tests__/PricingSection.test.tsx`

**Test Cases:**

- [ ] Renders Free and Pro plans
- [ ] Pro plan is highlighted
- [ ] Feature lists are correct
- [ ] CTA buttons work
- [ ] Responsive layout (2-column desktop, stacked mobile)
- [ ] Analytics tracking works

#### 10. HowItWorksSection Component

**File:** `src/components/sections/__tests__/HowItWorksSection.test.tsx`

**Test Cases:**

- [ ] Renders all 4 steps
- [ ] Timeline layout is correct (horizontal desktop, vertical mobile)
- [ ] Step numbers are sequential
- [ ] Icons render correctly
- [ ] Responsive layout works

#### 11. CTASection Component

**File:** `src/components/sections/__tests__/CTASection.test.tsx`

**Test Cases:**

- [ ] Renders headline
- [ ] Primary CTA works and tracks analytics
- [ ] Secondary link works
- [ ] Purple gradient background renders
- [ ] Responsive layout works

#### 12. SocialProofSection Component

**File:** `src/components/sections/__tests__/SocialProofSection.test.tsx`

**Test Cases:**

- [ ] Renders user count
- [ ] Testimonials render (if any)
- [ ] Trust badges render (if any)
- [ ] Responsive layout works

#### 13. DemoSection Component

**File:** `src/components/sections/__tests__/DemoSection.test.tsx`

**Test Cases:**

- [ ] Renders screenshot placeholder
- [ ] Device mockup renders (if implemented)
- [ ] Scroll animation triggers
- [ ] Caption/description renders
- [ ] Responsive layout works

### Priority 3: Page Components

#### 14. HomePage Component

**File:** `src/routes/__tests__/HomePage.test.tsx`

**Test Cases:**

- [x] Renders all sections in correct order
- [x] Header is present
- [x] Footer is present
- [x] SEO meta tags are set
- [x] Scroll animations initialize
- [x] Analytics scroll depth tracking works
- [x] All CTAs are functional

#### 15. PricingPage Component

**File:** `src/routes/__tests__/PricingPage.test.tsx`

**Test Cases:**

- [x] Renders PricingSection
- [x] Renders FeatureComparisonTable
- [x] Renders PricingFAQ
- [x] Renders PricingContact
- [x] SEO meta tags are set
- [x] Analytics tracking fires on page view

#### 16. FeaturesPage Component

**File:** `src/routes/__tests__/FeaturesPage.test.tsx`

**Test Cases:**

- [x] Renders hero section
- [x] Renders FeaturesSection
- [x] Renders detailed features
- [x] Screenshot placeholders render
- [x] SEO meta tags are set
- [x] Responsive layout works

### Priority 4: Utilities & Hooks

#### 17. Analytics Utilities

**File:** `src/lib/__tests__/analytics.test.ts`

**Test Cases:**

- [x] `initAnalytics()` initializes PostHog correctly
- [x] `initAnalytics()` handles missing API key gracefully
- [x] `trackEvent()` sends events correctly
- [x] `trackSignUpClick()` tracks with correct source
- [x] `trackPricingView()` tracks page views
- [x] `trackCTAClick()` tracks with correct type and location
- [x] `trackScrollDepth()` tracks at correct milestones

#### 18. Scroll Animation Hook

**File:** `src/hooks/__tests__/useScrollAnimation.test.ts`

**Test Cases:**

- [x] Initializes Intersection Observer
- [x] Triggers animation when element enters viewport
- [x] Cleans up observer on unmount
- [x] Handles missing elements gracefully

#### 19. Scroll Depth Hook

**File:** `src/hooks/__tests__/useScrollDepth.test.ts`

**Test Cases:**

- [x] Tracks scroll depth at 25%, 50%, 75%, 100%
- [x] Only tracks each milestone once
- [x] Throttles scroll events correctly
- [x] Cleans up event listeners on unmount

#### 20. Router Configuration

**File:** `src/lib/__tests__/router.test.tsx`

**Test Cases:**

- [x] All routes are defined correctly
- [x] HomePage route works
- [x] FeaturesPage route works
- [x] PricingPage route works
- [x] AuthRedirect route works
- [x] NotFoundPage route works
- [x] 404 page renders for unknown routes

---

## 🎭 E2E Tests (Playwright)

### Priority 1: Critical User Flows

#### 1. Homepage Load & Navigation

**File:** `e2e/homepage.spec.ts`

**Test Cases:**

- [ ] Homepage loads successfully
- [ ] All sections are visible
- [ ] Navigation links work
- [ ] Mobile menu opens and closes
- [ ] Language toggle works
- [ ] Theme toggle works
- [ ] Footer links work
- [ ] Page title and meta tags are correct

#### 2. CTA Conversion Flows

**File:** `e2e/cta-flows.spec.ts`

**Test Cases:**

- [ ] Hero "Get Started Free" button redirects to app
- [ ] Hero "View Demo" button scrolls to demo section
- [ ] Pricing "Get Started Free" button redirects to app
- [ ] Pricing "Upgrade to Pro" button redirects to app pricing
- [ ] CTA section "Create Your Free Account" button redirects to app
- [ ] Analytics events fire on CTA clicks
- [ ] All CTAs are visible and clickable

#### 3. Pricing Page Flow

**File:** `e2e/pricing.spec.ts`

**Test Cases:**

- [ ] Pricing page loads successfully
- [ ] Free and Pro plans are displayed
- [ ] Feature comparison table is visible
- [ ] FAQ section expands/collapses correctly
- [ ] Contact form works (if implemented)
- [ ] "Get Started" buttons redirect correctly
- [ ] Analytics tracking fires on page view

#### 4. Features Page Flow

**File:** `e2e/features.spec.ts`

**Test Cases:**

- [ ] Features page loads successfully
- [ ] All 6 features are displayed
- [ ] Detailed feature sections expand correctly
- [ ] Screenshot placeholders are visible
- [ ] Navigation back to homepage works
- [ ] SEO meta tags are correct

#### 5. Auth Redirect Flow

**File:** `e2e/auth-redirect.spec.ts`

**Test Cases:**

- [ ] `/auth` route redirects to `app.getonelink.io/auth`
- [ ] Redirect happens immediately
- [ ] Loading message displays during redirect
- [ ] Redirect uses `window.location.replace()` (no back button)

### Priority 2: Responsive Design

#### 6. Responsive Layout Tests

**File:** `e2e/responsive.spec.ts`

**Test Cases:**

- [ ] Mobile layout (< 768px) works correctly
  - [ ] Sections stack vertically
  - [ ] Mobile menu works
  - [ ] Touch targets are large enough (min 44x44px)
  - [ ] Text is readable
  - [ ] CTAs are accessible
- [ ] Tablet layout (768px - 1024px) works correctly
  - [ ] 2-column layouts work
  - [ ] Navigation is accessible
- [ ] Desktop layout (> 1024px) works correctly
  - [ ] Multi-column layouts work
  - [ ] Hover effects work
  - [ ] All sections are visible

**Viewports to Test:**

- Mobile: 375x667 (iPhone SE)
- Mobile: 390x844 (iPhone 12)
- Tablet: 768x1024 (iPad)
- Desktop: 1280x720
- Desktop: 1920x1080

### Priority 3: Cross-Browser Testing

#### 7. Cross-Browser Compatibility

**File:** `e2e/cross-browser.spec.ts`

**Test Cases:**

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work (if needed)

**Note:** Playwright config already includes chromium, firefox, webkit projects.

### Priority 4: Accessibility

#### 8. Accessibility Tests

**File:** `e2e/accessibility.spec.ts`

**Test Cases:**

- [ ] Page has proper heading hierarchy (h1, h2, h3)
- [ ] All images have alt text
- [ ] All links have descriptive text
- [ ] Forms have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] ARIA labels are correct
- [ ] Screen reader compatibility (basic checks)

**Tools:**

- Playwright accessibility checks
- axe-core integration (optional)

### Priority 5: Performance

#### 9. Performance Tests

**File:** `e2e/performance.spec.ts`

**Test Cases:**

- [ ] Page loads in < 3 seconds (Lighthouse)
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] No console errors
- [ ] No network errors (404s, etc.)

**Note:** Can use Playwright's performance API or Lighthouse CI.

### Priority 6: SEO

#### 10. SEO Tests

**File:** `e2e/seo.spec.ts`

**Test Cases:**

- [ ] All pages have unique titles
- [ ] All pages have meta descriptions
- [ ] Open Graph tags are present
- [ ] Twitter Card tags are present
- [ ] Canonical URLs are correct
- [ ] Sitemap.xml is accessible
- [ ] Robots.txt is accessible
- [ ] Structured data (JSON-LD) is valid (if implemented)
- [ ] No broken internal links
- [ ] All external links use `rel="noopener noreferrer"`

---

## 🚀 Test Execution

### Running Tests Locally

```bash
# Unit tests (watch mode)
pnpm test

# Unit tests (CI mode)
pnpm test:ci

# Unit tests with coverage
pnpm coverage

# E2E tests
pnpm e2e:ci

# All tests
pnpm test:ci && pnpm e2e:ci
```

### Running Tests in CI

Tests should run automatically on:

- Pull requests
- Pushes to main branch
- Before deployment

**CI Configuration:**

- Unit tests: Run in parallel
- E2E tests: Run on Chromium only (faster)
- Coverage: Generate and upload to coverage service

---

## 📊 Test Coverage Goals

**Target Coverage:**

- **Unit Tests:** 80%+ code coverage
- **E2E Tests:** All critical user flows covered
- **Component Tests:** All public components tested

**Priority Order:**

1. ✅ Critical user flows (CTAs, navigation)
2. ✅ Core components (PricingCard, FeatureCard, Header, Footer)
3. ✅ Analytics tracking
4. ✅ Responsive design
5. ✅ Accessibility
6. ✅ SEO meta tags

---

## 🐛 Known Issues & Test Gaps

### Current Gaps

- [ ] No real component tests yet (only example test)
- [ ] Minimal E2E coverage (only 3 example tests)
- [ ] No accessibility tests
- [ ] No performance tests
- [ ] No visual regression tests

### Future Enhancements

- [ ] Visual regression testing (Percy, Chromatic, or Playwright screenshots)
- [ ] Load testing (if needed)
- [ ] A/B test validation
- [ ] Analytics event validation in staging

---

## 📝 Test Data & Mocks

### Mock Data

- PostHog analytics (mock in tests)
- Router navigation (mock in unit tests)
- API calls (if any)

### Test Utilities

- `renderWithRouter()` - Render component with router context
- `renderWithTheme()` - Render component with theme provider
- `mockPostHog()` - Mock PostHog analytics

---

## ✅ Testing Checklist

### Before Deployment

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Test coverage meets goals
- [ ] Manual smoke test on staging
- [ ] Cross-browser manual check (Chrome, Firefox, Safari)
- [ ] Mobile device manual check
- [ ] Performance check (Lighthouse)
- [ ] Accessibility check (basic)

### After Deployment

- [ ] Smoke test on production
- [ ] Analytics events firing correctly
- [ ] All CTAs redirect correctly
- [ ] SEO meta tags correct (check with validators)
- [ ] No console errors in production

---

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 📅 Implementation Timeline

### Parallelization Strategy

**✅ Highly Parallelizable Within Phases:**

- All unit tests within a phase can be written simultaneously
- Each test file is independent
- Can assign different components to different developers

**🔄 Sequential Dependencies Between Phases:**

- Phase 2 uses components from Phase 1 (logical dependency, not technical blocker)
- Phase 3 uses sections from Phase 2 (logical dependency)
- Phase 4 needs pages to exist (but can start once pages are built, doesn't need Phase 1-3 tests done)
- Phase 5 can run independently

**⚡ Maximum Parallelization Approach:**

- **Week 1:** Phase 1 + Phase 2 + Phase 5 (all in parallel)
- **Week 2:** Phase 3 + Phase 4 (in parallel)

---

### Detailed Timeline

#### Phase 1: Core Component Tests

**Timeline:** Week 1 (can be done in parallel)  
**Dependencies:** None  
**Parallelizable:** ✅ Yes - All 6 components can be tested simultaneously

- [ ] FeatureCard (independent)
- [ ] PricingCard (independent)
- [ ] StepCard (independent)
- [ ] Header (independent)
- [ ] Footer (independent)
- [ ] SEO component (independent)

**Assign to:** 1-6 developers (one per component)

---

#### Phase 2: Section Tests

**Timeline:** Week 1-2 (can be done in parallel with Phase 1)  
**Dependencies:** Components exist (not tests, just code)  
**Parallelizable:** ✅ Yes - All 7 sections can be tested simultaneously

- [x] HeroSection (independent)
- [x] FeaturesSection (uses FeatureCard, but component exists)
- [x] PricingSection (uses PricingCard, but component exists)
- [x] HowItWorksSection (uses StepCard, but component exists)
- [x] CTASection (independent)
- [x] SocialProofSection (independent)
- [x] DemoSection (independent)

**Assign to:** 1-7 developers (one per section)

**Note:** You can write Phase 2 tests even if Phase 1 tests aren't done yet, as long as the components themselves exist.

**Status:** ✅ **COMPLETED** - All 7 section test files created with 58 passing tests covering all test cases.

---

#### Phase 3: Page Tests

**Timeline:** Week 2 (can start after sections exist)  
**Dependencies:** Sections exist (not tests, just code)  
**Parallelizable:** ✅ Yes - All 4 page tests can be done simultaneously

- [x] HomePage (uses all sections, but sections exist)
- [x] PricingPage (uses PricingSection, but section exists)
- [x] FeaturesPage (uses FeaturesSection, but section exists)
- [x] Router tests (independent)

**Assign to:** 1-4 developers (one per page)

**Note:** Can start Phase 3 as soon as sections are built, doesn't need Phase 1-2 tests complete.

**Status:** ✅ **COMPLETED** - All 4 page test files created with 30 passing tests covering all test cases.

---

#### Phase 4: E2E Tests

**Timeline:** Week 2-3 (can start once pages exist)  
**Dependencies:** Pages exist and work (not unit tests)  
**Parallelizable:** ✅ Yes - All E2E test suites can be written simultaneously

- [x] homepage.spec.ts (independent)
- [x] cta-flows.spec.ts (independent)
- [x] pricing.spec.ts (independent)
- [x] features.spec.ts (independent)
- [x] auth-redirect.spec.ts (independent)
- [x] responsive.spec.ts (independent)
- [x] accessibility.spec.ts (independent)
- [x] cross-browser.spec.ts (independent)
- [x] performance.spec.ts (independent)
- [x] seo.spec.ts (independent)

**Assign to:** 1-10 developers (one per test suite)

**Note:** E2E tests can be written in parallel with unit tests. They just need the pages to exist and work.

**Status:** ✅ **COMPLETED** - All 10 E2E test suites created with comprehensive test coverage covering all test cases from the plan.

---

#### Phase 5: Performance & SEO

**Timeline:** Week 1-3 (can be done anytime)  
**Dependencies:** Pages exist  
**Parallelizable:** ✅ Yes - Can be done independently

- [x] Performance tests (Lighthouse, metrics)
- [x] SEO validation tests (meta tags, sitemap, robots.txt)

**Assign to:** 1-2 developers

**Note:** Can start as soon as pages are deployed, doesn't need other tests done.

**Status:** ✅ **COMPLETED** - Created `e2e/performance.spec.ts` with 10 performance test cases covering load times, FCP, LCP, CLS, TTI, console errors, network errors, and page size. Created `e2e/seo.spec.ts` with 18 SEO validation test cases covering meta tags, Open Graph, Twitter Cards, canonical URLs, sitemap.xml, robots.txt, internal links, external links, heading hierarchy, and image alt text.

---

## 🚀 Recommended Parallel Execution Plan

### Option A: Maximum Speed (All Parallel)

**Week 1:**

- Developer 1: FeatureCard tests
- Developer 2: PricingCard tests
- Developer 3: StepCard tests
- Developer 4: Header tests
- Developer 5: Footer tests
- Developer 6: SEO tests
- Developer 7: HeroSection tests
- Developer 8: FeaturesSection tests
- Developer 9: PricingSection tests
- Developer 10: HowItWorksSection tests
- Developer 11: CTASection tests
- Developer 12: SocialProofSection tests
- Developer 13: DemoSection tests
- Developer 14: Performance tests
- Developer 15: SEO validation tests

**Week 2:**

- Developer 1: HomePage tests
- Developer 2: PricingPage tests
- Developer 3: FeaturesPage tests
- Developer 4: Router tests
- Developer 5-14: E2E test suites (all in parallel)

### Option B: Realistic (Smaller Team)

**Week 1:**

- Day 1-2: Phase 1 (Core Components) - 1 developer, sequential
- Day 3-4: Phase 2 (Sections) - 1 developer, sequential
- Day 5: Phase 5 (Performance/SEO) - 1 developer

**Week 2:**

- Day 1-2: Phase 3 (Pages) - 1 developer
- Day 3-5: Phase 4 (E2E) - 1 developer, sequential

### Option C: Balanced (2-3 Developers)

**Week 1:**

- Dev 1: Phase 1 (Core Components)
- Dev 2: Phase 2 (Sections) + Phase 5 (Performance/SEO)

**Week 2:**

- Dev 1: Phase 3 (Pages)
- Dev 2: Phase 4 (E2E Tests)

---

## 📊 Parallelization Summary

| Phase                    | Can Parallelize? | Within Phase     | With Other Phases     |
| ------------------------ | ---------------- | ---------------- | --------------------- |
| Phase 1: Core Components | ✅ Yes           | All 6 components | Can start immediately |
| Phase 2: Sections        | ✅ Yes           | All 7 sections   | Can run with Phase 1  |
| Phase 3: Pages           | ✅ Yes           | All 4 pages      | Can run with Phase 2  |
| Phase 4: E2E             | ✅ Yes           | All 10 suites    | Can run with Phase 3  |
| Phase 5: Performance/SEO | ✅ Yes           | Both tests       | Can run anytime       |

**Key Insight:** All phases can run in parallel! The "dependencies" are logical (components exist), not technical (tests don't depend on other tests).

---

**Last Updated:** 2025-01-15  
**Next Review:** After Phase 1 completion
