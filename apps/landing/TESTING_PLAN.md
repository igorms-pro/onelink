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
- [ ] Renders all sections in correct order
- [ ] Header is present
- [ ] Footer is present
- [ ] SEO meta tags are set
- [ ] Scroll animations initialize
- [ ] Analytics scroll depth tracking works
- [ ] All CTAs are functional

#### 15. PricingPage Component
**File:** `src/routes/__tests__/PricingPage.test.tsx`

**Test Cases:**
- [ ] Renders PricingSection
- [ ] Renders FeatureComparisonTable
- [ ] Renders PricingFAQ
- [ ] Renders PricingContact
- [ ] SEO meta tags are set
- [ ] Analytics tracking fires on page view

#### 16. FeaturesPage Component
**File:** `src/routes/__tests__/FeaturesPage.test.tsx`

**Test Cases:**
- [ ] Renders hero section
- [ ] Renders FeaturesSection
- [ ] Renders detailed features
- [ ] Screenshot placeholders render
- [ ] SEO meta tags are set
- [ ] Responsive layout works

### Priority 4: Utilities & Hooks

#### 17. Analytics Utilities
**File:** `src/lib/__tests__/analytics.test.ts`

**Test Cases:**
- [ ] `initAnalytics()` initializes PostHog correctly
- [ ] `initAnalytics()` handles missing API key gracefully
- [ ] `trackEvent()` sends events correctly
- [ ] `trackSignUpClick()` tracks with correct source
- [ ] `trackPricingView()` tracks page views
- [ ] `trackCTAClick()` tracks with correct type and location
- [ ] `trackScrollDepth()` tracks at correct milestones

#### 18. Scroll Animation Hook
**File:** `src/hooks/__tests__/useScrollAnimation.test.ts`

**Test Cases:**
- [ ] Initializes Intersection Observer
- [ ] Triggers animation when element enters viewport
- [ ] Cleans up observer on unmount
- [ ] Handles missing elements gracefully

#### 19. Scroll Depth Hook
**File:** `src/hooks/__tests__/useScrollDepth.test.ts`

**Test Cases:**
- [ ] Tracks scroll depth at 25%, 50%, 75%, 100%
- [ ] Only tracks each milestone once
- [ ] Throttles scroll events correctly
- [ ] Cleans up event listeners on unmount

#### 20. Router Configuration
**File:** `src/lib/__tests__/router.test.tsx`

**Test Cases:**
- [ ] All routes are defined correctly
- [ ] HomePage route works
- [ ] FeaturesPage route works
- [ ] PricingPage route works
- [ ] AuthRedirect route works
- [ ] NotFoundPage route works
- [ ] 404 page renders for unknown routes

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

**Phase 1: Core Component Tests (Week 1)**
- [ ] FeatureCard, PricingCard, StepCard
- [ ] Header, Footer
- [ ] SEO component

**Phase 2: Section Tests (Week 1-2)**
- [ ] HeroSection, FeaturesSection, PricingSection
- [ ] HowItWorksSection, CTASection
- [ ] SocialProofSection, DemoSection

**Phase 3: Page Tests (Week 2)**
- [ ] HomePage, PricingPage, FeaturesPage
- [ ] Router tests

**Phase 4: E2E Tests (Week 2-3)**
- [ ] Critical user flows
- [ ] Responsive tests
- [ ] Accessibility tests

**Phase 5: Performance & SEO (Week 3)**
- [ ] Performance tests
- [ ] SEO validation tests

---

**Last Updated:** 2025-01-15  
**Next Review:** After Phase 1 completion
