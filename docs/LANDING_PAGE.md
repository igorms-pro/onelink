# Landing Page - Site Vitrine

**Status:** 🔴 Not Started  
**Priority:** High (MVP Launch)  
**Estimated Time:** 8-12 hours  
**Domain:** `getonelink.io`

---

## 📋 Vue d'Ensemble

Créer un site vitrine professionnel pour présenter OneLink, convertir les visiteurs en utilisateurs, et servir de point d'entrée principal avant l'application.

**Architecture:**
```
getonelink.io          → Landing page (site vitrine)
getonelink.io/auth     → Sign in / Sign up (ou redirect vers app)
app.getonelink.io      → Application (dashboard, settings, etc.)
```

---

## 🎯 Objectifs

1. **Conversion:** Convertir les visiteurs en utilisateurs (sign up)
2. **SEO:** Optimiser pour les recherches Google
3. **Branding:** Présenter OneLink de manière professionnelle
4. **Trust:** Construire la confiance (testimonials, features, pricing)
5. **Navigation:** Guider vers l'application (`app.getonelink.io`)

---

## 🏗️ System Design

### Architecture Technique

**Option 1: Projet Vercel séparé (Recommandé)**
- **Projet:** `onelink-landing` (Next.js pour SEO)
- **Domaine:** `getonelink.io`
- **Déploiement:** Vercel
- **Stack:** Next.js 14+ (App Router) + React + Tailwind CSS

**Option 2: Route dans app actuelle**
- **Route:** `/` dans app actuelle
- **Domaine:** `getonelink.io`
- **Stack:** Vite + React + Tailwind CSS (actuel)

**Recommandation:** Option 1 (Next.js) pour meilleur SEO et performance.

### Structure des Routes

```
getonelink.io/
  ├─ /                    → Hero, Features, Pricing, CTA
  ├─ /features             → Features détaillées
  ├─ /pricing              → Pricing page (peut être / aussi)
  ├─ /about                → About us (optionnel)
  ├─ /blog                 → Blog (optionnel, futur)
  ├─ /docs                 → Documentation (optionnel, futur)
  ├─ /auth                 → Sign in / Sign up (ou redirect vers app.getonelink.io/auth)
  └─ /privacy              → Privacy Policy (déjà créé)
  └─ /terms                → Terms of Service (déjà créé)
```

### DNS Configuration

**Hostinger DNS:**
```
Type    Name    Value                    TTL
A       @       (IP Vercel)              Auto
CNAME   www     cname.vercel-dns.com     Auto
CNAME   app     cname.vercel-dns.com     Auto
```

**Vercel Domains:**
- `getonelink.io`
- `www.getonelink.io`

---

## 📐 Design & Sections

### 1. Hero Section
**Objectif:** Capturer l'attention, expliquer la valeur en 10 secondes

**Contenu:**
- **Headline:** "One Link to Share Everything"
- **Subheadline:** "Share your links, files, and drops with one simple link. No more messy bios or multiple links."
- **CTA Primary:** "Get Started Free" → `/auth` ou `app.getonelink.io/auth`
- **CTA Secondary:** "View Demo" → Scroll to demo section
- **Visual:** Screenshot/GIF de l'app en action, ou illustration moderne

**Design:**
- Gradient purple background (cohérent avec app)
- Centered layout
- Large, bold typography
- Mobile-first responsive

---

### 2. Features Section
**Objectif:** Expliquer les fonctionnalités principales

**Features à mettre en avant:**
1. **One Link for Everything**
   - Un seul lien pour partager tout
   - Bio link moderne
   - Icon: Link icon

2. **File Sharing (Drops)**
   - Partage de fichiers facile
   - Upload multiple
   - Public/Private
   - Icon: Upload/Cloud icon

3. **Real-time Notifications**
   - Notifications en temps réel
   - Emails automatiques
   - Badge de comptage
   - Icon: Bell icon

4. **Customizable Profile**
   - Profil personnalisable
   - Thème dark/light
   - Analytics intégrés
   - Icon: User/Profile icon

5. **Privacy & Security**
   - Contrôle total
   - Drops privés/publics
   - 2FA disponible
   - Icon: Lock icon

6. **Analytics**
   - Stats en temps réel
   - Clics, vues, downloads
   - Insights détaillés
   - Icon: Chart icon

**Layout:**
- Grid 3x2 (desktop) ou 1x6 (mobile)
- Card design avec icon, title, description
- Hover effects
- Purple accents cohérents

---

### 3. How It Works
**Objectif:** Expliquer le processus en 3-4 étapes simples

**Steps:**
1. **Sign Up** → Create account (free)
2. **Create Your Link** → Add links, upload files
3. **Share** → One link to share everywhere
4. **Track** → See analytics in real-time

**Design:**
- Horizontal timeline (desktop)
- Vertical timeline (mobile)
- Numbered steps
- Icons/illustrations

---

### 4. Pricing Section
**Objectif:** Présenter les plans et convertir

**Plans à afficher:**
- **Free Plan:**
  - 5 links
  - 3 drops
  - Basic analytics
  - CTA: "Get Started Free"

- **Pro Plan:**
  - Unlimited links
  - Unlimited drops
  - Advanced analytics
  - Custom domain
  - Priority support
  - CTA: "Upgrade to Pro"

**Design:**
- 2-column layout (Free | Pro)
- Pro highlighted (purple gradient)
- Feature comparison table
- Mobile: Stacked cards

**Note:** Pricing déjà implémenté dans `/pricing` - peut réutiliser ou créer version landing simplifiée.

---

### 5. Social Proof / Testimonials
**Objectif:** Construire la confiance

**Contenu:**
- Testimonials (si disponibles)
- User count: "Join X users"
- Trust badges (si applicable)
- Screenshots de l'app

**Design:**
- Carousel ou grid
- Avatar + quote
- Stars rating (si applicable)

---

### 6. Demo / Screenshot Section
**Objectif:** Montrer l'app en action

**Contenu:**
- Screenshot de dashboard
- GIF ou vidéo de workflow
- Interactive demo (optionnel)

**Design:**
- Large visual
- Device mockup (iPhone/MacBook)
- Animated on scroll

---

### 7. CTA Section (Final)
**Objectif:** Conversion finale

**Contenu:**
- "Ready to get started?"
- CTA: "Create Your Free Account"
- Link: "Or view pricing" → `/pricing`

**Design:**
- Purple gradient background
- Centered, bold
- Large button

---

### 8. Footer
**Objectif:** Navigation et legal

**Sections:**
- **Product:**
  - Features
  - Pricing
  - Roadmap (optionnel)

- **Company:**
  - About
  - Blog (futur)
  - Contact

- **Legal:**
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)

- **Social:**
  - Twitter/X
  - GitHub (si open source)
  - LinkedIn

- **App:**
  - Sign In → `app.getonelink.io/auth`
  - Sign Up → `app.getonelink.io/auth`

**Design:**
- Multi-column layout
- Dark background
- Links organized

---

## 🎨 Design System

### Colors
- **Primary:** Purple gradient (cohérent avec app)
- **Background:** White (light) / Dark (dark mode)
- **Text:** Gray scale
- **Accents:** Purple, blue

### Typography
- **Headings:** Bold, large (Inter ou système)
- **Body:** Regular, readable
- **CTA:** Bold, uppercase (optionnel)

### Components
- Reutiliser composants de l'app si possible (buttons, cards)
- Créer composants spécifiques landing si nécessaire
- Responsive mobile-first

---

## 📱 Responsive Design

- **Mobile:** Stacked sections, large touch targets
- **Tablet:** 2-column layouts
- **Desktop:** Full width, multi-column

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🚀 Implementation Steps

### Phase 1: Setup (2h)
1. ✅ Acheter domaine `getonelink.io` sur Hostinger
2. ✅ Configurer DNS (Hostinger → Vercel)
3. ✅ Créer nouveau projet Vercel `onelink-landing`
4. ✅ Setup Next.js avec Tailwind
5. ✅ Configurer domaines dans Vercel

### Phase 2: Core Sections (4h)
1. ✅ Hero section
2. ✅ Features section (6 features)
3. ✅ How It Works (3-4 steps)
4. ✅ Pricing section (réutiliser ou créer)
5. ✅ Footer

### Phase 3: Polish (2h)
1. ✅ Animations (scroll, hover)
2. ✅ Responsive design
3. ✅ Dark mode (optionnel)
4. ✅ SEO optimization (meta tags, Open Graph)

### Phase 4: Content & CTAs (2h)
1. ✅ Copywriting (headlines, descriptions)
2. ✅ CTAs vers `app.getonelink.io`
3. ✅ Screenshots/GIFs de l'app
4. ✅ Testimonials (si disponibles)

### Phase 5: Testing & Launch (2h)
1. ✅ Test sur différents devices
2. ✅ Test de conversion (CTAs fonctionnent)
3. ✅ SEO check (Google Search Console)
4. ✅ Analytics setup (PostHog ou Google Analytics)

---

## 🔗 Integration avec App

### Redirects
- `/auth` → Redirect vers `app.getonelink.io/auth` (ou garder sur même domaine)
- `/dashboard` → Redirect vers `app.getonelink.io/dashboard` (si pas auth)

### Shared Components
- Réutiliser composants UI si possible (buttons, cards)
- Partager design tokens (colors, typography)

### Analytics
- Track conversions (sign up clicks)
- Track scroll depth
- Track CTA clicks

---

## 📊 Success Metrics

- **Conversion Rate:** % de visiteurs qui sign up
- **Bounce Rate:** < 50% idéal
- **Time on Page:** > 2 minutes
- **CTR on CTAs:** > 5%

---

## 🛠️ Tech Stack

**Recommandé:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Analytics:** PostHog (déjà intégré) ou Google Analytics
- **Forms:** Vercel Forms ou React Hook Form

**Alternative (si garder Vite):**
- **Framework:** Vite + React
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Routing:** React Router

---

## 📝 Content Checklist

- [ ] Hero headline et subheadline
- [ ] 6 features descriptions
- [ ] How it works steps
- [ ] Pricing copy
- [ ] Footer links
- [ ] Meta description (SEO)
- [ ] Open Graph tags (social sharing)
- [ ] Favicon et logo
- [ ] Screenshots/GIFs de l'app

---

## 🎯 Next Steps

1. **Acheter domaine** `getonelink.io` sur Hostinger
2. **Décider:** Next.js séparé ou route dans app actuelle
3. **Créer structure** de base (Hero, Features, Pricing, Footer)
4. **Ajouter contenu** et copywriting
5. **Configurer DNS** et déployer
6. **Tester** et itérer

---

## 📚 References

- **Inspiration:** Linear.app, Notion.so, Stripe.com, Vercel.com
- **Design Patterns:** SaaS landing pages best practices
- **SEO:** Next.js SEO guide

---

## Notes

- Landing page doit être **rapide** (< 3s load time)
- **Mobile-first** design (majorité des trafics)
- **A/B testing** possible sur CTAs plus tard
- **Blog** peut être ajouté plus tard pour SEO
- **Documentation** peut être ajoutée plus tard
