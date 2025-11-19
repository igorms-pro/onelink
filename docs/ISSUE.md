# OneLink - Issues & Roadmap

## Current Focus: Frontend UX Polish (Phase 1: Light Theme - Mobile)

Status: In Progress

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

### Next Steps
- Phase 2: Desktop responsive design
- Phase 3: Dark theme polish

---

## Roadmap: Drop System Redesign (After UX Polish)

### Problem Statement
Current drop system is confusing:
- "Inbox" concept is unclear
- Drops are one-way only (visitors → owner)
- No privacy controls
- All drops are public on profile
- No way to share specific drops via link

### Proposed Solution: Shared Folder System

**Core Concept:**
- All drops are **shared folders** (bidirectional)
- Owner can upload files
- Visitors can upload files
- Everyone sees all files in the drop

**Visibility System:**
- **Public drops:** Visible on profile page (`/profile/{slug}`)
- **Private drops:** Link-only access (`/drop/{share_token}`)
- No limit on public/private drops (except free plan: 3 total)

### Implementation Plan

#### 1. Database Migration
```sql
-- Add visibility and sharing columns
ALTER TABLE drops ADD COLUMN is_public BOOLEAN DEFAULT true;
ALTER TABLE drops ADD COLUMN share_token TEXT UNIQUE DEFAULT gen_random_uuid();

-- Optional: Add file browsing support
-- (Store file metadata in submissions.files JSONB)
```

#### 2. New Routes
- `/drop/{share_token}` - Direct drop access (public or private)
- `/drop/{share_token}/files` - Browse files in drop (optional)

#### 3. Dashboard UI Updates

**Drop Card:**
```
Speaker Requests [🌐 Public] / [🔒 Private]
Order 1 • Active

[Edit] [Toggle Visibility] [Turn off] [Delete]
[Copy Link] [Upload Files]
```

**Features:**
- Toggle public/private visibility
- Copy shareable link with QR code
- Upload files as owner
- View all files in drop
- See who uploaded (if email provided)

#### 4. Public Profile Updates
- Filter drops by `is_public = true`
- Show public drops with upload form
- Optionally show files in public drops

#### 5. Drop Page (`/drop/{token}`)
- Upload form (visitors + owner)
- File list (all uploaded files)
- Works for public and private drops
- No authentication required (unless added as feature)

### Use Cases

**Public Drops (on profile):**
- Resume submissions
- Portfolio feedback
- General file sharing
- Resource library

**Private Drops (link-only):**
- Client-specific project files
- Event-specific submissions
- Team collaboration spaces
- Confidential file sharing

**Mixed Use:**
- 2 public drops + 5 private drops
- Share private links with specific people
- Public profile stays clean and focused

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

### Technical Considerations
- Backward compatibility: Existing drops become public by default
- Free plan: 3 total drops (routes + drops combined)
- Pro plan: Unlimited drops
- Storage: Use existing Supabase Storage bucket (`drops`)
- File organization: `{drop_id}/{timestamp}-{random}.{ext}`

---

## Other Issues

### 1. Language Switching
Status: ✅ Completed
- i18next with React Context
- Browser language detection
- Persistent language preference

### 2. Mobile Responsiveness
Status: ✅ Completed (Phase 1)
- Fixed headers
- Bottom navigation
- Card layouts
- Button sizing
- Spacing adjustments

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

**Status:** ✅ Completed (UI), 🔄 Backend SQL needed

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
- ✅ Delete account modal - Confirmation with password
- ✅ User preferences hook (`useUserPreferences`) - Auto-save, localStorage fallback

### Backend SQL Needed
**File:** `supabase/sql/005_settings_tables.sql` (created)

**Tables to create:**
1. `user_preferences` - Notification and email preferences
2. `user_sessions` - Active sessions tracking
3. `login_history` - Login attempts (success/failed)
4. `user_2fa` - 2FA secrets and backup codes

**RPC Functions:**
- `get_user_sessions(user_id)` - Get active sessions
- `revoke_session(session_id)` - Revoke a session
- `revoke_all_other_sessions(user_id)` - Revoke all except current

**To run:**
```bash
# In Supabase SQL Editor or via CLI
psql <connection_string> -f supabase/sql/005_settings_tables.sql
```

### Next Steps
1. Run SQL migration (`005_settings_tables.sql`)
2. Update `useUserPreferences` hook to use Supabase instead of localStorage
3. Implement session tracking (on login, create session record)
4. Implement login history logging (on auth events)
5. Implement 2FA backend (TOTP generation, verification, encrypted storage)
6. Connect billing page to Stripe API (invoices, payment methods)

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
**Status:** ✅ Completed (UI improvements)
**Current:** 
- ✅ `goToCheckout()` redirects to Stripe Checkout (works)
- ✅ Loading state while redirecting
- ✅ Error handling if checkout fails (network, API, auth errors)
- ✅ Success/cancel callback pages (`/checkout/success`, `/checkout/cancel`)
- ✅ Pricing page (`/pricing`) showing plan features comparison
- ✅ Upgrade confirmation modal before redirect

**Improvements Made:**
- Created `BillingError` class for better error handling
- Added comprehensive error handling in `goToCheckout()` and `goToPortal()`
- Created `UpgradeConfirmationModal` component (responsive, mobile drawer support)
- Integrated modal in Pricing, BillingPage, and DashboardSubHeader
- Added toast notifications for all error scenarios
- Added translations for upgrade confirmation modal

**Note:** Backend/BA/SQL work may still be needed for full Stripe integration features

---

### 4. Google Analytics Integration (Pro Feature)
**Status:** 🔄 TODO (Code exists, not configured)
**Current:** 
- Code exists in `apps/web/src/routes/Profile/utils/analytics.ts`
- Function `maybeInjectGA()` injects GA script for Pro plans only
- Already integrated in Profile pages

**Missing:**
- Create Google Analytics account (GA4)
- Get Measurement ID (format: `G-XXXXXXXXXX`)
- Add `VITE_GA_ID=G-XXXXXXXXXX` to `.env.local` (dev) and environment variables (prod)
- Test injection on Pro profiles
- Verify tracking works in GA dashboard

**Files:**
- `apps/web/src/routes/Profile/utils/analytics.ts` - Already implemented
- `apps/web/src/routes/Profile/hooks/useProfileData.ts` - Already calls `maybeInjectGA()`

**Note:** Code is ready, just needs Google Analytics account setup and environment variable configuration.

---

### 5. Delete Account Page
**Status:** ✅ Completed (UI), 🔄 Backend needed
**Implementation:**
- Modal/Drawer responsive (`DeleteAccountModal.tsx`)
- Warning message with icon
- Password confirmation field
- Checkbox "I understand this action is irreversible"
- Button disabled until validation
- Route: Accessed from Settings → Privacy & Security section

**Backend needed:**
- API to delete account (cascade delete profile, links, drops, submissions)
- Email notification to user
- Sign out and redirect after deletion

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
- Backup codes (10 codes, copy individual/all)
- Verification code input (6 digits)
- Enable/disable flow
- States: disabled, setup, active
- Route: Accessed from Settings → Privacy & Security section

**Note:** Uses mock data for now. Backend integration needed (TOTP library, encrypted storage).

---

## Implementation Priority

### Phase 1: UI-Only Pages (Current Focus)
1. ⏳ Privacy Policy Page - **NEXT**
2. ⏳ Terms of Service Page
3. ⏳ Footer Component (optional)

**Total Estimated Time:** ~2 hours

### Phase 2: Pages Requiring Backend Work
1. Upgrade to Pro / Stripe Checkout pages
2. Google Analytics Integration (Pro Feature)
3. Delete Account page
4. Change Password page
5. Two-Factor Authentication page (or remove if not needed)

**Note:** These require backend/BA/SQL work and should be planned separately.

---

## Notes
- Focus on UX polish first (mobile → desktop → dark theme)
- Then implement drop system redesign
- Maintain backward compatibility
- Keep user experience simple and intuitive
- Legal pages can start English-only, translations can be added later
