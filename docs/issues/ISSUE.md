# OneLink - Issues & Roadmap

## Current Focus: Frontend UX Polish

Status: ✅ Completed

### Completed
- ✅ Mobile header responsiveness
- ✅ Dashboard title alignment and sizing
- ✅ Inbox redesign with purple accents
- ✅ Bottom navigation with purple dot for new items
- ✅ Fixed headers (navigation, header, subheader)
- ✅ Purple gradient blob backgrounds
- ✅ Onboarding carousel on `/` route
- ✅ Landing page moved to `/auth`
- ✅ Sign-in page polish
- ✅ Routes section UI updates (light purple cards)
- ✅ Drops section UI updates (light purple cards, full-width buttons)
- ✅ Button styling consistency (rounded-md, purple gradients)
- ✅ Spacing improvements (cards, buttons, sections)
- ✅ Phase 2: Desktop responsive design
- ✅ Phase 3: Dark theme polish
- ✅ UI QA Issues (Phase 2, 3, 4, 5) - All 19 issues completed
  - ✅ Issue 8: Edit Drop Modal (replaced prompt with EditDropModal)
  - ✅ Issue 13: Analytics day button styling (improved contrast in dark mode)
  - ✅ Issue 6: Drag and drop visual indicator (added GripVertical icon)
  - ✅ Issue 4: Links edit modal (already completed)
  - ✅ Fixed CSS class deprecations (flex-shrink-0 → shrink-0)
  - ✅ Added translations for drag handle in all 10 languages

---

## Drop System Redesign

**Status:** ✅ Completed

### Completed Features
- ✅ Database migration (`004_drops_public_private.sql`) - Added `is_public` and `share_token` columns
- ✅ Route `/drop/{share_token}` - Direct drop access (public or private)
- ✅ Dashboard UI - Toggle visibility, copy shareable link, upload files, view files
- ✅ Drop visibility badges (Public/Private indicators)
- ✅ Public profile filtering - Only shows public drops on profile page
- ✅ Drop sharing functionality with QR code
- ✅ RLS policies updated for public/private access control

### Implementation Details
- **Database:** `is_public` (boolean, default true) and `share_token` (unique text)
- **Functions:** `toggleDropVisibility()`, `getDropByToken()`, `getDropShareLink()`
- **UI Components:** `DropVisibilityBadge`, `DropCardActions`, share modal
- **Routes:** `/drop/{token}` page for direct drop access

### Future Enhancements (Pro Features)
- Password-protected drops
- Expiring share links (time-limited access)
- Upload notifications (email/webhook)
- Custom branding per drop
- Analytics per drop (views, uploads, downloads)
- Bulk download as ZIP
- File versioning
- Comments on files
- File previews
- Access logs (who uploaded when)

---

## Other Issues

### 1. Language Switching
Status: ✅ Completed
- i18next with React Context
- Browser language detection
- Persistent language preference

### 2. Mobile Responsiveness
Status: ✅ Completed
- Fixed headers
- Bottom navigation
- Card layouts
- Button sizing
- Spacing adjustments
- Desktop responsive design
- Dark theme polish

### 3. Dark Theme Contrast
Status: ✅ Completed
- Fixed blue, orange, red text contrast
- Maintained original colors for light theme

### 4. Refactor Plan Types to Use Enums/Constants
Status: ✅ Completed
- Replaced string literals with TypeScript const object (`PlanType`)
- Updated all plan checks to use `PlanType.PRO` and `PlanType.FREE`
- Created `lib/types/plan.ts` for centralized plan type definitions
- Created `lib/plan-limits.ts` for plan limit logic (extracted from `profile.ts`)
- Eliminated code duplication (getFreeLinksLimit, getFreeDropsLimit)
- Removed deprecated code (getPlanItemLimit, getDropLimit, etc.)
- Benefits achieved:
  - Type safety
  - Autocomplete support
  - Easier refactoring
  - Prevents typos
  - Better separation of concerns (SRP)

---

## Notes
- Focus on UX polish first (mobile → desktop → dark theme)
- Then implement drop system redesign
- Maintain backward compatibility
- Keep user experience simple and intuitive

---

## Settings Implementation

**Status:** ✅ Completed (UI + Backend + Delete Account with MFA)

### Completed Features
- ✅ Settings page (`/settings`) with all sections
- ✅ Notifications preferences (email notifications, weekly digest)
- ✅ Email preferences (marketing emails, product updates)
- ✅ Billing page (`/settings/billing`) - Plan display, payment method, billing history, upgrade/cancel
- ✅ Custom domain page (`/settings/domain`) - Add/remove domains, DNS instructions (Pro only)
- ✅ Active sessions page (`/settings/sessions`) - View sessions, revoke sessions, login history
- ✅ Data export modal - GDPR export (JSON/CSV)
- ✅ Change password modal - Full form with validation
- ✅ Two-factor authentication page (`/settings/2fa`) - QR code, backup codes, enable/disable
- ✅ Delete account modal - MFA code verification (6 digits), cascade delete, email notification
- ✅ User preferences hook (`useUserPreferences`) - Supabase integration
- ✅ Backend SQL migration executed
- ✅ Session tracking implemented
- ✅ Login history logging implemented
- ✅ 2FA backend (Supabase MFA integration)
- ✅ Delete account Edge Function - MFA verification required, cascade delete (profiles, links, drops, submissions, sessions, preferences, login history, export audit)
- ✅ Delete account frontend - Conditional UI (MFA required message if 2FA not enabled, MFA code input if enabled)
- ✅ Delete account tests - Unit tests (frontend + backend) and E2E tests

---

## UI Enhancements (Future)

### 1. File Display Modes (List / Card / Grid)
**Status:** 🔄 TODO
**Priority:** Low (Nice to have)
**Category:** UI/UX Enhancement

**Description:**
Add multiple view modes for displaying files in drops, similar to Windows/Mac file browsers.

**Modes:**
- **List** (Current) - Compact list view, no thumbnails
- **Card** - Larger cards with thumbnails for images/PDFs
- **Grid** (Optional) - Grid layout of cards

**Features:**
- Toggle button to switch between modes (list/grid icon)
- Store user preference in `localStorage` or database
- Generate thumbnails for images/PDFs (via Supabase Storage or thumbnail service)
- Card view shows:
  - Thumbnail preview (if image/PDF)
  - File name
  - File size + upload date
  - Actions (download, delete for owner)

**Implementation Notes:**
- Add view mode state management
- Create `FileCard` component for card view
- Create `FileGrid` component for grid view
- Thumbnail generation: Use Supabase Storage transformations or external service
- Responsive: Card view on desktop, list on mobile (or user choice)

**Files to Create/Update:**
- `apps/web/src/routes/Drop/components/FileViewToggle.tsx` - Toggle component
- `apps/web/src/routes/Drop/components/FileCard.tsx` - Card view component
- `apps/web/src/routes/Drop/components/FileGrid.tsx` - Grid layout component
- Update `DropFileList.tsx` to support multiple view modes

**Estimated Time:** 4-6 hours (including thumbnail generation)

---

## Missing UI Pages & Features

### 1. Legal Pages (Privacy Policy & Terms of Service)
**Status:** ✅ Completed

#### Privacy Policy Page
**Route:** `/privacy`
**Purpose:** Legal requirement - inform users about data collection, usage, and privacy practices

**Content Sections:**
1. Introduction - What OneLink is
2. Information We Collect - Email, profile data, files, analytics
3. How We Use Information - Service delivery, improvements, support
4. Data Storage - Supabase, file retention policies
5. Data Sharing - Third-party services (Stripe, Supabase)
6. Your Rights - Access, deletion, export
7. Cookies - What cookies we use (if any)
8. Security - How we protect data
9. Children's Privacy - Age restrictions
10. Changes to Privacy Policy - How we notify users
11. Contact - How to reach us

**Files to Create:**
- `apps/web/src/routes/Legal/Privacy.tsx`
- `apps/web/src/components/LegalPageLayout.tsx` (optional - reusable layout)

**Implementation Steps:**
1. Create `routes/Legal/` directory
2. Generate privacy policy content (AI template, review by lawyer later)
3. Create `Privacy.tsx` component
4. Add route to `main.tsx`
5. Style with Tailwind (match app design)
6. Add "Back" button or link to home
7. Test responsive design and dark mode

**Estimated Time:** 45 minutes

---

#### Terms of Service Page
**Route:** `/terms`
**Purpose:** Legal requirement - define terms and conditions for using OneLink

**Content Sections:**
1. Acceptance of Terms - By using OneLink, you agree...
2. Description of Service - What OneLink provides
3. User Accounts - Account creation, responsibility
4. Acceptable Use - What users can/cannot do
5. Content Ownership - Who owns uploaded content
6. Payment Terms - Subscription, billing, refunds
7. Limitations - Service limits, availability
8. Termination - How accounts can be terminated
9. Disclaimers - Service provided "as is"
10. Limitation of Liability - Legal protections
11. Governing Law - Which laws apply
12. Changes to Terms - How we update terms
13. Contact - How to reach us

**Files to Create:**
- `apps/web/src/routes/Legal/Terms.tsx`

**Implementation Steps:**
1. Generate terms of service content (AI template, review by lawyer later)
2. Create `Terms.tsx` component
3. Add route to `main.tsx`
4. Style with Tailwind (match app design)
5. Add "Back" button or link to home
6. Test responsive design and dark mode

**Estimated Time:** 45 minutes

**Note:** Legal content should be reviewed by a lawyer before production. This is a template.

---

### 2. Footer Component (Optional Enhancement)
**Status:** ✅ Completed
**Purpose:** Add footer links to Privacy and Terms pages across the app

**Features:**
- Links to Privacy and Terms
- Copyright notice
- "Powered by OneLink" (for free plans on public profiles)
- Responsive design
- Dark mode support

**Files to Create:**
- `apps/web/src/components/Footer.tsx`

**Usage:**
- Add to `/auth` page (landing page)
- Add to public profile pages (if not Pro)
- Optional: Add to dashboard footer

**Estimated Time:** 20 minutes

---

### 3. Upgrade to Pro / Stripe Checkout Pages
**Status:** ✅ Completed
- ✅ `goToCheckout()` redirects to Stripe Checkout (works)
- ✅ Loading state while redirecting
- ✅ Error handling if checkout fails (network, API, auth errors)
- ✅ Success/cancel callback pages (`/checkout/success`, `/checkout/cancel`)
- ✅ Pricing page (`/pricing`) showing plan features comparison
- ✅ Upgrade confirmation modal before redirect
- ✅ CORS headers added to `stripe-create-checkout` and `stripe-portal` Edge Functions
- ✅ Webhook Stripe fixed (bug du filtre `userId` + sauvegarde `stripe_id`)
- ✅ Edge Functions deployed
- ✅ Webhook Stripe configured
- ✅ Secrets Supabase configured
- ✅ Flow tested and working

---

## Stripe Integration Setup

**Status:** ✅ Completed

**✅ Complété:**
- Edge Functions déployées
- Webhook Stripe configuré avec les 4 événements
- Secrets Supabase configurés (4 Price IDs, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL, SUPA_DATABASE_URL, SUPA_DATABASE_SERVICE_ROLE_KEY)
- Code corrigé (bug webhook, sauvegarde stripe_id, CORS headers)
- Flow complet testé et fonctionnel

---

### 5. Delete Account Page
**Status:** ✅ Completed (UI + Backend + MFA)
**Implementation:**
- Modal/Drawer responsive (`DeleteAccountModal.tsx`)
- Warning message with icon
- **MFA code input** (6 digits) - Required for account deletion
- Conditional UI:
  - If 2FA not enabled → Shows message "Enable 2FA to delete your account" + CTA to `/settings/2fa`
  - If 2FA enabled → Shows MFA code input + confirmation checkbox
- Checkbox "I understand this action is irreversible"
- Button disabled until validation (6-digit MFA code + checkbox)
- Route: Accessed from Settings → Privacy & Security section

**Backend:**
- ✅ Edge Function `delete-account` - MFA verification required before deletion
- ✅ Cascade delete API - Deletes account, profile, links, drops, submissions, sessions, preferences, login history, export audit
- ✅ Email notification to user after deletion
- ✅ Sign out and redirect to `/auth` after deletion
- ✅ Feature flag `DELETE_ACCOUNT_ENABLED` for safety
- ✅ Unit tests (Deno) and E2E tests (Playwright)

---

### 6. Change Password Page
**Status:** ✅ Completed
**Implementation:**
- Modal/Drawer responsive (`ChangePasswordModal.tsx`)
- Form with current password, new password, confirm password
- Validation (min 8 chars, must match, must be different)
- Supabase Auth integration (verifies current password via `signInWithPassword`, then updates via `updateUser`)
- Success/error handling with toasts
- Route: Accessed from Settings → Privacy & Security section
- Button with `data-testid="settings-change-password"` in PrivacySecuritySection
- Modal with `data-testid="change-password-modal"`
- Form with `data-testid="settings-change-password-form"`
- ✅ E2E test support (`e2e/settings.spec.ts:140`)

---

### 7. Two-Factor Authentication Page
**Status:** ✅ Completed
**Implementation:**
- Full page at `/settings/2fa` (`TwoFactorPage.tsx`)
- QR code generation with `qrcode.react`
- Secret key display with copy
- Verification code input (6 digits)
- Enable/disable flow
- States: disabled, setup, active
- Route: Accessed from Settings → Privacy & Security section
- ✅ Supabase MFA integration (TOTP via Supabase Auth)

---

## Implementation Priority

### Remaining Tasks

**High Priority:**
1. 🌐 Landing Page / Site Vitrine
   - **Status:** ✅ Completed
   - **Priority:** High (MVP Launch)
   - **Estimated Time:** 8-12 hours (✅ Completed)
   - **Domain:** `onlnk.io` (à acheter)
   - **Architecture:** 
     - `onlnk.io` → Landing page (`apps/landing/` - Vite + React)
     - `app.onlnk.io` → Application (`apps/web` - dashboard actuel)
   - **Description:** Créer un site vitrine professionnel pour présenter OneLink, convertir les visiteurs, et servir de point d'entrée principal
   - **Documentation:** Voir `docs/LANDING_PAGE.md` pour le design complet, sections, et implementation steps
   - **Sections principales:**
     - ✅ Hero section (headline, CTA, carousel d'images)
     - ✅ Features (6 features principales)
     - ✅ How It Works (4 étapes)
     - ✅ Pricing (Free vs Pro)
     - ✅ Social Proof / Testimonials
     - ✅ Demo / Screenshots
     - ✅ Comparison Section
     - ✅ Trust Section
     - ✅ FAQ Section
     - ✅ Footer (navigation, legal, social)
   - **Stack:** Vite + React + Tailwind CSS (same as current app)
   - **SEO:** ✅ `react-helmet-async` for meta tags, ✅ sitemap.xml, ✅ robots.txt
   - **Location:** ✅ `apps/landing/` folder in monorepo (Pattern 1 - separate app, same repo)
   - **Routes:** ✅ `/`, `/features`, `/pricing`, `/auth`, `/privacy`, `/terms`
   - **Infrastructure:** ✅ i18n (10 langues), ✅ Dark/Light mode, ✅ Analytics (PostHog), ✅ Tests (Vitest + Playwright)
   - **Completed Tasks:**
     - ✅ Domain Configuration (DNS setup in Hostinger → Vercel)
     - ✅ Cross-Browser Testing (Manual testing completed)
     - ✅ Build & Deployment Configuration (ready for Vercel)

2. 👋 Welcome Page / Username Selection Flow
   - **Status:** ✅ Completed
   - **Priority:** High (Critical for first-time user experience)
   - **Estimated Time:** 3-4 hours (✅ Completed)
   - **Location:** `apps/web/src/routes/Welcome.tsx`
   - **Description:** Créer une page "Welcome" qui s'affiche après la première connexion pour permettre à l'utilisateur de choisir/réserver son username (comme Linktree)
   - **Problem Statement:**
     - Actuellement, le username est stocké dans localStorage mais pas réservé en backend
     - Pas de page "Welcome, choose your username" après la première connexion
     - Le profile est créé automatiquement avec un slug généré dans `getOrCreateProfile()`
     - Si quelqu'un d'autre crée un compte avec le même username entre-temps, ça échoue
   - **Flow Proposé:**
     1. Landing → utilisateur entre username → redirige vers `/auth?username=xxx`
     2. Auth → connexion (email magic link OU social: Google, Meta/Facebook, Apple)
     3. Après connexion → vérifier si profile existe
     4. Si pas de profile (première fois) → rediriger vers `/welcome` (au lieu de `/dashboard`)
     5. Page Welcome → formulaire pour choisir/réserver le username
        - Afficher le username du localStorage s'il existe
        - Vérifier la disponibilité en temps réel (debounce)
        - Bouton "Continue" pour créer le profile
     6. Après création → rediriger vers `/dashboard`
   - **Important:**
     - ✅ Garder le système actuel de magic link (email avec code) - PAS de changement
     - ✅ La page Welcome s'affiche pour TOUS les nouveaux users (email OU social)
     - ✅ Détection "première fois" = vérifier si profile existe dans la DB
     - ⚠️ **Note:** Les connexions sociales (Google, Apple, Meta) seront implémentées dans une tâche séparée (voir ci-dessous)
   - **Implementation Tasks:**
     - [x] **Welcome Page:**
       - [x] Créer route `/welcome` dans `apps/web/src/routes/Welcome.tsx`
       - [x] Créer hook `useUsernameAvailability()` pour vérifier la disponibilité en temps réel
       - [x] Modifier `App.tsx` pour rediriger vers `/welcome` si pas de profile après connexion
       - [x] Modifier `getOrCreateProfile()` pour ne PAS créer automatiquement le profile
       - [x] Créer fonction `createProfileWithUsername(username: string)` pour créer le profile avec le username choisi
       - [x] Ajouter validation du username (caractères autorisés, longueur min/max)
       - [x] Ajouter messages d'erreur (username pris, caractères invalides, etc.)
       - [x] Ajouter traductions pour la page Welcome (10 langues)
     - [x] **Tests:**
       - [x] Tests unitaires pour `Welcome.tsx`
       - [x] Tests E2E pour le flow email (landing → auth → welcome → dashboard)
       - [x] Tests E2E pour le flow social (auth → welcome → dashboard) - après implémentation des providers sociaux
   - **Completed Features:**
     - ✅ Welcome page route `/welcome` implemented
     - ✅ Username availability check with real-time validation
     - ✅ Edge Function `create-profile` for atomic profile creation
     - ✅ Redirect logic from dashboard to welcome if no profile exists
     - ✅ Username validation (characters, length)
     - ✅ Error handling and user feedback
     - ✅ Full i18n support (10 languages)
     - ✅ Unit tests and E2E tests implemented
     - ✅ Merged to main branch (PR #75)
   - **Design Requirements:**
     - Style similaire à la page Auth (logo, background, centré)
     - Input pour username avec préfixe `app.onlnk.io/`
     - Indicateur de disponibilité (✓ disponible, ✗ pris, ⏳ vérification...)
     - Message d'aide: "You can always change it later"
     - Bouton "Continue" désactivé si username invalide ou pris
   - **Backend Requirements:**
     - Fonction pour vérifier la disponibilité du username (query Supabase)
     - Fonction pour créer le profile avec le username choisi
     - Gestion des conflits (username pris entre le check et la création)
   - **Auth System:**
     - ✅ **Garder le magic link actuel** (email avec code) - PAS de changement
     - ✅ **Flow identique pour email ET social:** Après connexion, vérifier si profile existe
     - ✅ **Page Welcome pour TOUS les nouveaux users** (email ou social)
     - ⚠️ **Note:** Les providers sociaux seront ajoutés dans une tâche séparée
   - **Edge Function (Recommandé):**
     - Créer `supabase/functions/create-profile/index.ts`
     - **Pourquoi:** Éviter les race conditions (deux utilisateurs créent le même username simultanément)
     - **Fonctionnalités:**
       - Vérifier la disponibilité du username
       - Créer le profile de manière atomique (transaction)
       - Retourner erreur si username déjà pris
       - Utiliser service role pour bypass RLS si nécessaire
     - **Alternative:** Faire depuis le client avec RLS + transaction SQL, mais moins sûr pour les race conditions
   - **Dependencies:**
     - `apps/web/src/lib/profile.ts` - Modifier `getOrCreateProfile()` pour ne PAS créer automatiquement
     - `apps/web/src/routes/App.tsx` - Ajouter redirection vers `/welcome` si pas de profile
     - `apps/web/src/lib/router.tsx` - Ajouter route `/welcome`
     - `supabase/functions/create-profile/` - Nouvelle edge function (optionnel mais recommandé)

3. 🔐 Social Authentication Providers (Google, Apple, Meta)
   - **Status:** ✅ Completed (Google only)
   - **Priority:** High (Important for user onboarding)
   - **Estimated Time:** 2-3 hours
   - **Location:** `apps/web/src/routes/Auth.tsx`, `apps/web/src/lib/AuthProvider.tsx`
   - **Description:** Ajouter les connexions sociales (OAuth) en plus du magic link email
   - **Providers à ajouter:**
     - ✅ **Google** - Implemented and tested
     - ⏸️ **Apple** - Skipped (requires $99/year Apple Developer fee)
     - ⏸️ **Meta/Facebook** - Skipped (requires app review process)
   - **Implementation Tasks:**
     - [x] Configurer les providers dans Supabase Dashboard (Google)
     - [x] Ajouter boutons "Continue with Google" dans `Auth.tsx`
     - [x] Implémenter `signInWithOAuth(provider: string)` dans `AuthProvider.tsx`
     - [x] Gérer les redirects après OAuth (garder le username du localStorage si présent)
     - [x] Gérer les erreurs OAuth (utilisateur annule, erreur de config, etc.)
     - [x] Ajouter traductions pour les boutons sociaux (10 langues)
     - [x] Tests unitaires et E2E pour Google OAuth
   - **Design Requirements:**
     - ✅ Style similaire aux boutons sociaux de Linktree
     - ✅ Icônes officielles (Google - custom SVG suivant guidelines)
     - ✅ Boutons avec bordures arrondies, hover effects
     - ✅ Disposition verticale sous le formulaire email
   - **Dependencies:**
     - ✅ Supabase Dashboard configuration (OAuth credentials)
     - ✅ `apps/web/src/lib/AuthProvider.tsx` - `signInWithOAuth()` implémenté
     - ✅ `apps/web/src/routes/Auth.tsx` - Bouton Google ajouté
   - **Note:** Google OAuth fonctionne en local et production. Apple et Meta peuvent être ajoutés plus tard si nécessaire.

4. 🎥 Upload "How It Works" Video from YouTube
   - **Status:** 🔴 Not Started
   - **Priority:** High (Important for user onboarding and conversion)
   - **Estimated Time:** 1-2 hours
   - **Location:** Landing page "How It Works" section
   - **Description:** Upload and embed a "How It Works" video from YouTube to the landing page
   - **Implementation Tasks:**
     - [ ] Upload video to YouTube (or use existing video)
     - [ ] Get YouTube video ID
     - [ ] Embed YouTube video in landing page "How It Works" section
     - [ ] Add responsive video player (iframe with proper aspect ratio)
     - [ ] Test video playback on mobile and desktop
     - [ ] Add video thumbnail/placeholder
     - [ ] Ensure video is accessible (alt text, captions if available)
   - **Files to Update:**
     - `apps/landing/src/routes/Home.tsx` or `apps/landing/src/components/sections/HowItWorksSection.tsx`
     - Add YouTube embed component
   - **Design Requirements:**
     - Responsive video player (16:9 aspect ratio)
     - Centered in "How It Works" section
     - Optional: Add play button overlay
     - Optional: Add video title/description
   - **Notes:**
     - Can use `react-player` or native iframe
     - Ensure video is mobile-friendly
     - Consider lazy loading for performance

**Medium Priority:**
1. 🔍 SEO Optimization - Improve search engine visibility
   - **Status:** 🔴 Not Started
   - **Priority:** Medium (Important for landing page conversion)
   - **Estimated Time:** 
     - Phase 1: 2-3 hours (Basic SEO)
     - Phase 2: 3-4 hours (Pre-rendering)
     - Phase 3: 4-6 hours (Advanced SEO)
   - **Location:** `apps/landing/`, `apps/web/`
   - **Description:** Implement SEO best practices for better search engine visibility and social sharing
   - **Implementation Tasks:**
     - [ ] Phase 1: Install `react-helmet-async` and replace manual meta tags
     - [ ] Phase 1: Add proper meta tags to all routes
     - [ ] Phase 1: Add Open Graph and Twitter Card tags
     - [ ] Phase 2: Install `vite-plugin-prerender` for static routes
     - [ ] Phase 2: Configure pre-rendering for landing pages
     - [ ] Phase 3: Add structured data (JSON-LD)
     - [ ] Phase 3: Generate `sitemap.xml`
     - [ ] Phase 3: Create `robots.txt`
     - [ ] Phase 3: Submit to Google Search Console
   - **Files to Create/Update:**
     - `apps/landing/src/lib/seo.ts` - SEO utilities
     - `apps/landing/public/sitemap.xml`
     - `apps/landing/public/robots.txt`
     - Update all route components with `<Helmet>`
   - **Dependencies:**
     - `react-helmet-async` package
     - `vite-plugin-prerender` (optional, Phase 2)
   - **See detailed plan:** See "SEO Optimization" section below for full implementation details

2. 📊 Analytics Detail Page - Create dedicated analytics page with detailed views
   - Route: `/dashboard/analytics` or `/analytics`
   - Detailed charts and graphs for links and drops analytics
   - Time range selection (7/30/90 days, custom range)
   - Export analytics data (CSV/JSON)
   - Historical data visualization
   - **Status:** 🔴 Not Started
   - **Priority:** Medium (gros chantier)

2. 📈 Monitoring & Observability Stack (Sentry + PostHog)
   - **Sentry Setup:**
     - Install `@sentry/react` for frontend error tracking
     - Install `@sentry/deno` for Edge Functions error tracking
     - Configure error alerts (email/Slack)
     - Enable performance tracing (automatic request tracing)
   - **PostHog Setup:**
     - Install PostHog SDK
     - Configure event tracking
     - Set up user identification
     - Track key user actions (sign up, sign in, create link, create drop, etc.)
     - Set up funnels and conversion tracking
     - Configure environment variables
   - **Documentation:** See `docs/meta/monitoring.md` for full observability stack
   - **Status:** ✅ Completed
   - **Priority:** Medium

3. 🔔 Notifications System (In-App + Email)
   - **Current State:**
     - ✅ Basic inbox display (submissions shown in Dashboard)
     - ✅ Clear all functionality (soft delete via `deleted_at`)
     - ✅ Notification preferences UI (Settings → Notifications section)
     - ✅ Database migration read/unread (Task 1 completed)
     - ✅ Email service setup (Resend - Task 2 completed)
     - ✅ Email notification Edge Function (Task 3 completed - déployée)
     - ✅ Real-time updates (Supabase Realtime subscriptions active)
     - ✅ Email notifications triggered (database trigger configured)
     - ✅ Read/unread UI (visual indicators, mark as read buttons)
     - ✅ Download notifications (realtime + display in inbox)
   
   - **Phase 1: Maintenant (Tous les plans) - Submissions & Downloads**
     - ✅ Task 1: Database Migration Read/Unread (Completed)
     - ✅ Task 2: Email Service Setup (Completed)
     - ✅ Task 3: Email Notification Edge Function (Completed)
     - ✅ Task 4: Database Trigger for Email (Completed - `014_email_notifications_trigger.sql`)
     - ✅ Task 5: Weekly Digest Edge Function (Code créé et cron configuré via GitHub Actions - `send-weekly-digest`)
     - ✅ Task 6: Realtime Subscription Hook (Completed - `useSubmissionsRealtime`)
     - ✅ Task 7: Update useDashboardData for Realtime (Completed - hooks intégrés)
     - ✅ Task 8: InboxTab Read/Unread UI (Completed - styles + boutons)
     - ✅ Task 9: Navigation Unread Badge (Completed - TabNavigation + BottomNavigation)
     - ✅ Task 10: Download Notifications In-App (Completed - `useFileDownloadsRealtime`)
     - ✅ Task 11: Manual Refresh Button (Completed - bouton + pull-to-refresh)
   
   - **Phase 2: Plus Tard (PRO/Starter seulement) - Activity & Summaries**
     - 🔴 Task 12: Activity Notifications (Clics/Vues) In-App (3h)
       - Section Activity dans inbox ou onglet séparé
       - Notifications temps réel pour clics sur liens
       - Notifications pour vues de drops
       - Configurable dans Settings
       - **PAS d'emails** (seulement in-app)
     - 🔴 Task 13: Daily/Weekly Summary Email (2h)
       - Résumé quotidien/hebdomadaire des clics/vues
       - Top liens les plus cliqués
       - Seulement si préférence activée ET plan PRO/Starter
   
   - **Documentation:** Voir section "Notifications System - Phase 2" ci-dessous pour les détails
   - **Status:** ✅ Phase 1 Complétée - Phase 2 En attente
   - **Priority:** Medium
   - **Estimated Time:** 
     - Phase 1: ✅ Complétée et testée (~8 heures)
     - Phase 2: ~5 heures (PRO/Starter seulement)
   
   - **Fonctionnalités Implémentées:**
     - ✅ Notifications temps réel (submissions + downloads)
     - ✅ UI Read/Unread avec indicateurs visuels
     - ✅ Badges de comptage dans la navigation
     - ✅ Boutons "Mark as read" individuels et "Mark all as read"
     - ✅ Bouton refresh manuel + pull-to-refresh mobile
     - ✅ Emails automatiques avec rate limiting amélioré (1 email / 5 min par drop)
     - ✅ i18n complet (traductions ajoutées)
   
   - **À Faire:**
     - ✅ Weekly Digest - Edge Function créée et cron configuré via GitHub Actions
   
   - **Migrations SQL Appliquées:**
     - ✅ `013_notifications_system.sql` - Read/unread status
     - ✅ `014_email_notifications_trigger.sql` - Trigger pour emails
     - ✅ `015_download_notifications.sql` - Fonction get_downloads_by_profile
     - ✅ `016_email_rate_limiting_improvement.sql` - Rate limiting amélioré avec last_email_sent_at
   
   - **Tests:** Voir `docs/TEST_PLAN_NOTIFICATIONS.md` pour le plan complet de tests (unitaires, intégration, E2E)
   
   - **Note importante:** Le système de notifications utilise actuellement Supabase Realtime pour les mises à jour automatiques. Cependant, pour une meilleure expérience utilisateur, il serait bénéfique d'implémenter un vrai système realtime client-serveur (WebSocket ou Server-Sent Events) pour éviter d'avoir besoin d'appuyer sur refresh. Cela permettrait une synchronisation bidirectionnelle plus robuste et une meilleure gestion de la reconnexion automatique.

**Low Priority (Nice to have):**
1. File Display Modes (List / Card / Grid) - See "UI Enhancements" section below

---

## Notifications System - Phase 2 (PRO/Starter)

**Status:** 🔴 Not Started  
**Priority:** Low (Plus tard)  
**Plan Required:** PRO ou Starter

### Batch 4: Activity Notifications & Summaries

#### 🔴 Task 12: Activity Notifications (Clics/Vues) - PRO/Starter
**Estimated Time:** 3 hours

**Description:**
- Section "Activity" dans l'inbox ou onglet séparé
- Notifications temps réel pour :
  - Clics sur les liens (`link_clicks`)
  - Vues de drops (`drop_views`)
  - Vues de profil (optionnel)
- Configurable dans Settings
- **PAS d'emails** (seulement in-app)

**Files to Create:**
- `supabase/sql/015_activity_notifications.sql` (table `activity_notifications`)
- `apps/web/src/hooks/useActivityRealtime.ts`
- `apps/web/src/routes/Dashboard/components/ActivityTab.tsx` (ou section dans InboxTab)

**Database Schema:**
```sql
CREATE TABLE public.activity_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'link_click', 'drop_view', 'profile_view'
  link_id uuid REFERENCES public.links(id),
  drop_id uuid REFERENCES public.drops(id),
  clicked_by_user_id uuid REFERENCES auth.users(id), -- null if anonymous
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  metadata jsonb -- {ip, user_agent, referrer, etc.}
);
```

**Preference:**
- Ajouter `activity_notifications` dans `user_preferences`
- Vérifier plan (PRO/Starter) avant d'afficher

---

#### 🔴 Task 13: Daily/Weekly Summary Email - PRO/Starter
**Estimated Time:** 2 hours  
**Dependencies:** Task 12

**Description:**
- Edge Function `send-daily-summary` ou `send-weekly-summary`
- Résumé des clics/vues de la journée/semaine
- Top liens les plus cliqués
- Stats agrégées
- Seulement si préférence activée ET plan PRO/Starter

**Files to Create:**
- `supabase/functions/send-daily-summary/index.ts`
- `supabase/functions/send-weekly-summary/index.ts` (ou combiner avec weekly-digest)
- Templates email

**Preference:**
- Ajouter `daily_summary` et `weekly_summary` dans `user_preferences`
- Vérifier plan avant d'envoyer

**Total Estimated Time:** ~5 heures

---

## Weekly Digest Email (Phase 1 - À Compléter)

**Status:** ✅ Complété  
**Priority:** Low  
**Estimated Time:** 30 minutes (configuration cron)

**Current State:**
- ✅ Edge Function `send-weekly-digest` créée et fonctionnelle
- ✅ Templates email créés (HTML et TXT)
- ✅ Logique d'agrégation des submissions par drop
- ✅ Vérification préférence `weekly_digest`
- ✅ **Cron job configuré** - GitHub Actions workflow (`weekly-digest.yml`) exécute la fonction tous les lundis à 9h UTC

**Description:**
- Email résumé hebdomadaire envoyé tous les lundis à 9h UTC
- Agrège toutes les submissions de la semaine passée
- Groupé par drop avec statistiques
- Seulement si préférence `weekly_digest` activée

**Ce qui manque:**
- Configuration du cron job dans Supabase pour appeler la fonction automatiquement
- Option 1: Supabase Cron (pg_cron extension)
- Option 2: External scheduler (GitHub Actions, Vercel Cron, etc.)

**Configuration Requise:**
```sql
-- Exemple avec pg_cron (si disponible)
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1', -- Tous les lundis à 9h UTC
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-weekly-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Alternative (External Scheduler):**
- GitHub Actions avec schedule cron
- Vercel Cron Jobs
- Cloudflare Workers Cron Triggers
- Appeler manuellement via API

**Files:**
- ✅ `supabase/functions/send-weekly-digest/index.ts` (créé)
- ✅ `supabase/functions/_shared/emails/weekly-digest.html` (créé)
- ✅ `supabase/functions/_shared/emails/weekly-digest.txt` (créé)

---

## Realtime Client-Server Improvement

**Status:** 🔴 Not Started  
**Priority:** Medium  
**Category:** Infrastructure Improvement

**Current State:**
- Le système utilise Supabase Realtime pour les notifications
- Un bouton "Refresh" manuel existe pour recharger les données
- Les mises à jour automatiques fonctionnent mais peuvent être améliorées

**Problem:**
- Supabase Realtime peut avoir des problèmes de reconnexion
- Pas de synchronisation bidirectionnelle optimale
- L'utilisateur doit parfois appuyer sur refresh pour voir les dernières données

**Proposed Solution:**
Implémenter un vrai système realtime client-serveur avec :

1. **WebSocket Connection** (ou Server-Sent Events)
   - Connexion persistante entre client et serveur
   - Reconnexion automatique en cas de déconnexion
   - Heartbeat pour maintenir la connexion active

2. **Synchronisation Bidirectionnelle**
   - Client → Serveur : Actions utilisateur (mark as read, etc.)
   - Serveur → Client : Nouvelles notifications en temps réel
   - État synchronisé automatiquement

3. **Queue de Messages**
   - Stocker les messages non livrés pendant les déconnexions
   - Replay automatique à la reconnexion
   - Garantir la livraison des notifications

4. **Optimistic Updates**
   - Mise à jour immédiate de l'UI avant confirmation serveur
   - Rollback en cas d'erreur

**Benefits:**
- ✅ Pas besoin de refresh manuel
- ✅ Synchronisation automatique et fiable
- ✅ Meilleure expérience utilisateur
- ✅ Gestion robuste des déconnexions

**Implementation Options:**
- **Option 1:** Améliorer Supabase Realtime avec reconnexion automatique et queue
- **Option 2:** Implémenter WebSocket custom avec Node.js/Deno
- **Option 3:** Utiliser un service tiers (Pusher, Ably, etc.)

**Estimated Time:** 8-12 hours (selon l'option choisie)

---

## State Management

### Migrate AuthProvider to Zustand (or similar state manager)

**Current State:**
- `AuthProvider.tsx` uses React Context API (218 lines)
- All components using `useAuth()` re-render when any auth state changes
- Context API causes unnecessary re-renders across the app

**Problem:**
- Performance: Context API re-renders all consumers when `session`, `user`, or `loading` changes
- Scalability: As the app grows, Context API becomes less efficient
- Testing: Context API is harder to test in isolation

**Proposed Solution:**
- Migrate authentication state to Zustand (or similar lightweight state manager)
- Benefits:
  - Selective subscriptions (components only re-render when needed values change)
  - Better performance
  - Simpler API (no Provider wrapper needed)
  - Easier to test
  - Less boilerplate

**Files to Update:**
- `apps/web/src/lib/AuthProvider.tsx` → Create Zustand store
- All components using `useAuth()` hook
- `apps/web/src/hooks/useRequireAuth.ts`
- `apps/web/src/hooks/useRequireProPlan.ts`
- `apps/web/src/routes/Dashboard/index.tsx`
- `apps/web/src/routes/Settings/index.tsx`
- `apps/web/src/routes/App.tsx`
- And other components using `useAuth()`

**Dependencies:**
- Add `zustand` package: `pnpm add zustand`

**Status:** 🔴 Not Started

**Priority:** Medium (works currently, but would improve performance and maintainability)

---

## SEO Optimization

**Status:** 🔴 Not Started  
**Priority:** Medium (Important for landing page)  
**Category:** Infrastructure / Marketing

### Current State
- Basic meta tags in `index.html` (static)
- Manual meta tag updates in Profile component using `useEffect` and DOM manipulation
- No structured data (JSON-LD)
- No sitemap.xml
- No robots.txt

### Problem
- Vite + React SPA renders client-side, Google crawlers may see empty HTML initially
- Meta tags updated via JavaScript after page load (Google may miss them)
- No pre-rendering or SSR for better SEO

### Solution: SEO Libraries & Plugins

#### Option 1: react-helmet-async (Recommended for MVP)
**Purpose:** Clean, declarative meta tag management

**Installation:**
```bash
pnpm add react-helmet-async
```

**Usage:**
- Wrap app with `<HelmetProvider>`
- Use `<Helmet>` component in each route/page
- Automatically manages meta tags, title, Open Graph, Twitter Cards
- Works with React Router

**Benefits:**
- ✅ Clean API (declarative)
- ✅ Automatic cleanup
- ✅ SSR-ready (if needed later)
- ✅ Works with Vite + React
- ✅ Better than manual DOM manipulation

**Files to Update:**
- `apps/web/src/main.tsx` - Add `<HelmetProvider>`
- `apps/web/src/routes/Profile/index.tsx` - Replace manual meta tags with `<Helmet>`
- `apps/web/src/routes/Dashboard/index.tsx` - Add meta tags
- `apps/landing/src/routes/*` - Add meta tags for landing pages

**Estimated Time:** 2-3 hours

---

#### Option 2: vite-plugin-prerender (For Better SEO)
**Purpose:** Pre-render static routes at build time for better SEO

**Installation:**
```bash
pnpm add -D vite-plugin-prerender
```

**Configuration:**
```typescript
// vite.config.ts
import { prerender } from 'vite-plugin-prerender'

export default {
  plugins: [
    react(),
    prerender({
      routes: ['/', '/pricing', '/features'], // Pre-render these routes
      renderer: {
        renderAfterDocumentEvent: 'render-event',
      },
    })
  ]
}
```

**What it does:**
- Build time: Generates static HTML files for specified routes
- Google sees: Full HTML with content (not empty `<div id="root">`)
- Result: Better SEO, faster initial load

**Benefits:**
- ✅ Generates static HTML at build time
- ✅ Google crawlers see full content
- ✅ No server needed (static hosting)
- ✅ Works with Vite + React

**When to use:**
- Landing pages (static content)
- Public pages (pricing, features, about)
- Pages that don't need dynamic data

**Estimated Time:** 3-4 hours (setup + configuration)

---

#### Option 3: vite-plugin-ssr (Full SSR - Future)
**Purpose:** Server-side rendering for maximum SEO

**Installation:**
```bash
pnpm add vite-plugin-ssr
```

**When to use:**
- Need dynamic server-side rendering
- Complex SEO requirements
- Want maximum control

**Trade-offs:**
- More complex setup
- Requires server/Node.js runtime
- Overkill for simple landing pages

**Estimated Time:** 8-12 hours (full SSR setup)

---

### Implementation Plan

#### Phase 1: Basic SEO (MVP) - 2-3 hours
1. ✅ Install `react-helmet-async`
2. ✅ Replace manual meta tag updates with `<Helmet>` components
3. ✅ Add proper meta tags to all routes
4. ✅ Add Open Graph and Twitter Card tags
5. ✅ Test meta tags with social media debuggers

**Files to Create/Update:**
- `apps/web/src/lib/seo.ts` - SEO utilities/helpers
- Update all route components with `<Helmet>`

---

#### Phase 2: Pre-rendering (Post-MVP) - 3-4 hours
1. ✅ Install `vite-plugin-prerender`
2. ✅ Configure pre-rendering for static routes (`/`, `/pricing`, `/features`)
3. ✅ Test pre-rendered HTML output
4. ✅ Verify Google can crawl content
5. ✅ Deploy and test

**Files to Update:**
- `apps/landing/vite.config.ts` - Add prerender plugin
- `apps/landing/src/main.tsx` - Add render event trigger

---

#### Phase 3: Advanced SEO (Future) - 4-6 hours
1. ✅ Add structured data (JSON-LD) for rich snippets
2. ✅ Generate `sitemap.xml` automatically
3. ✅ Create `robots.txt`
4. ✅ Add canonical URLs
5. ✅ Submit to Google Search Console
6. ✅ Monitor SEO performance

**Files to Create:**
- `apps/landing/public/sitemap.xml` (or generate dynamically)
- `apps/landing/public/robots.txt`
- `apps/landing/src/lib/structured-data.ts` - JSON-LD helpers

---

### Recommended Libraries

1. **react-helmet-async** - Meta tag management
   - `pnpm add react-helmet-async`
   - Clean, declarative API
   - SSR-ready

2. **vite-plugin-prerender** - Static pre-rendering
   - `pnpm add -D vite-plugin-prerender`
   - Better SEO for static pages
   - No server needed

3. **vite-plugin-ssr** - Full SSR (optional, future)
   - `pnpm add vite-plugin-ssr`
   - Maximum SEO control
   - More complex

### Testing SEO

**Tools:**
- Google Search Console - Submit sitemap, monitor indexing
- Google Rich Results Test - Test structured data
- Facebook Sharing Debugger - Test Open Graph tags
- Twitter Card Validator - Test Twitter Cards
- Lighthouse SEO audit - Check SEO score

**Checklist:**
- [ ] Meta tags present in HTML source
- [ ] Open Graph tags work (Facebook/LinkedIn)
- [ ] Twitter Cards work
- [ ] Structured data validates
- [ ] Sitemap.xml accessible
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Mobile-friendly (responsive)

---

## Notes
- ✅ UX polish completed (mobile → desktop → dark theme)
- ✅ Drop system redesign completed
- Maintain backward compatibility
- Keep user experience simple and intuitive
- Legal pages can start English-only, translations can be added later
- SEO optimization important for landing page conversion
