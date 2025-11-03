# OneLink User Stories

## Overview
OneLink unifies two use cases into a single profile page:
- **Routes** (OneMeet): Intent-first buttons that link out to schedulers, docs, or any URL
- **Drops** (DropRequest): Public file inboxes where visitors can submit files without logging in

---

## User Roles
1. **Owner** - Authenticated user who creates and manages their profile
2. **Visitor** - Anonymous user viewing a public profile
3. **Subscriber** - Owner with a paid plan (Pro)

---

## 1. Authentication & Onboarding

### US-001: Sign In / Sign Up
**As a** new user  
**I want to** sign in or create an account  
**So that** I can create and manage my OneLink profile

**Acceptance Criteria:**
- User can sign up with email/password
- User can sign in with existing credentials
- Supabase Auth handles authentication
- On first login, a profile is auto-created

---

### US-002: View Landing Page
**As a** visitor  
**I want to** view the OneLink landing page  
**So that** I can understand what OneLink does and sign up

**Acceptance Criteria:**
- Landing page shows app title and tagline
- Sign in button navigates to auth
- Sample profile link available
- Settings icon visible (theme/language)

---

## 2. Profile Management

### US-003: Create Profile
**As an** owner  
**I want to** create my profile with a unique slug  
**So that** visitors can access my profile at `onelink.app/my-slug`

**Acceptance Criteria:**
- Profile auto-created on first login
- User can set custom slug (unique, URL-safe)
- Display name and bio fields available
- Avatar URL optional
- Profile accessible at `/:slug`

---

### US-004: Edit Profile
**As an** owner  
**I want to** edit my profile information  
**So that** I can keep it up to date

**Acceptance Criteria:**
- Can update slug, display name, bio, avatar URL
- Changes saved immediately
- Updated timestamp shown
- Slug uniqueness validated

---

### US-005: View My Profile (Public)
**As an** owner  
**I want to** view my public profile as visitors see it  
**So that** I can verify it looks correct

**Acceptance Criteria:**
- Navigate to `/:slug` to see public view
- Shows all active Routes and Drops
- Footer shows "Powered by OneLink" on free plan

---

## 3. Routes (Links) Management

### US-006: Add Route
**As an** owner  
**I want to** add a Route (link button) to my profile  
**So that** visitors can click to external destinations

**Acceptance Criteria:**
- Can add label, optional emoji, and URL
- URL validated (http/https)
- Free plan: max 3 total actions (Routes + Drops)
- Pro plan: unlimited Routes
- Route appears in Dashboard list

---

### US-007: Edit Route
**As an** owner  
**I want to** edit a Route's label  
**So that** I can update it without deleting

**Acceptance Criteria:**
- Click Edit on any Route
- Update label via prompt
- Changes save immediately
- Emoji and URL can be updated

---

### US-008: Delete Route
**As an** owner  
**I want to** delete a Route  
**So that** I can remove outdated links

**Acceptance Criteria:**
- Delete button on each Route
- Confirmation dialog before deletion
- Route removed from profile immediately

---

### US-009: Reorder Routes
**As an** owner  
**I want to** reorder my Routes via drag-and-drop  
**So that** I can control the display order

**Acceptance Criteria:**
- Drag handle or drag entire item
- Visual feedback during drag
- Order saved automatically
- Public page reflects new order

---

### US-010: Route Click Tracking
**As an** owner  
**I want to** see analytics on Route clicks  
**So that** I know which links get the most traffic

**Acceptance Criteria:**
- Click on Route recorded in `link_clicks`
- Analytics card shows click counts per Route
- Can filter by time period (7/30 days)

---

## 4. Drops (File Inboxes) Management

### US-011: Create Drop
**As an** owner  
**I want to** create a Drop (file inbox)  
**So that** visitors can submit files to me

**Acceptance Criteria:**
- Add Drop with label and optional emoji
- Drop appears in Dashboard
- Can toggle active/inactive
- Free plan: max 3 total actions (Routes + Drops)
- Pro plan: unlimited Drops

---

### US-012: Edit Drop
**As an** owner  
**I want to** edit a Drop's label  
**So that** I can update it

**Acceptance Criteria:**
- Edit label via prompt
- Changes save immediately
- Can toggle active state

---

### US-013: Delete Drop
**As an** owner  
**I want to** delete a Drop  
**So that** I can remove it from my profile

**Acceptance Criteria:**
- Delete button with confirmation
- Drop removed from profile
- Related submissions remain in inbox (for history)

---

### US-014: View Submissions (Inbox)
**As an** owner  
**I want to** view all submissions in my Inbox  
**So that** I can see files and metadata visitors sent

**Acceptance Criteria:**
- Inbox shows all submissions across all Drops
- Each submission shows: name, email, note, files, timestamp
- Files are downloadable links
- Submissions sorted newest first

---

### US-015: Download Submitted Files
**As an** owner  
**I want to** download files from submissions  
**So that** I can access the files visitors uploaded

**Acceptance Criteria:**
- Each file in submission is a clickable link
- Opens file in new tab/download
- File path stored in Supabase Storage
- Files accessible via public URLs (or signed URLs for Pro)

---

### US-016: Drop Submission Counts (Analytics)
**As an** owner  
**I want to** see how many submissions each Drop received  
**So that** I know which Drop is most used

**Acceptance Criteria:**
- Analytics shows submission counts per Drop
- Counts displayed in Dashboard
- Can see which Drop label has most submissions

---

## 5. Public Visitor Actions

### US-017: View Public Profile
**As a** visitor  
**I want to** view someone's public profile at `/:slug`  
**So that** I can see their Routes and Drops

**Acceptance Criteria:**
- Profile loads by slug
- Shows display name, bio, avatar
- Lists all active Routes and Drops
- Routes are clickable buttons
- Drops show submission forms

---

### US-018: Click Route
**As a** visitor  
**I want to** click a Route button  
**So that** I can navigate to the destination URL

**Acceptance Criteria:**
- Route button links to URL
- Opens in new tab
- Click tracked in analytics (async, non-blocking)

---

### US-019: Submit Files via Drop
**As a** visitor  
**I want to** submit files via a Drop  
**So that** I can send files to the profile owner

**Acceptance Criteria:**
- Can upload files (multiple allowed)
- Optional name, email, note fields
- File size validated against Drop's `max_file_size_mb`
- Files uploaded to Supabase Storage
- Success message shown on submit
- Form resets after submission

---

### US-020: View Profile via Custom Domain
**As a** visitor  
**I want to** access a profile via custom domain  
**So that** it looks branded (e.g., `meet.igor.ms`)

**Acceptance Criteria:**
- Custom domain resolves to profile
- Domain verified via Vercel
- Profile loads correctly
- Footer hidden for Pro users

---

## 6. Billing & Plans

### US-021: View Current Plan
**As an** owner  
**I want to** see my current plan (Free/Pro)  
**So that** I know what features I have access to

**Acceptance Criteria:**
- Dashboard header shows plan badge
- Plan status displayed (Free/Pro)
- Limits shown based on plan

---

### US-022: Upgrade to Pro
**As an** owner on free plan  
**I want to** upgrade to Pro  
**So that** I can unlock unlimited actions and features

**Acceptance Criteria:**
- Upgrade button visible on free plan
- Redirects to Stripe Checkout
- On successful payment, plan updated to Pro
- Features unlock immediately

---

### US-023: Manage Billing
**As a** Pro subscriber  
**I want to** manage my subscription  
**So that** I can update payment or cancel

**Acceptance Criteria:**
- "Manage billing" button for Pro users
- Opens Stripe Customer Portal
- Can update payment method, view invoices, cancel

---

### US-024: Plan Limits Enforcement
**As an** owner on free plan  
**I want to** see when I hit plan limits  
**So that** I know I need to upgrade

**Acceptance Criteria:**
- Can only create 3 total actions (Routes + Drops)
- Warning shown when limit reached
- Upgrade prompt displayed

---

## 7. Custom Domains

### US-025: Add Custom Domain
**As a** Pro subscriber  
**I want to** add a custom domain  
**So that** my profile looks branded

**Acceptance Criteria:**
- Can add domain in Dashboard
- Instructions shown (DNS CNAME setup)
- Domain verification via Vercel API
- Status shown (verified/unverified)

---

### US-026: Domain Verification
**As a** Pro subscriber  
**I want to** verify my custom domain  
**So that** it works correctly

**Acceptance Criteria:**
- Domain verified via cron job (domain-verify function)
- Checks Vercel DNS configuration
- Marked verified when ready
- Retries on failure

---

## 8. Analytics

### US-027: View Route Analytics
**As an** owner  
**I want to** see analytics for my Routes  
**So that** I know which links get clicks

**Acceptance Criteria:**
- Analytics card shows click counts
- Grouped by Route label
- Can filter by time period
- Shows total clicks

---

### US-028: View Drop Analytics
**As an** owner  
**I want to** see analytics for my Drops  
**So that** I know which Drop gets most submissions

**Acceptance Criteria:**
- Submission counts per Drop
- Drop label shown
- Counts displayed in Dashboard

---

## 9. Settings & Preferences

### US-029: Change Theme
**As a** user  
**I want to** change the theme (light/dark/system)  
**So that** the app matches my preference

**Acceptance Criteria:**
- Settings modal accessible from header
- Theme dropdown with Light/Dark/System
- Theme persists in localStorage
- App updates immediately

---

### US-030: Change Language
**As a** user  
**I want to** change the interface language  
**So that** I can use the app in my preferred language

**Acceptance Criteria:**
- Language dropdown in Settings modal
- 10 languages available (en, fr, es, pt, pt-BR, ja, zh, de, it, ru)
- Language persists in localStorage
- Auto-detects browser language on first visit
- All UI text translated

---

### US-031: Access Settings
**As a** user  
**I want to** access settings from any page  
**So that** I can change preferences easily

**Acceptance Criteria:**
- Settings icon in header (gear icon)
- Present on all pages
- Opens modal with theme and language options
- Modal closes on Escape, backdrop click, or X button

---

## 10. Security & Data

### US-032: Data Privacy
**As an** owner  
**I want to** know my data is secure  
**So that** I trust the platform

**Acceptance Criteria:**
- RLS policies enforce data access
- Only owners can read their submissions
- Public can only insert submissions (write-only)
- Stripe handles payment data securely

---

### US-033: File Retention
**As an** owner  
**I want to** know files are retained based on my plan  
**So that** I understand data lifecycle

**Acceptance Criteria:**
- Free: 7-day retention
- Starter: 30-day retention
- Pro: 90-day retention
- Cleanup job removes expired files (optional)

---

## 11. Error Handling

### US-034: Handle Profile Not Found
**As a** visitor  
**I want to** see an error if profile slug doesn't exist  
**So that** I know the link is invalid

**Acceptance Criteria:**
- 404 message shown
- Clear error state
- Option to go home

---

### US-035: Handle Upload Errors
**As a** visitor submitting files  
**I want to** see an error if upload fails  
**So that** I know to try again

**Acceptance Criteria:**
- Error message on upload failure
- File size validation before upload
- Network errors handled gracefully

---

## Implementation Status

### ✅ Completed
- US-001: Sign In / Sign Up
- US-002: View Landing Page
- US-003: Create Profile
- US-004: Edit Profile
- US-005: View My Profile (Public)
- US-006: Add Route
- US-007: Edit Route
- US-008: Delete Route
- US-009: Reorder Routes
- US-011: Create Drop
- US-012: Edit Drop
- US-013: Delete Drop
- US-014: View Submissions (Inbox)
- US-015: Download Submitted Files
- US-017: View Public Profile
- US-018: Click Route
- US-019: Submit Files via Drop
- US-021: View Current Plan
- US-022: Upgrade to Pro
- US-023: Manage Billing
- US-029: Change Theme
- US-030: Change Language
- US-031: Access Settings

### 🚧 In Progress
- US-010: Route Click Tracking (backend done, UI wiring needed)
- US-016: Drop Submission Counts (backend done, UI wiring needed)

### 📋 Planned
- US-020: View Profile via Custom Domain (backend ready, UI needed)
- US-024: Plan Limits Enforcement (validation logic needed)
- US-025: Add Custom Domain (UI needed)
- US-026: Domain Verification (cron job needed)
- US-027: View Route Analytics (RPC exists, UI needed)
- US-028: View Drop Analytics (RPC exists, UI needed)
- US-032: Data Privacy (RLS in place, documentation needed)
- US-033: File Retention (cleanup job optional)
- US-034: Handle Profile Not Found (error state needed)
- US-035: Handle Upload Errors (error handling needed)

---

## Notes
- Free plan limit: 3 total actions (Routes + Drops combined)
- Pro plan: unlimited actions, custom domain, analytics, longer retention
- All plans support theme and language preferences
- File uploads go to Supabase Storage bucket `drops`
- Stripe handles all billing operations

