# Landing Page - Site Vitrine

**Status:** 🔴 Not Started  
**Priority:** High (MVP Launch)  
**Estimated Time:** 8-12 hours  
**Domain:** `getonelink.io`

---

## 📋 Vue d'Ensemble

Créer un site vitrine professionnel pour présenter OneLink, convertir les visiteurs en utilisateurs, et servir de point d'entrée principal avant l'application.

**Architecture:**
```
getonelink.io          → Landing page (site vitrine)
getonelink.io/auth     → Sign in / Sign up (ou redirect vers app)
app.getonelink.io      → Application (dashboard, settings, etc.)
```

---

## 🎯 Objectifs

1. **Conversion:** Convertir les visiteurs en utilisateurs (sign up)
2. **SEO:** Optimiser pour les recherches Google
3. **Branding:** Présenter OneLink de manière professionnelle
4. **Trust:** Construire la confiance (testimonials, features, pricing)
5. **Navigation:** Guider vers l'application (`app.getonelink.io`)

---

## 🏗️ System Design

### Architecture Technique

**✅ Decision: Monorepo Structure (Pattern 1 - Separate Landing App)**

**Architecture:**
- **Location:** `apps/landing/` (new folder in monorepo)
- **Domain:** `getonelink.io`
- **Deployment:** Vercel (separate project)
- **Stack:** Vite + React + Tailwind CSS (same as current app)

**Why this approach:**
- ✅ Same tech stack (no learning curve)
- ✅ Can share components/styles if needed
- ✅ Single git repo (easier maintenance)
- ✅ Independent deployments (separate Vercel projects)
- ✅ Clean separation: marketing site vs. app

**Domain Structure:**
```
getonelink.io          → Landing page (apps/landing)
app.getonelink.io      → Application (apps/web)
```

**SEO Handling:**
- Use `react-helmet-async` for meta tag management
- Add `vite-plugin-prerender` for static pre-rendering (post-MVP)
- Proper meta tags in `index.html` + dynamic updates per route
- See `docs/issues/ISSUE.md` for detailed SEO implementation plan

### Structure des Routes

```
getonelink.io/
  ├─ /                    → Hero, Features, Pricing, CTA
  ├─ /features             → Features détaillées
  ├─ /pricing              → Pricing page (peut être / aussi)
  ├─ /about                → About us (optionnel)
  ├─ /blog                 → Blog (optionnel, futur)
  ├─ /docs                 → Documentation (optionnel, futur)
  ├─ /auth                 → Sign in / Sign up (ou redirect vers app.getonelink.io/auth)
  └─ /privacy              → Privacy Policy (déjà créé)
  └─ /terms                → Terms of Service (déjà créé)
```

### DNS Configuration

**Hostinger DNS:**
```
Type    Name    Value                    TTL
A       @       (IP Vercel)              Auto
CNAME   www     cname.vercel-dns.com     Auto
CNAME   app     cname.vercel-dns.com     Auto
```

**Vercel Domains:**
- `getonelink.io`
- `www.getonelink.io`

---

## 📐 Design & Sections

> **📐 Full Wireframe:** See `docs/LANDING_PAGE_WIREFRAME.md` for detailed wireframes, layouts, and visual conception of all sections.

---

### 1. Hero Section
**Objectif:** Capturer l'attention, expliquer la valeur en 10 secondes

**Contenu:**
- **Headline:** "One Link to Share Everything"
- **Subheadline:** "Share your links, files, and drops with one simple link. No more messy bios or multiple links."
- **CTA Primary:** "Get Started Free" → `/auth` ou `app.getonelink.io/auth`
- **CTA Secondary:** "View Demo" → Scroll to demo section
- **Visual:** Screenshot/GIF de l'app en action, ou illustration moderne

**Design:**
- Gradient purple background (cohérent avec app)
- Centered layout
- Large, bold typography
- Mobile-first responsive

---

### 2. Features Section
**Objectif:** Expliquer les fonctionnalités principales

**Features à mettre en avant:**
1. **One Link for Everything**
   - Un seul lien pour partager tout
   - Bio link moderne
   - Icon: Link icon

2. **File Sharing (Drops)**
   - Partage de fichiers facile
   - Upload multiple
   - Public/Private
   - Icon: Upload/Cloud icon

3. **Real-time Notifications**
   - Notifications en temps réel
   - Emails automatiques
   - Badge de comptage
   - Icon: Bell icon

4. **Customizable Profile**
   - Profil personnalisable
   - Thème dark/light
   - Analytics intégrés
   - Icon: User/Profile icon

5. **Privacy & Security**
   - Contrôle total
   - Drops privés/publics
   - 2FA disponible
   - Icon: Lock icon

6. **Analytics**
   - Stats en temps réel
   - Clics, vues, downloads
   - Insights détaillés
   - Icon: Chart icon

**Layout:**
- Grid 3x2 (desktop) ou 1x6 (mobile)
- Card design avec icon, title, description
- Hover effects
- Purple accents cohérents

---

### 3. How It Works
**Objectif:** Expliquer le processus en 3-4 étapes simples

**Steps:**
1. **Sign Up** → Create account (free)
2. **Create Your Link** → Add links, upload files
3. **Share** → One link to share everywhere
4. **Track** → See analytics in real-time

**Design:**
- Horizontal timeline (desktop)
- Vertical timeline (mobile)
- Numbered steps
- Icons/illustrations

---

### 4. Pricing Section
**Objectif:** Présenter les plans et convertir

**Plans à afficher:**
- **Free Plan:**
  - 5 links
  - 3 drops
  - Basic analytics
  - CTA: "Get Started Free"

- **Pro Plan:**
  - Unlimited links
  - Unlimited drops
  - Advanced analytics
  - Custom domain
  - Priority support
  - CTA: "Upgrade to Pro"

**Design:**
- 2-column layout (Free | Pro)
- Pro highlighted (purple gradient)
- Feature comparison table
- Mobile: Stacked cards

**Note:** Pricing déjà implémenté dans `/pricing` - peut réutiliser ou créer version landing simplifiée.

---

### 5. Social Proof / Testimonials
**Objectif:** Construire la confiance

**Contenu:**
- Testimonials (si disponibles)
- User count: "Join X users"
- Trust badges (si applicable)
- Screenshots de l'app

**Design:**
- Carousel ou grid
- Avatar + quote
- Stars rating (si applicable)

---

### 6. Demo / Screenshot Section
**Objectif:** Montrer l'app en action

**Contenu:**
- Screenshot de dashboard
- GIF ou vidéo de workflow
- Interactive demo (optionnel)

**Design:**
- Large visual
- Device mockup (iPhone/MacBook)
- Animated on scroll

---

### 7. CTA Section (Final)
**Objectif:** Conversion finale

**Contenu:**
- "Ready to get started?"
- CTA: "Create Your Free Account"
- Link: "Or view pricing" → `/pricing`

**Design:**
- Purple gradient background
- Centered, bold
- Large button

---

### 8. Footer
**Objectif:** Navigation et legal

**Sections:**
- **Product:**
  - Features
  - Pricing
  - Roadmap (optionnel)

- **Company:**
  - About
  - Blog (futur)
  - Contact

- **Legal:**
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)

- **Social:**
  - Twitter/X
  - GitHub (si open source)
  - LinkedIn

- **App:**
  - Sign In → `app.getonelink.io/auth`
  - Sign Up → `app.getonelink.io/auth`

**Design:**
- Multi-column layout
- Dark background
- Links organized

---

## 🎨 Design System

### Colors
- **Primary:** Purple gradient (cohérent avec app)
- **Background:** White (light) / Dark (dark mode)
- **Text:** Gray scale
- **Accents:** Purple, blue

### Typography
- **Headings:** Bold, large (Inter ou système)
- **Body:** Regular, readable
- **CTA:** Bold, uppercase (optionnel)

### Components
- Reutiliser composants de l'app si possible (buttons, cards)
- Créer composants spécifiques landing si nécessaire
- Responsive mobile-first

---

## 📱 Responsive Design

- **Mobile:** Stacked sections, large touch targets
- **Tablet:** 2-column layouts
- **Desktop:** Full width, multi-column

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🚀 Implementation Tasks

### Phase 1: Project Setup & Infrastructure

#### Issue 1: Create Landing App Structure
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 1.5h  
**Can Parallelize:** No (foundation)

**Tasks:**
- [ ] Create `apps/landing/` folder in monorepo
- [ ] Initialize Vite + React + TypeScript project
- [ ] Setup Tailwind CSS with `@tailwindcss/vite` plugin (same as `apps/web`)
- [ ] Create basic folder structure:
  ```
  apps/landing/
  ├── src/
  │   ├── components/
  │   ├── routes/
  │   ├── lib/
  │   │   ├── locales/
  │   │   └── i18n.ts
  │   └── main.tsx
  ├── public/
  ├── e2e/              (for Playwright tests)
  ├── index.html
  ├── vite.config.ts
  ├── vitest.config.ts
  ├── vitest.setup.ts
  ├── playwright.config.ts
  ├── tailwind.config.js
  ├── tsconfig.json
  ├── tsconfig.app.json
  ├── tsconfig.node.json
  ├── .eslintrc.cjs     (copy from apps/web)
  ├── .prettierrc       (copy from apps/web)
  └── package.json
  ```
- [ ] Configure path aliases (`@/` for src) in `vite.config.ts` and `tsconfig.json`
- [ ] Setup ESLint/Prettier (copy configs from `apps/web`)
- [ ] Setup Husky + lint-staged (copy from `apps/web`)
- [ ] Install core dependencies (match `apps/web`):
  - `react`, `react-dom`, `react-router-dom`
  - `@tailwindcss/vite`, `tailwindcss`
  - `typescript`, `vite`, `@vitejs/plugin-react`
  - `lucide-react` (icons)
  - `clsx`, `tailwind-merge` (utilities)
  - `i18next`, `react-i18next`, `i18next-browser-languagedetector` (translations)
  - `react-helmet-async` (SEO)
  - `sonner` (toasts, optional)
- [ ] Install dev dependencies:
  - `@playwright/test`, `playwright` (E2E)
  - `vitest`, `@vitest/ui`, `@vitest/coverage-v8` (unit tests)
  - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
  - `jsdom` (test environment)
  - `eslint`, `prettier`, `typescript-eslint`
  - `husky`, `lint-staged`
- [ ] Copy reusable components from `apps/web`:
  - `src/lib/utils.ts` → `apps/landing/src/lib/utils.ts` (cn utility)
  - `src/components/ui/button.tsx` → `apps/landing/src/components/ui/button.tsx`
  - `src/components/ui/dialog.tsx` → `apps/landing/src/components/ui/dialog.tsx` (optional)
  - `src/components/ui/carousel.tsx` → `apps/landing/src/components/ui/carousel.tsx` (for testimonials)
  - `src/components/ThemeToggleButton.tsx` → `apps/landing/src/components/ThemeToggleButton.tsx`
  - `src/components/LanguageToggleButton.tsx` → `apps/landing/src/components/LanguageToggleButton.tsx`
  - `src/components/Footer.tsx` → `apps/landing/src/components/Footer.tsx` (adapt for landing)
- [ ] Copy `src/index.css` → `apps/landing/src/index.css` (CSS variables, dark mode)

**Files to Create:**
- `apps/landing/package.json`
- `apps/landing/vite.config.ts`
- `apps/landing/vitest.config.ts`
- `apps/landing/vitest.setup.ts`
- `apps/landing/playwright.config.ts`
- `apps/landing/tailwind.config.js`
- `apps/landing/tsconfig.json`
- `apps/landing/tsconfig.app.json`
- `apps/landing/tsconfig.node.json`
- `apps/landing/.eslintrc.cjs`
- `apps/landing/.prettierrc`
- `apps/landing/index.html`
- `apps/landing/src/main.tsx`
- `apps/landing/src/index.css`

---

#### Issue 2: Setup React Router & Basic Routes
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 30min  
**Dependencies:** Issue 1  
**Can Parallelize:** No

**Tasks:**
- [ ] Install `react-router-dom`
- [ ] Create router configuration
- [ ] Setup routes:
  - `/` → HomePage (Hero + all sections)
  - `/features` → FeaturesPage (optional, detailed)
  - `/pricing` → PricingPage
  - `/privacy` → PrivacyPage (redirect to app or create)
  - `/terms` → TermsPage (redirect to app or create)
- [ ] Create basic route components (empty for now)
- [ ] Setup 404 page

**Files to Create:**
- `apps/landing/src/routes/HomePage.tsx`
- `apps/landing/src/routes/FeaturesPage.tsx`
- `apps/landing/src/routes/PricingPage.tsx`
- `apps/landing/src/lib/router.tsx`

---

#### Issue 3: Setup SEO with react-helmet-async
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 30min  
**Dependencies:** Issue 1  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Install `react-helmet-async`
- [ ] Wrap app with `<HelmetProvider>` in `main.tsx`
- [ ] Create SEO utility component `SEO.tsx`
- [ ] Add default meta tags in `index.html`
- [ ] Create SEO helper function for common tags

**Files to Create:**
- `apps/landing/src/components/SEO.tsx`
- `apps/landing/src/lib/seo.ts`

**Files to Update:**
- `apps/landing/src/main.tsx`
- `apps/landing/index.html`

---

#### Issue 4: Setup i18n (Translations)
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 1  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Copy i18n setup from `apps/web/src/lib/i18n.ts`
- [ ] Create `apps/landing/src/lib/locales/` folder
- [ ] Copy translation files from `apps/web/src/lib/locales/`:
  - `en.json`, `fr.json`, `es.json`, `pt.json`, `pt-BR.json`
  - `ja.json`, `zh.json`, `de.json`, `it.json`, `ru.json`
- [ ] Add landing-specific translations (hero, features, pricing, etc.)
- [ ] Setup language detection (browser + localStorage)
- [ ] Create `LanguageToggle` component (copy from `apps/web`)
- [ ] Initialize i18n in `main.tsx`

**Files to Create:**
- `apps/landing/src/lib/i18n.ts`
- `apps/landing/src/lib/locales/en.json` (and 9 other languages)
- `apps/landing/src/components/LanguageToggle.tsx`

**Files to Update:**
- `apps/landing/src/main.tsx`

---

#### Issue 5: Setup Dark/Light Mode Theme
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 4  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Copy theme initialization from `apps/web/src/main.tsx`
- [ ] Copy `ThemeToggle` component from `apps/web/src/components/ThemeToggle.tsx`
- [ ] Copy `ThemeToggleButton` component (optional, for header)
- [ ] Setup theme initialization on app load (system preference detection)
- [ ] Add theme persistence (localStorage)
- [ ] Update `index.css` with dark mode CSS variables (copy from `apps/web`)
- [ ] Test theme switching works

**Files to Create:**
- `apps/landing/src/components/ThemeToggle.tsx`
- `apps/landing/src/components/ThemeToggleButton.tsx` (optional)

**Files to Update:**
- `apps/landing/src/main.tsx` (add theme initialization)
- `apps/landing/src/index.css` (add dark mode styles)

---

#### Issue 6: Setup Design System & Shared Styles
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 5  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Copy `index.css` from `apps/web/src/index.css` (already done in Issue 1)
- [ ] Verify CSS variables are set up correctly (oklch colors)
- [ ] Verify dark mode CSS variables are present
- [ ] Create Tailwind theme configuration (match `apps/web`)
- [ ] Test purple gradient classes work:
  - `bg-linear-to-r from-purple-500 to-purple-600`
  - `bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent`
- [ ] Test Button component works with variants
- [ ] Verify `cn` utility function works
- [ ] Add `tw-animate-css` import (already in `index.css`)

**Files to Create/Update:**
- `apps/landing/src/index.css` (already copied in Issue 1, verify it's correct)
- `apps/landing/tailwind.config.js` (update with theme if needed)

---

#### Issue 7: Setup Unit Testing (Vitest)
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 4  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Copy `vitest.config.ts` from `apps/web`
- [ ] Copy `vitest.setup.ts` from `apps/web` (includes i18n mocks)
- [ ] Update vitest.setup.ts for landing-specific mocks
- [ ] Setup test scripts in `package.json`:
  - `test`: `vitest`
  - `test:ci`: `vitest run`
  - `coverage`: `vitest run --coverage`
- [ ] Create example test file to verify setup works
- [ ] Test vitest runs correctly

**Files to Create:**
- `apps/landing/vitest.config.ts` (copy from `apps/web`)
- `apps/landing/vitest.setup.ts` (copy and adapt from `apps/web`)
- `apps/landing/src/components/__tests__/Example.test.tsx` (example)

**Files to Update:**
- `apps/landing/package.json` (add test scripts)

---

#### Issue 8: Setup E2E Testing (Playwright)
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 20  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Copy `playwright.config.ts` from `apps/web`
- [ ] Update baseURL for landing page
- [ ] Create `e2e/` folder structure
- [ ] Setup test scripts in `package.json`:
  - `e2e:ci`: `playwright test`
- [ ] Create example E2E test to verify setup
- [ ] Test Playwright runs correctly

**Files to Create:**
- `apps/landing/playwright.config.ts` (copy and adapt from `apps/web`)
- `apps/landing/e2e/example.spec.ts` (example test)

**Files to Update:**
- `apps/landing/package.json` (add e2e script)

---

### Phase 2: Core Components & Sections

#### Issue 9: Hero Section Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 2h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `HeroSection.tsx` component
- [x] Add headline: "One Link to Share Everything"
- [x] Add subheadline text
- [x] Create primary CTA button → `app.getonelink.io/auth`
- [x] Create secondary CTA button → Scroll to demo
- [x] Add placeholder for visual: `<div>SCREENSHOT: Dashboard Preview</div>`
- [x] Style with purple gradient background
- [x] Make responsive (mobile-first)
- [x] Add animations (fade-in on scroll)

**Files to Create:**
- `apps/landing/src/components/sections/HeroSection.tsx`

**Content:**
- Headline: "One Link to Share Everything"
- Subheadline: "Share your links, files, and drops with one simple link. No more messy bios or multiple links."
- CTA Primary: "Get Started Free" → `app.getonelink.io/auth`
- CTA Secondary: "View Demo" → Scroll to demo section
- Visual placeholder: Label "SCREENSHOT: Dashboard Preview"

---

#### Issue 10: Features Section Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 2h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `FeaturesSection.tsx` component
- [x] Create `FeatureCard.tsx` component
- [x] Add 6 feature cards:
  1. One Link for Everything (Link icon)
  2. File Sharing / Drops (Upload/Cloud icon)
  3. Real-time Notifications (Bell icon)
  4. Customizable Profile (User/Profile icon)
  5. Privacy & Security (Lock icon)
  6. Analytics (Chart icon)
- [x] Grid layout: 3x2 (desktop), 1x6 (mobile)
- [x] Add hover effects
- [x] Use purple accents
- [x] Make responsive

**Files to Create:**
- `apps/landing/src/components/sections/FeaturesSection.tsx`
- `apps/landing/src/components/FeatureCard.tsx`

**Features Data:**
```typescript
const features = [
  {
    title: "One Link for Everything",
    description: "Un seul lien pour partager tout",
    icon: "Link"
  },
  // ... 5 more
]
```

---

#### Issue 11: How It Works Section Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `HowItWorksSection.tsx` component
- [x] Create `StepCard.tsx` component
- [x] Add 4 steps:
  1. Sign Up → Create account (free)
  2. Create Your Link → Add links, upload files
  3. Share → One link to share everywhere
  4. Track → See analytics in real-time
- [x] Horizontal timeline (desktop)
- [x] Vertical timeline (mobile)
- [x] Numbered steps with icons
- [x] Make responsive

**Files to Create:**
- `apps/landing/src/components/sections/HowItWorksSection.tsx`
- `apps/landing/src/components/StepCard.tsx`

---

#### Issue 12: Pricing Section Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 2h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `PricingSection.tsx` component
- [x] Create `PricingCard.tsx` component
- [x] Add Free Plan card:
  - 5 links
  - 3 drops
  - Basic analytics
  - CTA: "Get Started Free" → `app.getonelink.io/auth`
- [x] Add Pro Plan card (highlighted):
  - Unlimited links
  - Unlimited drops
  - Advanced analytics
  - Custom domain
  - Priority support
  - CTA: "Upgrade to Pro" → `app.getonelink.io/pricing`
- [x] 2-column layout (desktop)
- [x] Stacked cards (mobile)
- [x] Pro card with purple gradient
- [x] Feature comparison table (optional)

**Files to Create:**
- `apps/landing/src/components/sections/PricingSection.tsx`
- `apps/landing/src/components/PricingCard.tsx`

---

#### Issue 13: Social Proof / Testimonials Section Component
**Status:** 🟢 Completed  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `SocialProofSection.tsx` component
- [x] Add user count: "Join X users" (placeholder: "Join 1,000+ users")
- [x] Add testimonials placeholder (empty for now, can add later)
- [x] Add trust badges placeholder
- [x] Create carousel or grid layout
- [x] Make responsive

**Files to Create:**
- `apps/landing/src/components/sections/SocialProofSection.tsx`

**Content:**
- User count: "Join 1,000+ users" (placeholder)
- Testimonials: Empty for now (can add later)
- Trust badges: Placeholder

---

#### Issue 14: Demo / Screenshot Section Component
**Status:** 🟢 Completed  
**Priority:** Medium  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `DemoSection.tsx` component
- [x] Add placeholder: `<div>SCREENSHOT: Dashboard in Action</div>`
- [x] Add device mockup wrapper (iPhone/MacBook frame)
- [x] Add animated on scroll effect
- [x] Add caption/description
- [x] Make responsive

**Files to Create:**
- `apps/landing/src/components/sections/DemoSection.tsx`
- `apps/landing/src/components/DeviceMockup.tsx` (optional)

**Content:**
- Placeholder: Label "SCREENSHOT: Dashboard in Action"
- Description: "See how easy it is to manage your links and files"

---

#### Issue 15: Final CTA Section Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 1h  
**Dependencies:** Issue 1, Issue 6  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `CTASection.tsx` component
- [x] Add headline: "Ready to get started?"
- [x] Add primary CTA: "Create Your Free Account" → `app.getonelink.io/auth`
- [x] Add secondary link: "Or view pricing" → `/pricing`
- [x] Purple gradient background
- [x] Centered, bold layout
- [x] Large button
- [x] Make responsive

**Files to Create:**
- `apps/landing/src/components/sections/CTASection.tsx`

---

#### Issue 16: Footer Component
**Status:** 🟢 Completed  
**Priority:** High  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 1, Issue 4, Issue 5  
**Can Parallelize:** Yes

**Tasks:**
- [x] Create `Footer.tsx` component
- [x] Add Product section:
  - Features → `/features`
  - Pricing → `/pricing`
  - Roadmap (optional)
- [x] Add Company section:
  - About → `/about` (optional)
  - Blog (future)
  - Contact
- [x] Add Legal section:
  - Privacy Policy → `/privacy` or `app.getonelink.io/privacy`
  - Terms of Service → `/terms` or `app.getonelink.io/terms`
- [x] Add Social section:
  - Twitter/X
  - GitHub (if open source)
  - LinkedIn
- [x] Add App section:
  - Sign In → `app.getonelink.io/auth`
  - Sign Up → `app.getonelink.io/auth`
- [x] Multi-column layout (desktop)
- [x] Stacked layout (mobile)
- [x] Dark background
- [x] Copyright notice

**Files to Create:**
- `apps/landing/src/components/Footer.tsx`

---

### Phase 3: HomePage Integration & Polish

#### Issue 17: Assemble HomePage with All Sections
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 1h  
**Dependencies:** Issues 9-16  
**Can Parallelize:** No

**Tasks:**
- [ ] Update `HomePage.tsx` to include all sections:
  1. HeroSection
  2. FeaturesSection
  3. HowItWorksSection
  4. PricingSection
  5. SocialProofSection
  6. DemoSection
  7. CTASection
  8. Footer
- [ ] Add LanguageToggle in header/nav (Issue 4)
- [ ] Add ThemeToggle in header/nav (Issue 5)
- [ ] Add smooth scroll behavior
- [ ] Add spacing between sections
- [ ] Add SEO meta tags using `<Helmet>` (Issue 3)
- [ ] Test all CTAs work correctly
- [ ] Test translations work (Issue 4)
- [ ] Test dark/light mode works (Issue 5)

**Files to Update:**
- `apps/landing/src/routes/HomePage.tsx`

---

#### Issue 18: Add Scroll Animations & Interactions
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 17  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Install animation library (framer-motion or CSS animations)
- [ ] Add fade-in on scroll for sections
- [ ] Add hover effects on cards/buttons
- [ ] Add smooth scroll to demo section (View Demo button)
- [ ] Add parallax effect (optional)
- [ ] Test performance

**Files to Update:**
- All section components

---

#### Issue 19: Responsive Design Polish
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 2h  
**Dependencies:** Issue 17  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Test all sections on mobile (< 768px)
- [ ] Test all sections on tablet (768px - 1024px)
- [ ] Test all sections on desktop (> 1024px)
- [ ] Fix any layout issues
- [ ] Ensure touch targets are large enough (mobile)
- [ ] Test navigation on mobile
- [ ] Test CTAs on all screen sizes
- [ ] Test dark mode on all screen sizes
- [ ] Test language switching on all screen sizes

**Files to Update:**
- All components

---

#### Issue 20: SEO Meta Tags for All Pages
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 1h  
**Dependencies:** Issue 3, Issue 17  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Add SEO meta tags to HomePage:
  - Title: "OneLink - One Link to Share Everything"
  - Description: "Share your links, files, and drops with one simple link..."
  - Open Graph tags
  - Twitter Card tags
- [ ] Add SEO meta tags to PricingPage
- [ ] Add SEO meta tags to FeaturesPage
- [ ] Add canonical URLs
- [ ] Test with Facebook Sharing Debugger
- [ ] Test with Twitter Card Validator

**Files to Update:**
- `apps/landing/src/routes/HomePage.tsx`
- `apps/landing/src/routes/PricingPage.tsx`
- `apps/landing/src/routes/FeaturesPage.tsx`

---

### Phase 4: Additional Pages & Features

#### Issue 21: Pricing Page (Detailed)
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 12  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Create detailed pricing page
- [ ] Reuse PricingSection component
- [ ] Add feature comparison table
- [ ] Add FAQ section (optional)
- [ ] Add SEO meta tags
- [ ] Make responsive

**Files to Create/Update:**
- `apps/landing/src/routes/PricingPage.tsx`

---

#### Issue 22: Features Page (Detailed)
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 1.5h  
**Dependencies:** Issue 10  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Create detailed features page
- [ ] Expand on each feature with more details
- [ ] Add screenshots placeholders
- [ ] Add SEO meta tags
- [ ] Make responsive

**Files to Create/Update:**
- `apps/landing/src/routes/FeaturesPage.tsx`

---

#### Issue 23: Auth Redirects Setup
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 30min  
**Dependencies:** Issue 2  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Create `/auth` route that redirects to `app.getonelink.io/auth`
- [ ] Add redirect logic (301 permanent redirect)
- [ ] Test redirect works correctly
- [ ] Update all CTAs to use correct URLs

**Files to Create:**
- `apps/landing/src/routes/AuthRedirect.tsx`

---

### Phase 5: Testing & Deployment

#### Issue 24: Build & Deployment Configuration
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 1h  
**Dependencies:** All previous issues  
**Can Parallelize:** No

**Tasks:**
- [ ] Test build locally (`npm run build`)
- [ ] Fix any build errors
- [ ] Create Vercel project `onelink-landing`
- [ ] Configure Vercel deployment:
  - Root directory: `apps/landing`
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Configure environment variables (if needed)
- [ ] Test deployment on Vercel preview

**Files to Create:**
- `apps/landing/vercel.json` (if needed)

---

#### Issue 25: Domain Configuration
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 30min  
**Dependencies:** Issue 24  
**Can Parallelize:** No

**Tasks:**
- [ ] Add domain `getonelink.io` to Vercel project
- [ ] Add domain `www.getonelink.io` to Vercel project
- [ ] Configure DNS in Hostinger:
  - A record: `@` → Vercel IP
  - CNAME: `www` → `cname.vercel-dns.com`
  - CNAME: `app` → `cname.vercel-dns.com`
- [ ] Wait for DNS propagation
- [ ] Test domains work correctly
- [ ] Test SSL certificates

---

#### Issue 26: Cross-Browser & Device Testing
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 2h  
**Dependencies:** Issue 24  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Test on Chrome (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Chrome (mobile)
- [ ] Test on Safari iOS (mobile)
- [ ] Test on different screen sizes
- [ ] Test all CTAs work
- [ ] Test all links work
- [ ] Test responsive design
- [ ] Fix any issues found

---

#### Issue 27: SEO Testing & Setup
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 20, Issue 24  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Create `sitemap.xml`
- [ ] Create `robots.txt`
- [ ] Test meta tags with Google Rich Results Test
- [ ] Test Open Graph with Facebook Sharing Debugger
- [ ] Test Twitter Cards with Twitter Card Validator
- [ ] Submit sitemap to Google Search Console
- [ ] Test page speed (Lighthouse)
- [ ] Fix any SEO issues

**Files to Create:**
- `apps/landing/public/sitemap.xml`
- `apps/landing/public/robots.txt`

---

#### Issue 28: Analytics Setup
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 1h  
**Dependencies:** Issue 24  
**Can Parallelize:** Yes

**Tasks:**
- [ ] Install PostHog SDK (or Google Analytics)
- [ ] Track conversion events:
  - Sign up button clicks
  - Pricing page views
  - CTA clicks
- [ ] Track scroll depth
- [ ] Track page views
- [ ] Test analytics events fire correctly
- [ ] Verify in PostHog dashboard

**Files to Create/Update:**
- `apps/landing/src/lib/analytics.ts`
- Update components with tracking

---

## 📋 Task Summary

**Total Issues:** 28  
**Total Estimated Time:** ~25-30 hours

**Phase Breakdown:**
- **Phase 1 (Setup):** Issues 1-8 (~8h)
  - Issue 1: Project structure (1.5h)
  - Issue 2: Router (30min)
  - Issue 3: SEO (30min)
  - Issue 4: i18n (1h)
  - Issue 5: Dark/Light mode (1h)
  - Issue 6: Design system (1h)
  - Issue 7: Unit tests (1h)
  - Issue 8: E2E tests (1h)
- **Phase 2 (Components):** Issues 9-16 (~12h)
  - All components can be built in parallel
- **Phase 3 (Integration):** Issues 17-20 (~5.5h)
  - Some parallelization possible
- **Phase 4 (Additional):** Issues 21-23 (~3.5h)
  - Parallelizable
- **Phase 5 (Testing):** Issues 24-28 (~5h)
  - Some parallelization (Issues 26-28)

**Parallelization:**
- Phase 1: Issues 3-8 can be done in parallel after Issue 1
- Phase 2: **Highly parallelizable** (Issues 9-16 can all be done simultaneously)
- Phase 3: Issues 18-20 can be done in parallel after Issue 17
- Phase 4: All parallelizable
- Phase 5: Issues 26-28 can be done in parallel after Issue 24

**Key Libraries (Same as apps/web):**
- ✅ Tailwind CSS (`@tailwindcss/vite`, `tailwindcss`)
- ✅ i18next (`i18next`, `react-i18next`, `i18next-browser-languagedetector`)
- ✅ Dark/Light mode (localStorage + system preference)
- ✅ Playwright (`@playwright/test`) for E2E
- ✅ Vitest (`vitest`, `@vitest/ui`) for unit tests
- ✅ TypeScript
- ✅ ESLint + Prettier
- ✅ Husky + lint-staged
- ✅ Lucide React (icons)
- ✅ React Router (`react-router-dom`)
- ✅ react-helmet-async (SEO)

---

## 🔗 Integration avec App

### Redirects
- `/auth` → Redirect vers `app.getonelink.io/auth` (ou garder sur même domaine)
- `/dashboard` → Redirect vers `app.getonelink.io/dashboard` (si pas auth)

### Shared Components
- Réutiliser composants UI si possible (buttons, cards)
- Partager design tokens (colors, typography)

### Analytics
- Track conversions (sign up clicks)
- Track scroll depth
- Track CTA clicks

---

## 📊 Success Metrics

- **Conversion Rate:** % de visiteurs qui sign up
- **Bounce Rate:** < 50% idéal
- **Time on Page:** > 2 minutes
- **CTR on CTAs:** > 5%

---

## 🛠️ Tech Stack

**✅ Decision: Vite + React (Same Stack as Current App)**

**Stack:**
- **Framework:** Vite + React (same as `apps/web`)
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **SEO:** `react-helmet-async` (meta tags)
- **Pre-rendering:** `vite-plugin-prerender` (optional, post-MVP)
- **Deployment:** Vercel (separate project)
- **Analytics:** PostHog (déjà intégré) ou Google Analytics
- **Forms:** React Hook Form (if needed)

**Why Vite + React:**
- ✅ Same tech stack (no learning curve)
- ✅ Faster development (familiar tools)
- ✅ Can share components/styles if needed
- ✅ Good SEO with proper meta tags + pre-rendering
- ✅ Simpler setup than Next.js

**SEO Libraries:**
- `react-helmet-async` - Clean meta tag management
- `vite-plugin-prerender` - Static pre-rendering for better SEO (optional)

**Required Libraries (Match apps/web):**
- ✅ **Tailwind CSS:** `@tailwindcss/vite`, `tailwindcss`, `tw-animate-css`
- ✅ **i18n:** `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- ✅ **Dark/Light Mode:** Custom implementation (localStorage + system preference)
- ✅ **Icons:** `lucide-react`
- ✅ **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`
- ✅ **Testing:** `vitest`, `@vitest/ui`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- ✅ **E2E:** `@playwright/test`, `playwright`
- ✅ **Code Quality:** `eslint`, `prettier`, `typescript-eslint`, `husky`, `lint-staged`
- ✅ **Toasts:** `sonner` (optional, for notifications)

**Translation Files:**
Copy from `apps/web/src/lib/locales/`:
- `en.json`, `fr.json`, `es.json`, `pt.json`, `pt-BR.json`
- `ja.json`, `zh.json`, `de.json`, `it.json`, `ru.json`

**Config Files to Copy:**
- `vitest.config.ts` - Unit test configuration
- `vitest.setup.ts` - Test setup with mocks
- `playwright.config.ts` - E2E test configuration
- `.eslintrc.cjs` - ESLint rules
- `.prettierrc` - Prettier formatting
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - TypeScript configs

---

## 📦 Reusable Components from apps/web

### Core UI Components (Copy These)
These components should be copied to `apps/landing/src/components/ui/`:

1. **Button Component** (`apps/web/src/components/ui/button.tsx`)
   - ✅ Variants: default, destructive, outline, secondary, ghost, link
   - ✅ Sizes: default, sm, lg, icon, icon-sm, icon-lg
   - ✅ Uses `class-variance-authority` for variants
   - ✅ Uses `cn` utility for className merging
   - **Usage:** All CTAs, buttons throughout landing page

2. **Dialog Component** (`apps/web/src/components/ui/dialog.tsx`)
   - ✅ Radix UI Dialog primitives
   - ✅ Accessible modal dialogs
   - **Usage:** Modals, confirmations (optional for landing)

3. **Drawer Component** (`apps/web/src/components/ui/drawer.tsx`)
   - ✅ Mobile-friendly drawer
   - **Usage:** Mobile navigation (optional)

4. **Sheet Component** (`apps/web/src/components/ui/sheet.tsx`)
   - ✅ Side panel component
   - **Usage:** Mobile menus (optional)

5. **Switch Component** (`apps/web/src/components/ui/switch.tsx`)
   - ✅ Toggle switches
   - **Usage:** Settings, preferences (optional)

6. **Carousel Component** (`apps/web/src/components/ui/carousel.tsx`)
   - ✅ Embla carousel integration
   - **Usage:** Testimonials carousel, feature showcase

### Shared Components (Copy & Adapt)

1. **Footer Component** (`apps/web/src/components/Footer.tsx`)
   - ✅ Responsive footer with legal links
   - ✅ Language/Theme toggles support
   - ✅ Dark mode support
   - **Adapt:** Update links for landing page structure
   - **Copy to:** `apps/landing/src/components/Footer.tsx`

2. **ThemeToggleButton** (`apps/web/src/components/ThemeToggleButton.tsx`)
   - ✅ Dark/Light/System theme switching
   - ✅ Icon button with tooltip
   - **Copy to:** `apps/landing/src/components/ThemeToggleButton.tsx`

3. **LanguageToggleButton** (`apps/web/src/components/LanguageToggleButton.tsx`)
   - ✅ Language switcher dropdown
   - ✅ Uses i18next
   - **Copy to:** `apps/landing/src/components/LanguageToggleButton.tsx`

4. **ThemeToggle** (`apps/web/src/components/ThemeToggle.tsx`)
   - ✅ Select dropdown for theme
   - **Copy to:** `apps/landing/src/components/ThemeToggle.tsx` (if needed)

5. **LanguageToggle** (`apps/web/src/components/LanguageToggle.tsx`)
   - ✅ Select dropdown for language
   - **Copy to:** `apps/landing/src/components/LanguageToggle.tsx` (if needed)

### Utility Functions (Copy These)

1. **cn Utility** (`apps/web/src/lib/utils.ts`)
   - ✅ Combines `clsx` + `tailwind-merge`
   - ✅ Essential for className merging
   - **Copy to:** `apps/landing/src/lib/utils.ts`

### CSS & Styling (Copy These)

1. **index.css** (`apps/web/src/index.css`)
   - ✅ Tailwind imports
   - ✅ CSS variables (oklch colors)
   - ✅ Dark mode variables
   - ✅ Base styles
   - ✅ Custom animations (ripple)
   - **Copy to:** `apps/landing/src/index.css`
   - **Adapt:** Keep all CSS variables, they're used by components

### Design Patterns (Reference These)

1. **PricingPlanCard** (`apps/web/src/routes/Pricing/components/PricingPlanCard.tsx`)
   - ✅ Good reference for pricing card design
   - ✅ Purple gradient buttons
   - ✅ Feature lists with checkmarks
   - ✅ Highlight/badge patterns
   - **Reference:** Use patterns for Issue 12 (Pricing Section)

2. **Purple Gradient Patterns** (used throughout apps/web):
   ```tsx
   // Primary CTA buttons
   className="bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
   
   // Text gradients (headlines)
   className="bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent"
   
   // Background gradients
   className="bg-linear-to-r from-purple-500/10 via-purple-500/5 to-blue-500/10"
   
   // Badges/highlights
   className="bg-linear-to-r from-purple-500 to-purple-600"
   ```

3. **Card Patterns**:
   ```tsx
   // Standard card
   className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
   
   // Highlighted card
   className="border-purple-500 bg-white dark:bg-gray-900 ring-2 ring-purple-500"
   
   // Purple accent card
   className="bg-purple-50/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
   ```

### Components NOT Needed for Landing

These are app-specific and don't need to be copied:
- ❌ `AuthProvider` - No auth needed on landing
- ❌ `ProfileEditor` - App-specific
- ❌ `LinksList`, `LinksAnalyticsCard` - App-specific
- ❌ `FileDropZone`, `FilePreviewList` - App-specific
- ❌ `MFAChallenge` - App-specific
- ❌ `UpgradeConfirmationModal` - App-specific
- ❌ Dashboard components - App-specific

---

## 🎨 Design Tokens & Patterns

### Purple Gradient Classes (Use These)
```tsx
// Primary buttons
"bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"

// Text gradients (headlines)
"bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent"

// Background gradients
"bg-linear-to-r from-purple-500/10 via-purple-500/5 to-blue-500/10 dark:from-purple-500/20 dark:via-purple-500/10 dark:to-blue-500/20"

// Badges
"bg-linear-to-r from-purple-500 to-purple-600"
```

### Color Classes (from CSS variables)
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `border-border`
- All work with dark mode automatically via CSS variables

### Spacing & Layout
- Use Tailwind spacing scale
- Cards: `rounded-2xl`, `p-8` (desktop), `p-4` (mobile)
- Sections: `py-16` (desktop), `py-12` (mobile)
- Max width containers: `max-w-5xl` or `max-w-7xl`

---

## 📝 Content Checklist

- [ ] Hero headline et subheadline
- [ ] 6 features descriptions
- [ ] How it works steps
- [ ] Pricing copy
- [ ] Footer links
- [ ] Meta description (SEO)
- [ ] Open Graph tags (social sharing)
- [ ] Favicon et logo
- [ ] Screenshots/GIFs de l'app

---

## ✅ Pre-Flight Checklist (Before Starting)

### Required (Must Have)
- [x] ✅ Architecture decision made (Vite + React, `apps/landing/`)
- [x] ✅ Tech stack documented (all libraries listed)
- [x] ✅ Issues broken down (28 issues, clear dependencies)
- [x] ✅ Reusable components identified (Button, Footer, ThemeToggle, etc.)
- [x] ✅ Design system documented (purple gradients, CSS variables)
- [ ] ⚠️ **Domain purchased?** (`getonelink.io` - can start without, but needed for deployment)
- [ ] ⚠️ **Vercel account ready?** (for deployment - can start without)

### Nice to Have (Can Add Later)
- [ ] Screenshots/GIFs of app (using placeholders for now)
- [ ] Testimonials content (can add later)
- [ ] Final copywriting (can refine during development)
- [ ] Logo/favicon assets (can use placeholder)

### Not Needed (Can Skip)
- ❌ Supabase setup (landing doesn't need database)
- ❌ Stripe setup (landing doesn't process payments)
- ❌ Auth setup (landing redirects to app for auth)
- ❌ Environment variables (except optional PostHog for analytics)

---

## 🎯 Quick Start Guide

### Step 1: Foundation (Phase 1)
**Issue 1 must be done first**, then Issues 2-8 can be parallelized:
- Issue 1: Create project structure (FOUNDATION - do first)
- Issue 2: Setup routing
- Issue 3: Setup SEO
- Issue 4: Setup i18n (translations)
- Issue 5: Setup Dark/Light mode
- Issue 6: Setup design system
- Issue 7: Setup unit testing (Vitest)
- Issue 8: Setup E2E testing (Playwright)

**Note:** Issues 3-8 can be done in parallel after Issue 1 is complete.

### Step 2: Build Components (Phase 2)
**Highly parallelizable** - Assign Issues 9-16 to different agents:
- Issue 9: Hero Section
- Issue 10: Features Section
- Issue 11: How It Works
- Issue 12: Pricing Section
- Issue 13: Social Proof
- Issue 14: Demo Section
- Issue 15: CTA Section
- Issue 16: Footer

### Step 3: Integration (Phase 3)
- Issue 17: Assemble HomePage (needs all components from Phase 2)
- Issues 18-20: Polish (can be parallelized after Issue 17)

### Step 4: Additional Pages (Phase 4)
- Issues 21-23: Additional pages and redirects (parallelizable)

### Step 5: Launch (Phase 5)
- Issue 24: Build & Deployment (must be done first)
- Issues 25-28: Domain, testing, SEO, analytics (can be parallelized)

---

## 📊 Issue Status Tracker

| Issue # | Title | Phase | Status | Est. Time | Dependencies |
|---------|-------|-------|--------|-----------|--------------|
| 1 | Create Landing App Structure | 1 | 🔴 | 1.5h | - |
| 2 | Setup React Router | 1 | 🔴 | 30min | Issue 1 |
| 3 | Setup SEO (react-helmet-async) | 1 | 🔴 | 30min | Issue 1 |
| 4 | Setup i18n (Translations) | 1 | 🔴 | 1h | Issue 1 |
| 5 | Setup Dark/Light Mode | 1 | 🔴 | 1h | Issues 1, 4 |
| 6 | Setup Design System | 1 | 🔴 | 1h | Issues 1, 5 |
| 7 | Setup Unit Testing (Vitest) | 1 | 🔴 | 1h | Issues 1, 4 |
| 8 | Setup E2E Testing (Playwright) | 1 | 🔴 | 1h | Issue 1 |
| 9 | Hero Section | 2 | 🟢 | 2h | Issues 1, 6 |
| 10 | Features Section | 2 | 🟢 | 2h | Issues 1, 6 |
| 11 | How It Works Section | 2 | 🟢 | 1.5h | Issues 1, 6 |
| 12 | Pricing Section | 2 | 🟢 | 2h | Issues 1, 6 |
| 13 | Social Proof Section | 2 | 🟢 | 1h | Issues 1, 6 |
| 14 | Demo Section | 2 | 🟢 | 1.5h | Issues 1, 6 |
| 15 | CTA Section | 2 | 🟢 | 1h | Issues 1, 6 |
| 16 | Footer | 2 | 🟢 | 1.5h | Issues 1, 4, 5 |
| 17 | Assemble HomePage | 3 | 🔴 | 1h | Issues 9-16 |
| 18 | Scroll Animations | 3 | 🔴 | 1.5h | Issue 17 |
| 19 | Responsive Polish | 3 | 🔴 | 2h | Issue 17 |
| 20 | SEO Meta Tags | 3 | 🔴 | 1h | Issues 3, 17 |
| 21 | Pricing Page | 4 | 🔴 | 1.5h | Issue 12 |
| 22 | Features Page | 4 | 🔴 | 1.5h | Issue 10 |
| 23 | Auth Redirects | 4 | 🔴 | 30min | Issue 2 |
| 24 | Build & Deployment | 5 | 🔴 | 1h | All |
| 25 | Domain Configuration | 5 | 🔴 | 30min | Issue 24 |
| 26 | Cross-Browser Testing | 5 | 🔴 | 2h | Issue 24 |
| 27 | SEO Testing | 5 | 🔴 | 1h | Issues 20, 24 |
| 28 | Analytics Setup | 5 | 🔴 | 1h | Issue 24 |

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed

---

## 🚀 Ready to Start? Here's What You Need

### Minimum Requirements to Begin
1. ✅ **Monorepo access** - You have the repo, can create `apps/landing/`
2. ✅ **Node.js/pnpm** - Already installed (same as `apps/web`)
3. ✅ **Code editor** - Already set up
4. ✅ **Documentation** - This doc has everything needed

### Optional (Can Add Later)
- Domain (`getonelink.io`) - Not needed for local dev
- Vercel account - Not needed until deployment
- Assets (screenshots, logo) - Using placeholders
- Analytics (PostHog) - Can add later

### What's Missing? Nothing Critical! 🎉

**You can start immediately with Issue 1.** Everything else can be added incrementally:
- Domain → Add when ready to deploy
- Assets → Use placeholders, replace later
- Content → Refine during development
- Analytics → Add in Phase 5

### First Steps (Start Here)
1. **Create `apps/landing/` folder**
2. **Run `pnpm create vite@latest . --template react-ts`** (or copy structure from `apps/web`)
3. **Copy config files** from `apps/web`:
   - `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
   - `.eslintrc.cjs`, `.prettierrc`
   - `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`
   - `.gitignore` (add `dist`, `node_modules`, `*.local`, `e2e/.auth/`)
4. **Copy reusable components** (Button, Footer, ThemeToggle, etc.) - See Issue 1 tasks
5. **Copy `src/index.css`** from `apps/web` (CSS variables, dark mode)
6. **Copy `src/lib/utils.ts`** (cn utility)
7. **Start Issue 1** → Follow the tasks step by step

### Environment Variables (Optional)
Landing page doesn't need Supabase/Stripe, but you might want:
- `VITE_POSTHOG_KEY` - For analytics (optional, can add later)
- `VITE_POSTHOG_HOST` - PostHog host (optional)

**Create `.env.local` if needed:**
```bash
# Optional: Analytics
VITE_POSTHOG_KEY=your_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

**That's it! You're ready to build.** 🚀

---

## 📚 References

- **Inspiration:** Linear.app, Notion.so, Stripe.com, Vercel.com
- **Design Patterns:** SaaS landing pages best practices
- **SEO:** Next.js SEO guide

---

## Notes

- Landing page doit être **rapide** (< 3s load time)
- **Mobile-first** design (majorité des trafics)
- **SEO:** Use `react-helmet-async` for meta tags, add `vite-plugin-prerender` post-MVP
- **Architecture:** Separate `apps/landing/` folder in monorepo (Pattern 1 - like Vercel, Stripe)
- **A/B testing** possible sur CTAs plus tard
- **Blog** peut être ajouté plus tard pour SEO
- **Documentation** peut être ajoutée plus tard
- See `docs/issues/ISSUE.md` for detailed SEO implementation plan
