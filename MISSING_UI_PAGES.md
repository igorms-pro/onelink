# Missing UI Pages & Features

## 🔴 Critical Missing Pages

### 1. **Upgrade to Pro / Stripe Checkout**
**Status:** Backend exists, UI missing
- **Current:** `goToCheckout()` redirects to Stripe Checkout (works)
- **Missing:** 
  - Loading state while redirecting
  - Error handling if checkout fails
  - Success/cancel callback pages (`/checkout/success`, `/checkout/cancel`)
  - Pricing page (`/pricing`) showing plan features comparison
  - Upgrade confirmation modal/page before redirect

**Files to create:**
- `apps/web/src/routes/Pricing.tsx` - Pricing comparison page
- `apps/web/src/routes/CheckoutSuccess.tsx` - Success page after payment
- `apps/web/src/routes/CheckoutCancel.tsx` - Cancel page
- `apps/web/src/components/UpgradeModal.tsx` - Confirmation modal before checkout

---

### 2. **Delete Account**
**Status:** Button exists, no functionality
- **Current:** Button in Settings modal (no action)
- **Missing:**
  - Confirmation page (`/account/delete`) with:
    - "Are you sure?" warning
    - Reason dropdown/textarea (why are you leaving?)
    - Checkbox: "I understand this action cannot be undone"
    - Final confirmation button
  - Backend API to delete account (cascade delete profile, links, drops, submissions)
  - Email notification to user
  - Success page after deletion

**Files to create:**
- `apps/web/src/routes/Account/DeleteAccount.tsx` - Delete confirmation page
- `apps/web/src/components/DeleteAccountModal.tsx` - Initial modal
- Backend: Supabase Edge Function or RPC to handle account deletion

---

### 3. **Change Password**
**Status:** Button exists, no functionality
- **Current:** Button in Settings modal (no action)
- **Missing:**
  - Password change form (`/account/password`)
  - Current password field
  - New password field (with strength indicator)
  - Confirm new password field
  - Supabase Auth password update integration
  - Success/error handling

**Files to create:**
- `apps/web/src/routes/Account/ChangePassword.tsx` - Password change page
- `apps/web/src/components/ChangePasswordModal.tsx` - Modal version

**Note:** Since we use magic links (passwordless), this might be less critical, but still needed for users who want to set a password.

---

### 4. **Two-Factor Authentication**
**Status:** Button exists, no functionality
- **Current:** Button in Settings modal (no action)
- **Missing:**
  - 2FA setup page (`/account/2fa`)
  - QR code generation (TOTP)
  - Backup codes display
  - Enable/disable toggle
  - Supabase Auth 2FA integration (if supported) or custom implementation

**Files to create:**
- `apps/web/src/routes/Account/TwoFactor.tsx` - 2FA setup page
- `apps/web/src/components/TwoFactorModal.tsx` - Modal version

**Question:** Do we need 2FA if we use magic links? Magic links are already secure. Consider removing this or making it optional for users who want extra security.

---

### 5. **Privacy Policy & Legal Pages**
**Status:** Completely missing
- **Missing:**
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)
  - Cookie Policy (`/cookies`) - if using cookies
  - GDPR compliance page (if EU users)
  - Footer links to these pages

**Files to create:**
- `apps/web/src/routes/Legal/Privacy.tsx`
- `apps/web/src/routes/Legal/Terms.tsx`
- `apps/web/src/routes/Legal/Cookies.tsx`
- `apps/web/src/components/Footer.tsx` - Footer component with legal links

**Content needed:** Legal text (can use templates or hire lawyer)

---

### 6. **Profile Link Display & Copy**
**Status:** Missing from dashboard
- **Current:** Profile exists, but no way to see/copy the link in dashboard
- **Missing:**
  - Profile URL display in Account tab
  - Copy to clipboard button
  - QR code generation for profile link
  - Share buttons (Twitter, LinkedIn, etc.)
  - Preview button (opens profile in new tab)

**Files to create:**
- `apps/web/src/routes/Dashboard/components/ProfileLinkCard.tsx` - Card showing profile URL
- Add to `AccountTab.tsx`

**Example UI:**
```
Your Profile Link
https://onelink.app/your-slug
[Copy] [QR Code] [Preview] [Share]
```

---

### 7. **Onboarding Improvements**
**Status:** Basic carousel exists
- **Current:** 4-slide carousel on `/`
- **Missing:**
  - Skip button (exists but could be better)
  - Progress indicator (dots exist, but could show "Step 1 of 4")
  - Analytics tracking (which slides users skip)
  - A/B testing support
  - Optional: Video demo instead of static slides

**Files to update:**
- `apps/web/src/components/OnboardingCarousel.tsx` - Add progress text, analytics

---

## 🟡 Nice-to-Have Missing Pages

### 8. **404 / Not Found Page**
**Status:** Basic error state exists
- **Current:** `ErrorState` component shows error
- **Missing:**
  - Custom 404 page (`/404` or catch-all route)
  - "Profile not found" specific page
  - Search suggestions
  - Link back to home

**Files to create:**
- `apps/web/src/routes/NotFound.tsx` - 404 page
- Update `ErrorState.tsx` to be more user-friendly

---

### 9. **Help / Support / FAQ**
**Status:** Missing
- **Missing:**
  - FAQ page (`/help` or `/faq`)
  - Contact support form
  - Documentation links
  - Video tutorials
  - Search functionality

**Files to create:**
- `apps/web/src/routes/Help.tsx` - FAQ page
- `apps/web/src/routes/Support.tsx` - Contact form

---

### 10. **Email Verification**
**Status:** Unknown
- **Missing:**
  - Email verification page (`/verify-email`)
  - Resend verification email button
  - Success page after verification

**Files to create:**
- `apps/web/src/routes/VerifyEmail.tsx`
- Check if Supabase handles this automatically

---

### 11. **Password Reset**
**Status:** Unknown (if passwordless, might not be needed)
- **Missing:**
  - Forgot password page (`/reset-password`)
  - Reset password form
  - Success page

**Files to create:**
- `apps/web/src/routes/ResetPassword.tsx` (if needed)

---

### 12. **Billing History / Invoices**
**Status:** Stripe Portal handles this
- **Current:** "Manage billing" opens Stripe Portal
- **Missing:**
  - In-app invoice list (optional - Stripe Portal might be enough)
  - Download invoice button
  - Payment method display

**Files to create (optional):**
- `apps/web/src/routes/Billing/History.tsx` - Invoice list
- `apps/web/src/routes/Billing/PaymentMethod.tsx` - Payment method management

---

## 📋 Summary Checklist

### Critical (Must Have)
- [ ] Upgrade to Pro / Stripe Checkout pages
- [ ] Delete Account confirmation page
- [ ] Change Password page
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Profile Link display in Account tab

### Important (Should Have)
- [ ] Two-Factor Authentication page (or remove if not needed)
- [ ] Cookie Policy page
- [ ] 404 / Not Found page improvements
- [ ] Onboarding improvements (progress, analytics)

### Nice-to-Have
- [ ] Help / FAQ page
- [ ] Support / Contact page
- [ ] Email Verification page
- [ ] Billing History page (optional - Stripe Portal might be enough)

---

## 🎨 Design Considerations

1. **Consistency:** All new pages should match existing design system (purple gradients, light purple cards, etc.)
2. **Mobile-first:** All pages must be mobile responsive
3. **Dark mode:** All pages must support dark theme
4. **i18n:** All new pages must have translations in all 10 languages
5. **Accessibility:** ARIA labels, keyboard navigation, screen reader support

---

## 🔧 Technical Notes

1. **Stripe Integration:** Already working via Edge Functions, just need UI
2. **Account Deletion:** Need to create Supabase Edge Function or RPC to handle cascade deletion
3. **Password Change:** Use Supabase Auth `updateUser()` method
4. **2FA:** Check if Supabase Auth supports TOTP, or use library like `otplib`
5. **Legal Pages:** Can use markdown files with React Markdown, or static HTML

---

## 📝 Next Steps

1. **Priority 1:** Create Delete Account page (high user impact)
2. **Priority 2:** Create Privacy Policy & Terms pages (legal requirement)
3. **Priority 3:** Create Upgrade/Checkout pages (revenue impact)
4. **Priority 4:** Add Profile Link display to Account tab (UX improvement)
5. **Priority 5:** Create Change Password page (if needed)
6. **Priority 6:** Evaluate if 2FA is needed (might remove if passwordless)

