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
Status: 🔄 TODO
- Replace string literals (`"free"`, `"pro"`) with TypeScript enum or constants
- Update all plan checks (`plan !== "pro"` → `plan !== PlanType.PRO`)
- Files to update:
  - `apps/web/src/lib/profile.ts` - `getSelfPlan`, `getPlanBySlug` return types
  - `apps/web/src/routes/Dashboard/index.tsx` - `isFree` check
  - `apps/web/src/routes/Dashboard/hooks/useDashboardData.ts` - plan state
  - `apps/web/src/routes/Profile/index.tsx` - plan checks
  - `apps/web/src/routes/Profile.tsx` - plan state
  - `apps/web/src/routes/Profile/hooks/useProfileData.ts` - plan state
  - `apps/web/src/routes/Profile/utils/analytics.ts` - plan check
- Benefits:
  - Type safety
  - Autocomplete support
  - Easier refactoring
  - Prevents typos

---

## Notes
- Focus on UX polish first (mobile → desktop → dark theme)
- Then implement drop system redesign
- Maintain backward compatibility
- Keep user experience simple and intuitive

---

## Missing UI Pages & Features

### 1. Legal Pages (Privacy Policy & Terms of Service)
**Status:** 🔄 TODO

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
**Status:** 🔄 TODO
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
**Status:** 🔄 TODO (Backend exists, UI missing)
**Current:** `goToCheckout()` redirects to Stripe Checkout (works)
**Missing:**
- Loading state while redirecting
- Error handling if checkout fails
- Success/cancel callback pages (`/checkout/success`, `/checkout/cancel`)
- Pricing page (`/pricing`) showing plan features comparison
- Upgrade confirmation modal/page before redirect

**Note:** Requires backend/BA/SQL work - not UI-only

---

### 4. Delete Account Page
**Status:** 🔄 TODO (Button exists, no functionality)
**Current:** Button in Settings modal (no action)
**Missing:**
- Confirmation page (`/account/delete`) with:
  - "Are you sure?" warning
  - Reason dropdown/textarea (why are you leaving?)
  - Checkbox: "I understand this action cannot be undone"
  - Final confirmation button
- Backend API to delete account (cascade delete profile, links, drops, submissions)
- Email notification to user
- Success page after deletion

**Note:** Requires backend work - not UI-only

---

### 5. Change Password Page
**Status:** 🔄 TODO (Button exists, no functionality)
**Current:** Button in Settings modal (no action)
**Missing:**
- Password change form (`/account/password`)
- Current password field
- New password field (with strength indicator)
- Confirm new password field
- Supabase Auth password update integration
- Success/error handling

**Note:** Since we use magic links (passwordless), this might be less critical, but still needed for users who want to set a password.

---

### 6. Two-Factor Authentication Page
**Status:** 🔄 TODO (Button exists, no functionality)
**Current:** Button in Settings modal (no action)
**Missing:**
- 2FA setup page (`/account/2fa`)
- QR code generation (TOTP)
- Backup codes display
- Enable/disable toggle
- Supabase Auth 2FA integration (if supported) or custom implementation

**Question:** Do we need 2FA if we use magic links? Magic links are already secure. Consider removing this or making it optional for users who want extra security.

---

## Implementation Priority

### Phase 1: UI-Only Pages (Current Focus)
1. ⏳ Privacy Policy Page - **NEXT**
2. ⏳ Terms of Service Page
3. ⏳ Footer Component (optional)

**Total Estimated Time:** ~2 hours

### Phase 2: Pages Requiring Backend Work
1. Upgrade to Pro / Stripe Checkout pages
2. Delete Account page
3. Change Password page
4. Two-Factor Authentication page (or remove if not needed)

**Note:** These require backend/BA/SQL work and should be planned separately.

---

## Notes
- Focus on UX polish first (mobile → desktop → dark theme)
- Then implement drop system redesign
- Maintain backward compatibility
- Keep user experience simple and intuitive
- Legal pages can start English-only, translations can be added later
