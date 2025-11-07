# UI Implementation Plan: Profile Link & Legal Pages

## Overview
This plan covers UI-only implementation for:
1. Profile Link Card in Account Tab
2. Privacy Policy Page
3. Terms of Service Page

---

## 1. Profile Link Card in Account Tab

### Purpose
Display the user's public profile URL in the Account tab so they can easily copy, preview, and share their profile link.

### Components to Create/Modify

#### New Component: `ProfileLinkCard.tsx`
**Location:** `apps/web/src/routes/Dashboard/components/ProfileLinkCard.tsx`

**Features:**
- Display profile URL: `https://onelink.app/{slug}`
- Copy to clipboard button (with success feedback)
- Preview button (opens profile in new tab)
- QR code button (placeholder for now - "Coming soon")
- Responsive design (mobile-friendly)
- Dark mode support

**UI Design:**
```
┌─────────────────────────────────────┐
│ Your Profile Link                   │
│ Share this link to let people      │
│ access your profile                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ https://onelink.app/username   │ │
│ │                        [Copy]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Copy] [Preview] [QR Code]         │
└─────────────────────────────────────┘
```

**Props:**
```typescript
interface ProfileLinkCardProps {
  slug: string | null;
}
```

**Dependencies:**
- `lucide-react` icons (Copy, ExternalLink, QrCode)
- `sonner` for toast notifications
- `useTranslation` for i18n

#### Modify: `AccountTab.tsx`
**Changes:**
- Import `ProfileLinkCard`
- Add `<ProfileLinkCard slug={profileFormInitial?.slug ?? null} />` at the top of the component
- Position: Above the Profile Editor section

#### Modify: `components/index.ts`
**Changes:**
- Export `ProfileLinkCard`

### Translation Keys Needed
Add to all 10 language files (`apps/web/src/lib/locales/*.json`):

```json
{
  "dashboard_account_profile_link_title": "Your Profile Link",
  "dashboard_account_profile_link_description": "Share this link to let people access your profile",
  "dashboard_account_profile_link_copy": "Copy",
  "dashboard_account_profile_link_preview": "Preview",
  "dashboard_account_profile_link_qr": "QR Code",
  "dashboard_account_profile_link_copied": "Link copied to clipboard!",
  "dashboard_account_profile_link_copy_failed": "Failed to copy link",
  "dashboard_account_profile_qr_coming_soon": "QR code feature coming soon"
}
```

### Implementation Steps
1. ✅ Create `ProfileLinkCard.tsx` component
2. ✅ Add to `AccountTab.tsx`
3. ✅ Export from `components/index.ts`
4. ⏳ Add translation keys to all 10 languages
5. ⏳ Test copy functionality
6. ⏳ Test preview functionality
7. ⏳ Test responsive design
8. ⏳ Test dark mode

---

## 2. Privacy Policy Page

### Purpose
Legal requirement - inform users about data collection, usage, and privacy practices.

### Components to Create

#### New Route: `Privacy.tsx`
**Location:** `apps/web/src/routes/Legal/Privacy.tsx`

**Features:**
- Full-page legal document
- Responsive design
- Dark mode support
- i18n support (can start with English only, add translations later)
- Simple, readable layout

**Content Sections:**
1. **Introduction** - What OneLink is
2. **Information We Collect** - Email, profile data, files, analytics
3. **How We Use Information** - Service delivery, improvements, support
4. **Data Storage** - Supabase, file retention policies
5. **Data Sharing** - Third-party services (Stripe, Supabase)
6. **Your Rights** - Access, deletion, export
7. **Cookies** - What cookies we use (if any)
8. **Security** - How we protect data
9. **Children's Privacy** - Age restrictions
10. **Changes to Privacy Policy** - How we notify users
11. **Contact** - How to reach us

**UI Design:**
```
┌─────────────────────────────────────┐
│ ← Back to Home                      │
│                                     │
│ Privacy Policy                      │
│ Last updated: [Date]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │ 1. Introduction                │ │
│ │    OneLink is a service...     │ │
│ │                                 │ │
│ │ 2. Information We Collect      │ │
│ │    ...                          │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Questions? Contact us at...         │
└─────────────────────────────────────┘
```

**Props:** None (static page)

#### Modify: `main.tsx`
**Changes:**
- Add route: `{ path: "/privacy", element: <Privacy /> }`

### Content Generation
- Use AI-generated template (can refine later)
- Include placeholders for:
  - Company name/contact
  - Data retention periods
  - Third-party services
- Make it GDPR-compliant structure

### Implementation Steps
1. ⏳ Create `routes/Legal/Privacy.tsx`
2. ⏳ Generate privacy policy content
3. ⏳ Add route to `main.tsx`
4. ⏳ Style with Tailwind (match app design)
5. ⏳ Add "Back" button or link to home
6. ⏳ Test responsive design
7. ⏳ Test dark mode

---

## 3. Terms of Service Page

### Purpose
Legal requirement - define terms and conditions for using OneLink.

### Components to Create

#### New Route: `Terms.tsx`
**Location:** `apps/web/src/routes/Legal/Terms.tsx`

**Features:**
- Full-page legal document
- Responsive design
- Dark mode support
- i18n support (can start with English only)
- Simple, readable layout

**Content Sections:**
1. **Acceptance of Terms** - By using OneLink, you agree...
2. **Description of Service** - What OneLink provides
3. **User Accounts** - Account creation, responsibility
4. **Acceptable Use** - What users can/cannot do
5. **Content Ownership** - Who owns uploaded content
6. **Payment Terms** - Subscription, billing, refunds
7. **Limitations** - Service limits, availability
8. **Termination** - How accounts can be terminated
9. **Disclaimers** - Service provided "as is"
10. **Limitation of Liability** - Legal protections
11. **Governing Law** - Which laws apply
12. **Changes to Terms** - How we update terms
13. **Contact** - How to reach us

**UI Design:** Same as Privacy Policy

**Props:** None (static page)

#### Modify: `main.tsx`
**Changes:**
- Add route: `{ path: "/terms", element: <Terms /> }`

### Content Generation
- Use AI-generated template
- Include placeholders for:
  - Company name/contact
  - Jurisdiction
  - Refund policy
  - Service limits

### Implementation Steps
1. ⏳ Create `routes/Legal/Terms.tsx`
2. ⏳ Generate terms of service content
3. ⏳ Add route to `main.tsx`
4. ⏳ Style with Tailwind (match app design)
5. ⏳ Add "Back" button or link to home
6. ⏳ Test responsive design
7. ⏳ Test dark mode

---

## 4. Footer Component (Optional Enhancement)

### Purpose
Add footer links to Privacy and Terms pages across the app.

### Components to Create/Modify

#### New Component: `Footer.tsx`
**Location:** `apps/web/src/components/Footer.tsx`

**Features:**
- Links to Privacy and Terms
- Copyright notice
- "Powered by OneLink" (for free plans on public profiles)
- Responsive design
- Dark mode support

**UI Design:**
```
┌─────────────────────────────────────┐
│                                     │
│ Privacy Policy | Terms of Service  │
│                                     │
│ © 2024 OneLink. All rights reserved │
└─────────────────────────────────────┘
```

**Usage:**
- Add to `/auth` page (landing page)
- Add to public profile pages (if not Pro)
- Optional: Add to dashboard footer

### Implementation Steps
1. ⏳ Create `Footer.tsx` component
2. ⏳ Add to `/auth` page
3. ⏳ Add to public profile pages (conditional on plan)
4. ⏳ Add translation keys
5. ⏳ Test responsive design

---

## 5. Shared Legal Page Layout

### Purpose
Create a reusable layout component for legal pages to ensure consistency.

### Components to Create

#### New Component: `LegalPageLayout.tsx`
**Location:** `apps/web/src/components/LegalPageLayout.tsx`

**Features:**
- Consistent header with "Back" button
- Max-width container
- Typography styling
- Dark mode support

**Props:**
```typescript
interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<LegalPageLayout title="Privacy Policy" lastUpdated="2024-01-15">
  {/* Content */}
</LegalPageLayout>
```

### Implementation Steps
1. ⏳ Create `LegalPageLayout.tsx`
2. ⏳ Use in `Privacy.tsx`
3. ⏳ Use in `Terms.tsx`
4. ⏳ Test responsive design

---

## Implementation Order

### Phase 1: Profile Link Card (Quick Win)
1. ✅ Create `ProfileLinkCard.tsx`
2. ✅ Add to `AccountTab.tsx`
3. ✅ Export from `components/index.ts`
4. ⏳ Add translations
5. ⏳ Test

**Estimated Time:** 30 minutes

### Phase 2: Legal Pages Structure
1. ⏳ Create `LegalPageLayout.tsx`
2. ⏳ Create `routes/Legal/` directory
3. ⏳ Add routes to `main.tsx`
4. ⏳ Test routing

**Estimated Time:** 15 minutes

### Phase 3: Privacy Policy
1. ⏳ Generate privacy policy content
2. ⏳ Create `Privacy.tsx` with content
3. ⏳ Style and test

**Estimated Time:** 45 minutes

### Phase 4: Terms of Service
1. ⏳ Generate terms of service content
2. ⏳ Create `Terms.tsx` with content
3. ⏳ Style and test

**Estimated Time:** 45 minutes

### Phase 5: Footer (Optional)
1. ⏳ Create `Footer.tsx`
2. ⏳ Add to pages
3. ⏳ Test

**Estimated Time:** 20 minutes

---

## Total Estimated Time
- **Phase 1:** 30 minutes
- **Phase 2:** 15 minutes
- **Phase 3:** 45 minutes
- **Phase 4:** 45 minutes
- **Phase 5:** 20 minutes (optional)
- **Total:** ~2.5 hours (without Phase 5)

---

## Testing Checklist

### Profile Link Card
- [ ] Copy button works
- [ ] Preview button opens profile in new tab
- [ ] QR code button shows "coming soon" message
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Translations work

### Privacy Policy
- [ ] Page loads at `/privacy`
- [ ] Content is readable
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Back button works

### Terms of Service
- [ ] Page loads at `/terms`
- [ ] Content is readable
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Back button works

### Footer (if implemented)
- [ ] Links work
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Shows on correct pages

---

## Notes

1. **Legal Content:** Generated content should be reviewed by a lawyer before production. This is a template.
2. **i18n:** Legal pages can start English-only. Translations can be added later.
3. **QR Code:** QR code feature can be implemented later using a library like `qrcode.react`.
4. **Footer:** Optional enhancement - can be added later if needed.
5. **Design Consistency:** All new pages should match existing app design (purple accents, light purple cards, etc.)

---

## Files Summary

### New Files to Create
- `apps/web/src/routes/Dashboard/components/ProfileLinkCard.tsx` ✅
- `apps/web/src/routes/Legal/Privacy.tsx`
- `apps/web/src/routes/Legal/Terms.tsx`
- `apps/web/src/components/LegalPageLayout.tsx` (optional)
- `apps/web/src/components/Footer.tsx` (optional)

### Files to Modify
- `apps/web/src/routes/Dashboard/components/AccountTab.tsx` ✅
- `apps/web/src/routes/Dashboard/components/index.ts` ✅
- `apps/web/src/main.tsx` (add routes)
- `apps/web/src/lib/locales/*.json` (add translations)

---

## Ready to Start?
Once you create the issue and branch, we can start with Phase 1 (Profile Link Card) since it's already partially done, then move to legal pages.

