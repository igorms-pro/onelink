# UI Validation Checklist - Light Theme Mobile

## Reference Screenshot

![Mobile UI Screenshots - Light Theme](./screenshots/mobile-light-theme-ui.png)

*Note: Screenshot shows 5 mobile views: Landing Page, Dashboard Inbox, Dashboard Content, Dashboard Account, and Settings Modal*

## Screenshot Analysis

### ✅ **CORRECTLY IMPLEMENTED:**

1. **Landing & Sign-in Page:**
   - ✅ White header with "OneLink" logo on left
   - ✅ Theme, language, and settings icons on right
   - ✅ Purple branding "OneLink" centered
   - ✅ Tagline "Share a single link. Route by intent."
   - ✅ Purple "Sign in" button
   - ✅ Footer with copyright

2. **Dashboard Content Tab:**
   - ✅ "Dashboard" title and "FREE" badge on same line
   - ✅ "Upgrade" button on right
   - ✅ Three-dot menu for links (no border)
   - ✅ Link URLs on new line, full width
   - ✅ Drops with vertical stacking (flex-col on mobile)
   - ✅ "Order {order} · {status}" format

3. **Link Cards:**
   - ✅ Three-dot menu aligned with card title
   - ✅ Spacing between title and URL
   - ✅ URL takes full card width
   - ✅ No border on three-dot button

### ❌ **ISSUES FOUND IN SCREENSHOT:**

1. **Tab Navigation:**
   - ❌ Tabs are LEFT-ALIGNED (should be CENTERED on mobile)
   - ❌ Both top tabs AND bottom navigation are left-aligned
   - **Status:** We added `justify-center sm:justify-start` but screenshot shows left-aligned

2. **Dashboard Account Tab:**
   - ❌ "Sign out" button is VISIBLE in header (should be hidden on mobile)
   - ❌ Should only appear in Settings modal drawer
   - **Status:** We added `hidden sm:inline-flex` but screenshot shows it visible

3. **Settings Modal:**
   - ❌ No "Sign out" button visible in modal
   - **Status:** We added it but screenshot doesn't show it

### 📋 **PHASE 1: LIGHT THEME - MOBILE UI POLISH**

#### Priority 1: Fix Current Issues
- [ ] Verify tab navigation is centered on mobile (check responsive breakpoints)
- [ ] Verify "Sign out" button is hidden on mobile header
- [ ] Verify "Sign out" button appears in Settings modal drawer on mobile
- [ ] Test all mobile breakpoints (< 640px)

#### Priority 2: Visual Polish (Light Theme Mobile)
- [ ] Landing page: Purple branding color consistency
- [ ] Button styles: Consistent purple/dark grey buttons
- [ ] Card shadows: Subtle shadows on cards
- [ ] Spacing: Consistent padding and margins
- [ ] Typography: Font sizes and weights
- [ ] Form inputs: Border styles and focus states
- [ ] Badge styles: "FREE" badge gradient consistency
- [ ] Bottom navigation: If exists, ensure proper styling

#### Priority 3: Component Refinements
- [ ] Link cards: Hover states, transitions
- [ ] Drop cards: Button alignment and spacing
- [ ] Tab navigation: Active state indicators
- [ ] Modal: Overlay opacity, animation
- [ ] Icons: Consistent sizing and spacing

### 📋 **PHASE 2: DESKTOP RESPONSIVE DESIGN**
- [ ] Desktop layout (> 768px)
- [ ] Tablet layout (640px - 768px)
- [ ] Responsive grid systems
- [ ] Desktop-specific components

### 📋 **PHASE 3: DARK THEME POLISH**
- [ ] Dark theme color consistency
- [ ] Contrast ratios
- [ ] Dark theme component styles
- [ ] Dark theme modal and overlays

---

## Current Implementation Status

### What We've Done:
1. ✅ Three-dot menu for links
2. ✅ Link card layout (title/URL spacing)
3. ✅ Drops flex-col on mobile
4. ✅ Tab navigation centered (code added)
5. ✅ Sign out hidden on mobile (code added)
6. ✅ Sign out in Settings modal (code added)

### What Needs Verification:
1. ⚠️ Tab navigation centering (screenshot shows left-aligned)
2. ⚠️ Sign out button visibility (screenshot shows it in Account tab header)
3. ⚠️ Settings modal sign out (screenshot doesn't show it)

