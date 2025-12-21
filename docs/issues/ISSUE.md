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
- Supabase Auth integration
- Success/error handling with toasts
- Route: Accessed from Settings → Privacy & Security section

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
_(None - all critical features completed)_

**Medium Priority:**
1. 📊 Analytics Detail Page - Create dedicated analytics page with detailed views
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
     - 🔴 Task 5: Weekly Digest Edge Function (Code créé mais cron non configuré - `send-weekly-digest`)
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
   - **Status:** 🟡 Phase 1 Presque Complétée (Weekly Digest cron manquant) - Phase 2 En attente
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
     - 🔴 Weekly Digest - Edge Function créée mais cron non configuré (nécessite Supabase Cron ou scheduler)
   
   - **Migrations SQL Appliquées:**
     - ✅ `013_notifications_system.sql` - Read/unread status
     - ✅ `014_email_notifications_trigger.sql` - Trigger pour emails
     - ✅ `015_download_notifications.sql` - Fonction get_downloads_by_profile
     - ✅ `016_email_rate_limiting_improvement.sql` - Rate limiting amélioré avec last_email_sent_at
   
   - **Tests:** Voir `docs/TEST_PLAN_NOTIFICATIONS.md` pour le plan complet de tests (unitaires, intégration, E2E)
     - ✅ E2E tests créés et fonctionnels (`notifications-realtime.spec.ts`, `notifications-refresh.spec.ts`, `settings.spec.ts`)
     - ✅ CI/CD pipeline passing - Tous les tests E2E passent en CI
     - ✅ Fixes appliqués: env vars loading, data-testid selectors, mouse events pour mobile
     - ✅ Tests locaux fonctionnels avec `.env.local` chargé automatiquement
   
   - **CI/CD Status:** ✅ **PASSING** - Tous les tests E2E passent en CI après fixes:
     - Fix: Chargement des env vars dans worker processes (auth fixture)
     - Fix: Migration vers `data-testid` selectors pour plus de robustesse
     - Fix: Remplacement `touchscreen.tap()` par `mouse.move()` + `mouse.down()` pour mobile
     - Fix: Amélioration des stratégies d'attente pour les toggles et badges
     - **Merged:** ✅ Branch `45-notifications-in-app` merged to main
   
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

**Status:** 🟡 Partiellement Complété  
**Priority:** Low  
**Estimated Time:** 30 minutes (configuration cron)

**Current State:**
- ✅ Edge Function `send-weekly-digest` créée et fonctionnelle
- ✅ Templates email créés (HTML et TXT)
- ✅ Logique d'agrégation des submissions par drop
- ✅ Vérification préférence `weekly_digest`
- 🔴 **Cron job non configuré** - La fonction n'est jamais appelée automatiquement

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

## Notes
- ✅ UX polish completed (mobile → desktop → dark theme)
- ✅ Drop system redesign completed
- Maintain backward compatibility
- Keep user experience simple and intuitive
- Legal pages can start English-only, translations can be added later
