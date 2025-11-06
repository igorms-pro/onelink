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

---

## Notes
- Focus on UX polish first (mobile → desktop → dark theme)
- Then implement drop system redesign
- Maintain backward compatibility
- Keep user experience simple and intuitive
