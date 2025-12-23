# Cross-Browser & Device Testing Checklist

This checklist ensures the landing page works correctly across all major browsers and devices.

## Desktop Browsers

### Chrome (Desktop)

- [ ] Homepage loads correctly
- [ ] All sections render properly
- [ ] Navigation works (Header links)
- [ ] CTAs work (Sign up buttons)
- [ ] Theme toggle works (dark/light mode)
- [ ] Language toggle works
- [ ] Scroll animations work
- [ ] Responsive breakpoints work
- [ ] Forms work (if any)
- [ ] Links work (internal and external)
- [ ] Images/assets load
- [ ] Console has no errors

### Firefox (Desktop)

- [ ] Homepage loads correctly
- [ ] All sections render properly
- [ ] Navigation works
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Scroll animations work
- [ ] Responsive breakpoints work
- [ ] Console has no errors

### Safari (Desktop)

- [ ] Homepage loads correctly
- [ ] All sections render properly
- [ ] Navigation works
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Scroll animations work
- [ ] Responsive breakpoints work
- [ ] Console has no errors

### Edge (Desktop)

- [ ] Homepage loads correctly
- [ ] All sections render properly
- [ ] Navigation works
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Console has no errors

## Mobile Browsers

### Chrome (Android)

- [ ] Homepage loads correctly
- [ ] Touch targets are large enough (min 44x44px)
- [ ] Navigation works (mobile menu if applicable)
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Scroll animations work
- [ ] Text is readable (no zoom required)
- [ ] Forms are usable
- [ ] Links work
- [ ] Console has no errors

### Safari iOS (iPhone)

- [ ] Homepage loads correctly
- [ ] Touch targets are large enough
- [ ] Navigation works
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Scroll animations work
- [ ] Text is readable
- [ ] Forms are usable
- [ ] Safe area respected (notch/status bar)
- [ ] Console has no errors

### Safari iOS (iPad)

- [ ] Homepage loads correctly
- [ ] Tablet layout works correctly
- [ ] Navigation works
- [ ] CTAs work
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Console has no errors

## Screen Sizes

### Mobile (< 768px)

- [ ] Layout stacks vertically
- [ ] Text is readable
- [ ] Images scale correctly
- [ ] Navigation is mobile-friendly
- [ ] CTAs are easily tappable
- [ ] Forms are usable
- [ ] No horizontal scrolling

### Tablet (768px - 1024px)

- [ ] Layout adapts correctly
- [ ] 2-column layouts work
- [ ] Navigation works
- [ ] CTAs work
- [ ] Text is readable

### Desktop (> 1024px)

- [ ] Full-width layouts work
- [ ] Multi-column layouts work
- [ ] Navigation works
- [ ] CTAs work
- [ ] Hover states work

### Large Desktop (> 1920px)

- [ ] Content doesn't stretch too wide
- [ ] Max-width containers work
- [ ] Layout remains centered

## Feature Testing

### Navigation

- [ ] Header links work
- [ ] Footer links work
- [ ] Internal routing works
- [ ] External links open in new tab
- [ ] Active states work
- [ ] Mobile menu works (if applicable)

### CTAs (Call-to-Actions)

- [ ] "Get Started Free" buttons work
- [ ] "View Demo" button scrolls to demo section
- [ ] "Upgrade to Pro" buttons work
- [ ] All CTAs redirect correctly
- [ ] Analytics tracking fires (check PostHog)

### Theme Toggle

- [ ] Dark mode applies correctly
- [ ] Light mode applies correctly
- [ ] System preference detection works
- [ ] Theme persists on page reload
- [ ] All components respect theme

### Language Toggle

- [ ] Language switching works
- [ ] All text translates
- [ ] Language persists on page reload
- [ ] Browser language detection works

### Scroll Animations

- [ ] Sections fade in on scroll
- [ ] Animations are smooth
- [ ] No jank or lag
- [ ] Works on mobile (touch scroll)

### Forms (if any)

- [ ] Inputs are accessible
- [ ] Labels are associated
- [ ] Validation works
- [ ] Error messages display
- [ ] Submit works

## Performance Testing

### Lighthouse Scores

Run Lighthouse audit and verify:

- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Page Load

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Total Blocking Time < 200ms

### Network Conditions

Test on:

- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline (error handling)

## Accessibility Testing

### Keyboard Navigation

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Skip links work (if implemented)

### Screen Readers

- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] All images have alt text
- [ ] Form labels are announced
- [ ] ARIA labels are correct

### Color Contrast

- [ ] Text meets WCAG AA standards (4.5:1)
- [ ] Large text meets WCAG AA standards (3:1)
- [ ] Interactive elements have sufficient contrast
- [ ] Test with color blindness simulators

## Analytics Testing

### PostHog Events

Verify these events fire correctly:

- [ ] `sign_up_button_clicked` (from hero, CTA section, pricing)
- [ ] `pricing_page_viewed`
- [ ] `cta_clicked` (view demo, upgrade)
- [ ] `scroll_depth` (25%, 50%, 75%, 100%)
- [ ] Page views tracked automatically

### Event Properties

Check that events include:

- [ ] `source` or `location` property
- [ ] `page` property (current pathname)
- [ ] `cta_type` property (for CTA clicks)
- [ ] `depth` property (for scroll depth)

## SEO Testing

### Meta Tags

- [ ] Title tags are unique per page
- [ ] Meta descriptions are present
- [ ] Open Graph tags are present
- [ ] Twitter Card tags are present
- [ ] Canonical URLs are set

### Structured Data

- [ ] Test with Google Rich Results Test
- [ ] No errors in structured data

### Sitemap

- [ ] `sitemap.xml` is accessible
- [ ] All pages are included
- [ ] Lastmod dates are current

### Robots.txt

- [ ] `robots.txt` is accessible
- [ ] Sitemap is referenced
- [ ] No blocking rules (unless intentional)

## Cross-Domain Testing

### App Redirects

- [ ] `/auth` redirects to `app.getonelink.io/auth`
- [ ] Redirect happens immediately
- [ ] Loading state displays (if implemented)

### External Links

- [ ] All external links open in new tab
- [ ] `rel="noopener noreferrer"` is set
- [ ] Links are correct

## Known Issues

Document any issues found during testing:

| Issue | Browser/Device | Description | Status |
| ----- | -------------- | ----------- | ------ |
|       |                |             |        |

## Testing Tools

- **BrowserStack** - Cross-browser testing
- **Lighthouse** - Performance and SEO
- **WAVE** - Accessibility testing
- **PostHog** - Analytics verification
- **Google Search Console** - SEO testing
- **Facebook Sharing Debugger** - Open Graph testing
- **Twitter Card Validator** - Twitter Card testing

## Notes

- Test on real devices when possible (not just browser dev tools)
- Test with different network speeds
- Test with browser extensions disabled
- Test in incognito/private mode
- Test with ad blockers enabled/disabled
