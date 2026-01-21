# OneLink - Issues & Roadmap

## 📊 Priorités Actuelles

### 🔴 High Priority (À faire en premier)
1. **Video Embed** - Landing page "How It Works"
   - Status: 🔴 Not Started
   - Estimated: 1-2 heures
   - Impact: Conversion landing page
   - **Priorité:** Plus rapide à implémenter, impact immédiat sur conversion

2. **SSR avec Remix** - Pages publiques (`/:slug` et domaines personnalisés)
   - Status: 🔴 Not Started
   - Estimated: 12-16 heures
   - Impact: SEO majeur pour les profils publics
   - **Note:** Domaines personnalisés déjà implémentés ✅ (avantage concurrentiel vs Linktree)

### 🟡 Medium Priority
1. **SEO Optimization** - Meta tags, structured data, sitemap
   - Status: 🔴 Not Started
   - Estimated: 9-13 heures (3 phases)
   - Impact: Visibilité SEO

2. **Analytics Detail Page** - Page dédiée avec graphiques
   - Status: 🔴 Not Started
   - Estimated: Gros chantier
   - Impact: Insights utilisateurs

### ✅ Avantages Concurrentiels Confirmés
- ✅ **Domaines personnalisés** - Déjà implémenté ! Linktree ne le supporte PAS nativement
- ✅ **Drops (file sharing)** - Système unique combinant routing + file intake
- ✅ **Intent-first routing** - Design orienté intention, pas juste agrégation de liens

---

## 🗺️ Roadmap Produit - Priorités Stratégiques

### 🔴 Priorité Haute - Table Stakes Manquants (2-3 mois)

Ces features sont essentielles pour être compétitif avec Linktree/Beacons. Sans elles, vous risquez de perdre des utilisateurs lors des comparaisons.

#### 1. Analytics Avancés
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 3-4 semaines  
**Impact:** Critique pour creators qui veulent comprendre leur audience

**Features à implémenter:**
- [ ] Géolocalisation des clics (pays, ville)
- [ ] Sources de trafic (réseaux sociaux, direct, referrer)
- [ ] Graphiques temporels (clics par jour/semaine)
- [ ] Export analytics (CSV/JSON)
- [ ] Analytics par drop (qui a uploadé quoi, d'où)

**Fichiers à créer/modifier:**
- `apps/web/src/routes/Dashboard/components/AnalyticsDetailPage.tsx` - Page dédiée analytics
- `apps/web/src/lib/analytics/geo.ts` - Géolocalisation (via IP)
- `apps/web/src/lib/analytics/sources.ts` - Détection sources trafic
- `supabase/sql/011_analytics_advanced.sql` - Tables pour geo/sources
- `supabase/functions/analytics-processor/` - Edge Function pour enrichir données

**Dependencies:**
- Service géolocalisation IP (ex: MaxMind GeoIP2, ipapi.co)
- PostHog déjà intégré (peut être utilisé pour sources)

---

#### 2. Customization Profils (Couleurs, Fonts, Backgrounds)
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 2-3 semaines  
**Impact:** Critique - Linktree/Beacons ont rendu ça standard

**Features à implémenter:**
- [ ] Sélecteur de couleurs pour background/profile
- [ ] Sélection de fonts (3-5 options max)
- [ ] Background personnalisé (image upload ou gradient)
- [ ] Preview en temps réel
- [ ] Reset to default

**Fichiers à créer/modifier:**
- `apps/web/src/routes/Settings/pages/ProfileCustomization.tsx` - Page customization
- `apps/web/src/components/ProfileEditor/CustomizationPanel.tsx` - Panel customization
- `supabase/sql/012_profile_customization.sql` - Table `profile_customization`
- `apps/web/src/routes/Profile/index.tsx` - Appliquer styles custom

**Database Schema:**
```sql
CREATE TABLE profile_customization (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id),
  background_color TEXT,
  text_color TEXT,
  font_family TEXT,
  background_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### 3. Embeds (Spotify, YouTube, SoundCloud, etc.)
**Status:** 🔴 Not Started  
**Priority:** High  
**Estimated Time:** 1-2 semaines  
**Impact:** Important pour creators (musicians surtout)

**Features à implémenter:**
- [ ] Détection automatique URL (Spotify, YouTube, SoundCloud, Vimeo)
- [ ] Preview embed dans le profil
- [ ] Support oEmbed standard
- [ ] Fallback si embed échoue (lien normal)

**Fichiers à créer/modifier:**
- `apps/web/src/components/EmbedPreview.tsx` - Composant embed
- `apps/web/src/lib/embeds/detect.ts` - Détection type embed
- `apps/web/src/lib/embeds/oembed.ts` - Fetch oEmbed
- `apps/web/src/routes/Profile/components/LinkCard.tsx` - Afficher embed si disponible

**Services à intégrer:**
- oEmbed providers (YouTube, Spotify, SoundCloud, Vimeo)
- Pas besoin de backend, tout côté client

---

### 🟡 Priorité Moyenne - Différenciation (1-2 mois)

Ces features vous différencient vraiment de la concurrence.

#### 4. Pay-Gated Downloads
**Status:** 🔴 Not Started  
**Priority:** Medium-High  
**Estimated Time:** 3-4 semaines  
**Impact:** Différenciation majeure - bio link + storage + monetization

**Features à implémenter:**
- [ ] Marquer un drop comme "payant" avec prix
- [ ] Intégration Stripe Checkout pour download
- [ ] Page de checkout dédiée pour fichier
- [ ] Gestion accès après paiement (tokens temporaires)
- [ ] Analytics ventes (revenus, conversions)

**Fichiers à créer/modifier:**
- `apps/web/src/routes/Drop/Paywall.tsx` - Page paywall pour drop
- `apps/web/src/lib/billing/drop-payment.ts` - Logique paiement drop
- `supabase/functions/drop-checkout/` - Edge Function Stripe checkout
- `supabase/sql/013_paid_drops.sql` - Table `paid_drops`, `drop_purchases`
- `apps/web/src/routes/Dashboard/components/SalesAnalytics.tsx` - Analytics ventes

**Stripe Integration:**
- Utiliser Stripe Checkout (déjà intégré pour subscriptions)
- Créer Product/Price dynamiquement par drop
- Webhook pour confirmer paiement et générer download token

**Use Cases:**
- Photographers vendant presets Lightroom
- Musicians vendant beats/samples
- Designers vendant mockups/templates

---

### 🟢 Priorité Basse - Innovation Future (Attendre validation marché)

Ces features sont intéressantes mais doivent attendre que le produit de base soit validé et que vous ayez des utilisateurs payants.

#### 5. AI Auto-Tagging Fichiers
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 4-6 semaines  
**Impact:** Nice to have, pas critique

**Note:** ⏸️ **Attendre validation marché** - Implémenter seulement si vous avez des utilisateurs Pro qui demandent cette feature

**Features potentielles:**
- Auto-catégorisation fichiers (portraits, paysages, beats, etc.)
- Génération metadata automatique
- Smart compression suggestions

**Dependencies:**
- API IA (OpenAI, Anthropic, ou service spécialisé)
- Coût par requête à considérer

---

#### 6. Collaborative Drops
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 6-8 semaines  
**Impact:** Innovation intéressante mais use case à valider

**Note:** ⏸️ **Attendre validation marché** - Valider d'abord que les drops simples fonctionnent bien

**Features potentielles:**
- Permissions pour drops (qui peut upload)
- Drops collaboratifs (plusieurs personnes upload)
- Use case: photographe + client, musicien + collab

---

#### 7. Version Control Fichiers
**Status:** 🔴 Not Started  
**Priority:** Low  
**Estimated Time:** 4-5 semaines  
**Impact:** Niche, use case spécifique

**Note:** ⏸️ **Attendre validation marché** - Très niche, seulement si demandé par plusieurs utilisateurs

**Features potentielles:**
- Détection versions automatique (beat_v1, beat_v2)
- Historique versions
- Rollback vers version précédente

---

## Server-Side Rendering (SSR) pour Pages Publiques

**Status:** 🔴 Not Started  
**Priority:** High (Important pour SEO des profils publics)  
**Category:** Infrastructure / SEO

### Contexte

- Application React + Vite en **CSR (Client-Side Rendering)**
- Les pages publiques (`/:slug` et domaines personnalisés) sont rendues côté client
- Les métadonnées SEO sont injectées via JavaScript après le chargement
- Google et les réseaux sociaux peuvent ne pas voir le contenu complet immédiatement

**Architecture SSR hybride :**
- Pages publiques (`/:slug`, domaines personnalisés) → SSR avec Remix
- Dashboard/Auth/Settings → CSR (pas besoin de SEO)

### Solution Recommandée: Remix v2 avec Vite

**Remix v2 avec Vite (Recommandé)**

Remix est un framework React avec SSR intégré, stable avec Vite depuis v2.7.0.

**Installation:**
```bash
pnpm add @remix-run/react @remix-run/node @remix-run/vite
pnpm add -D @remix-run/dev
```

**Architecture:**
- **Pages publiques** (`/:slug`, domaines personnalisés) → SSR avec Remix
- **Dashboard/Auth** → Peut rester CSR ou utiliser Remix pour cohérence
- **Landing page** → Peut rester statique ou utiliser Remix

**Fichiers à créer/modifier:**
- `apps/web/app/` - Structure Remix (routes, root.tsx)
- `apps/web/app/routes/$.tsx` - Route catch-all pour `/:slug` et domaines personnalisés
- `apps/web/app/routes/_index.tsx` - Route pour `/`
- `apps/web/vite.config.ts` - Ajouter plugin Remix
- `apps/web/package.json` - Scripts Remix (dev, build, start)

**Configuration Vercel:**
- Remix fonctionne nativement avec Vercel
- Configuration automatique via `vercel.json`

**Estimated Time:** 12-16 heures (migration progressive possible)

---

### Plan d'Implémentation Remix SSR

#### Phase 1: Setup Remix de Base (4-6 heures)
1. Installer Remix et dépendances
2. Créer structure `app/` avec routes Remix
3. Configurer Vite avec plugin Remix
4. Migrer route Profile (`/:slug`) vers Remix
5. Tester SSR en local

**Fichiers à créer:**
- `apps/web/app/root.tsx` - Root component Remix
- `apps/web/app/routes/$.tsx` - Route catch-all pour `/:slug` et domaines personnalisés
- `apps/web/app/routes/_index.tsx` - Route pour `/`
- `apps/web/app/routes/dashboard.tsx` - Route Dashboard (peut rester CSR initialement)

**Fichiers à modifier:**
- `apps/web/vite.config.ts` - Ajouter plugin Remix
- `apps/web/package.json` - Scripts Remix (dev, build, start)

---

#### Phase 2: Loaders pour Fetching Données (3-4 heures)
1. Créer loader pour route Profile (`$.tsx`)
2. Fetch profile par slug ou domaine côté serveur
3. Gérer erreurs 404 avec `throw new Response()`
4. Optimiser requêtes Supabase pour SSR

**Fichiers à créer:**
- `apps/web/app/lib/loaders/profile.ts` - Loader pour profils
- `apps/web/app/lib/loaders/domain.ts` - Loader pour domaines personnalisés

**Fichiers à modifier:**
- `apps/web/app/routes/$.tsx` - Ajouter loader
- Adapter `useProfileData` hook pour utiliser données du loader

---

#### Phase 3: Meta Tags avec Remix (2-3 heures)
1. Utiliser `meta` export dans route Profile
2. Générer meta tags dynamiques côté serveur
3. Tester avec Facebook/LinkedIn/Twitter debuggers
4. Vérifier que Google voit les meta tags

**Fichiers à créer:**
- `apps/web/app/lib/meta/profile.ts` - Fonction pour générer meta tags

**Fichiers à modifier:**
- `apps/web/app/routes/$.tsx` - Ajouter export `meta`
- `apps/web/app/root.tsx` - Configurer Helmet ou meta tags

---

#### Phase 4: Domaines Personnalisés avec Remix (2-3 heures)
1. Adapter loader pour détecter domaine personnalisé
2. Fetch profile par domaine côté serveur
3. Gérer vérification domaine (verified = true)
4. Tester avec domaines personnalisés

**Note:** Les domaines personnalisés sont **déjà implémentés** dans votre codebase (table `custom_domains`, page `/settings/domain`). C'est un **avantage concurrentiel majeur** - Linktree ne supporte PAS les domaines personnalisés nativement !

**Fichiers à modifier:**
- `apps/web/app/routes/$.tsx` - Adapter loader pour domaines
- `apps/web/app/lib/loaders/domain.ts` - Logique de détection domaine

---

#### Phase 5: Déploiement Vercel (2-3 heures)
1. Configurer `vercel.json` pour Remix
2. Tester déploiement en preview
3. Vérifier performance (Lighthouse)
4. Monitorer erreurs (Sentry)

**Fichiers à modifier:**
- `apps/web/vercel.json` - Configuration Remix (auto-détecté généralement)
- `apps/web/package.json` - Scripts de build

---

### Métriques de Succès

**SEO:**
- [ ] Meta tags présents dans le HTML source (view-source)
- [ ] Google Search Console: Pages indexées correctement
- [ ] Open Graph fonctionne (Facebook Sharing Debugger)
- [ ] Twitter Cards fonctionnent (Twitter Card Validator)

**Performance:**
- [ ] Lighthouse SEO score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Core Web Vitals: Tous verts

**Fonctionnalité:**
- [ ] Pages publiques (`/:slug`) fonctionnent avec SSR
- [ ] Domaines personnalisés fonctionnent avec SSR
- [ ] Dashboard reste en CSR (pas de régression)
- [ ] Hydratation fonctionne correctement

---

### Ressources

**Documentation:**
- [Remix Documentation](https://remix.run/docs)
- [Remix Vite Guide](https://remix.run/docs/en/main/guides/vite)
- [Remix Vercel Deployment](https://remix.run/docs/en/main/guides/deployment#vercel)
- [React Router v7 Migration](https://reactrouter.com/upgrading/remix)

**Outils de Test:**
- Google Search Console
- Facebook Sharing Debugger
- Twitter Card Validator
- Lighthouse (Chrome DevTools)
- curl pour vérifier HTML source

---

## SEO Optimization

**Status:** 🔴 Not Started  
**Priority:** Medium (Important for landing page)  
**Category:** Infrastructure / Marketing

### Current State
- Basic meta tags in `index.html` (static)
- Manual meta tag updates in Profile component using `useEffect` and DOM manipulation
- No structured data (JSON-LD)
- No sitemap.xml
- No robots.txt

### Problem
- Vite + React SPA renders client-side, Google crawlers may see empty HTML initially
- Meta tags updated via JavaScript after page load (Google may miss them)
- No pre-rendering or SSR for better SEO

### Solution: SEO Libraries & Plugins

#### Option 1: react-helmet-async (Recommended for MVP)
**Purpose:** Clean, declarative meta tag management

**Installation:**
```bash
pnpm add react-helmet-async
```

**Usage:**
- Wrap app with `<HelmetProvider>`
- Use `<Helmet>` component in each route/page
- Automatically manages meta tags, title, Open Graph, Twitter Cards
- Works with React Router

**Benefits:**
- ✅ Clean API (declarative)
- ✅ Automatic cleanup
- ✅ SSR-ready (if needed later)
- ✅ Works with Vite + React
- ✅ Better than manual DOM manipulation

**Files to Update:**
- `apps/web/src/main.tsx` - Add `<HelmetProvider>`
- `apps/web/src/routes/Profile/index.tsx` - Replace manual meta tags with `<Helmet>`
- `apps/web/src/routes/Dashboard/index.tsx` - Add meta tags
- `apps/landing/src/routes/*` - Add meta tags for landing pages

**Estimated Time:** 2-3 hours

---

#### Phase 1: Basic SEO (MVP) - 2-3 hours
1. Install `react-helmet-async`
2. Replace manual meta tag updates with `<Helmet>` components
3. Add proper meta tags to all routes
4. Add Open Graph and Twitter Card tags
5. Test meta tags with social media debuggers

**Files to Create/Update:**
- `apps/web/src/lib/seo.ts` - SEO utilities/helpers
- Update all route components with `<Helmet>`

---

#### Phase 2: Pre-rendering (Post-MVP) - 3-4 hours
1. Install `vite-plugin-prerender`
2. Configure pre-rendering for static routes (`/`, `/pricing`, `/features`)
3. Test pre-rendered HTML output
4. Verify Google can crawl content
5. Deploy and test

**Files to Update:**
- `apps/landing/vite.config.ts` - Add prerender plugin
- `apps/landing/src/main.tsx` - Add render event trigger

---

#### Phase 3: Advanced SEO (Future) - 4-6 hours
1. Add structured data (JSON-LD) for rich snippets
2. Generate `sitemap.xml` automatically
3. Create `robots.txt`
4. Add canonical URLs
5. Submit to Google Search Console
6. Monitor SEO performance

**Files to Create:**
- `apps/landing/public/sitemap.xml` (or generate dynamically)
- `apps/landing/public/robots.txt`
- `apps/landing/src/lib/structured-data.ts` - JSON-LD helpers

---

### Testing SEO

**Tools:**
- Google Search Console - Submit sitemap, monitor indexing
- Google Rich Results Test - Test structured data
- Facebook Sharing Debugger - Test Open Graph tags
- Twitter Card Validator - Test Twitter Cards
- Lighthouse SEO audit - Check SEO score

**Checklist:**
- [ ] Meta tags present in HTML source
- [ ] Open Graph tags work (Facebook/LinkedIn)
- [ ] Twitter Cards work
- [ ] Structured data validates
- [ ] Sitemap.xml accessible
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Mobile-friendly (responsive)

---

## Notes
- ✅ UX polish completed (mobile → desktop → dark theme)
- ✅ Drop system redesign completed
- ✅ Custom domains feature implemented (`/settings/domain`) - **Avantage concurrentiel majeur** : Linktree ne supporte PAS les domaines personnalisés nativement !
- ✅ Analytics de base implémentés (clicks tracking, PostHog)
- ✅ Notifications system (Phase 1) completed
- ✅ Settings pages completed
- ✅ Social auth (Google) completed
- Maintain backward compatibility
- Keep user experience simple and intuitive
- Legal pages can start English-only, translations can be added later
- SEO optimization important for landing page conversion
- SSR avec Remix permettra d'améliorer le SEO des profils publics et domaines personnalisés
- **Stratégie:** Compléter table stakes d'abord, puis différenciation (pay-gated), puis innovation (AI) seulement après validation marché
