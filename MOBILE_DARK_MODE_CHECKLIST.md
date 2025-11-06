# Mobile Dark Mode Checklist 🌙

## Components Modified in Phase 1

### ✅ Headers
- [x] `HeaderMobileSignIn.tsx` - Has dark mode classes
- [x] `HeaderMobileDashboard.tsx` - Has dark mode classes  
- [x] `DashboardHeader.tsx` - Has dark mode classes

### ✅ Navigation
- [x] `TabNavigation.tsx` - Check purple active state
- [x] `BottomNavigation.tsx` - Check purple active state and floating button

### ✅ Dashboard Sections
- [x] `InboxTab.tsx` - Gray cards, check icon contrast
- [x] `ContentTab.tsx` - Container
- [x] `AccountTab.tsx` - Cards and borders

### ✅ Routes/Links
- [x] `LinksSection.tsx` - Purple cards, check contrast
- [x] `LinksList.tsx` - Drag/drop cards
- [x] `NewLinkForm.tsx` - Input fields

### ✅ Drops
- [x] `DropsSection.tsx` - Container
- [x] `DropList.tsx` - Purple/red cards
- [x] `DropForm.tsx` - Input fields

### ✅ Analytics
- [x] `AnalyticsCard.tsx` - Toggle buttons, table
- [x] `SubmissionCountsCard.tsx` - Table

### ✅ Profile Editor
- [x] `ProfileEditor/index.tsx` - Button gradient
- [x] `ProfileFormFields.tsx` - Purple input backgrounds

### ✅ Auth & Landing
- [x] `Auth.tsx` - Background, inputs, button
- [x] `App.tsx` (Onboarding) - Check carousel

---

## Known Issues to Check

### 🔍 **1. Purple Cards Contrast**
**Components:** `LinksSection`, `DropList`, `ProfileFormFields`
- Light: `bg-purple-50`
- Dark: `bg-purple-900/20`
- **CHECK**: Is dark mode purple visible enough?

### 🔍 **2. Gray Toggle Buttons** 
**Components:** `AnalyticsCard`, `SubmissionCountsCard`
- Active: `bg-gray-900 dark:bg-gray-700`
- Inactive: `bg-gray-50 dark:bg-gray-800`
- **CHECK**: Is active state clear in dark mode?

### 🔍 **3. Background Gradient Blobs**
**Components:** `Dashboard/index.tsx`, `Auth.tsx`
- Uses `bg-purple-*/5` and `dark:bg-purple-*/5`
- **CHECK**: Are gradients visible but subtle in dark mode?

### 🔍 **4. Fixed Headers Overlap**
**Mobile only:**
- `HeaderMobileDashboard` - `fixed top-0`
- `DashboardHeader` - `fixed top-[73px]`
- **CHECK**: Do they stack correctly in dark mode?

### 🔍 **5. Floating Clear All Button**
**Component:** `BottomNavigation`
- Uses `bg-white dark:bg-gray-800`
- **CHECK**: Is it visible when scrolling in dark mode?

### 🔍 **6. Inbox Cards**
**Component:** `InboxTab`
- All gray: `bg-gray-50 dark:bg-gray-800`
- Icon: `bg-gray-900 dark:bg-gray-700`
- Purple dot: `bg-purple-600`
- **CHECK**: Is purple dot visible in dark mode?

---

## Testing Procedure

### **Step 1: Toggle to Dark Mode**
1. Open app on mobile viewport (375px)
2. Click theme toggle in header
3. Verify smooth transition

### **Step 2: Landing/Auth Pages**
- [ ] Background gradient blobs visible but subtle
- [ ] "OneLink" title readable (purple gradient)
- [ ] Input fields have proper contrast
- [ ] "Send link" button visible
- [ ] Theme/Language toggles work

### **Step 3: Onboarding Carousel**
- [ ] Carousel cards readable
- [ ] "Next" button visible
- [ ] Dots indicator visible
- [ ] Purple accents work

### **Step 4: Dashboard - Inbox Tab**
- [ ] Gray cards have good contrast
- [ ] Purple dots visible on first 2 items
- [ ] Icon backgrounds clear
- [ ] Text readable
- [ ] Floating "Clear all" button visible

### **Step 5: Dashboard - Content Tab**
- [ ] Purple route cards readable
- [ ] Purple drop cards readable  
- [ ] Light red delete button visible
- [ ] Purple "Add" form cards clear
- [ ] White main content background ok

### **Step 6: Dashboard - Account Tab**
- [ ] Profile editor inputs (purple bg) readable
- [ ] Analytics toggle buttons clear
- [ ] Gray table rows readable
- [ ] Card borders visible

### **Step 7: Bottom Navigation**
- [ ] Active tab purple is clear
- [ ] Inactive tabs gray is visible
- [ ] Purple dot on Inbox visible
- [ ] Border on top visible

### **Step 8: Headers**
- [ ] Both headers have good contrast
- [ ] Purple "OneLink" gradient readable
- [ ] Buttons visible
- [ ] Fixed positioning works

---

## Potential Fixes Needed

### **If Purple Cards Too Dark:**
Change from `dark:bg-purple-900/20` to `dark:bg-purple-900/30` or `dark:bg-purple-800/20`

### **If Gray Buttons Unclear:**
Increase contrast: `dark:bg-gray-600` for active

### **If Text Hard to Read:**
Check all `dark:text-gray-300` should be `dark:text-gray-200` or `dark:text-white`

### **If Borders Invisible:**
Check all `dark:border-gray-700` might need `dark:border-gray-600`

---

## Quick Fix Commands

If issues found, common patterns to search/replace:

```bash
# Increase purple card contrast
bg-purple-900/20 → bg-purple-900/30

# Lighten text
dark:text-gray-300 → dark:text-gray-200

# Visible borders
dark:border-gray-700 → dark:border-gray-600

# Clearer buttons
dark:bg-gray-700 → dark:bg-gray-600
```

---

## Status: NEEDS MANUAL TESTING 📱

Please test on mobile viewport with dark mode enabled and report any issues!

