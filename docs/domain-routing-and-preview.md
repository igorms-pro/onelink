# Domain Routing & Preview Button Behavior

Ce document décrit le comportement des redirections entre domaines et du bouton Preview dans l'application OneLink.

## 📋 Vue d'ensemble

OneLink utilise deux domaines principaux :
- **Landing domain** : `getonelink.io` → Affiche les profils publics
- **App domain** : `app.getonelink.io` → Application web (dashboard, settings, etc.)

## 🔄 Comportement du bouton Preview

Le bouton Preview dans `ProfileLinkCard.tsx` adapte son comportement selon l'environnement :

### En localhost (développement)

```typescript
// ProfileLinkCard.tsx détecte localhost
const isLocalhost = host === "localhost" || host.startsWith("localhost:") || ...

const profileUrl = isLocalhost
  ? `${window.location.origin}/${slug}`  // → http://localhost:5173/username
  : `${LANDING_URL}/${slug}`;             // → https://getonelink.io/username
```

**Résultat** : Le bouton Preview ouvre `http://localhost:5173/username` directement.

### En production

**Résultat** : Le bouton Preview ouvre `https://getonelink.io/username` directement.

---

## 🚦 Règles de redirection dans App.tsx

### En localhost (développement)

```typescript
if (isLocalhost) {
  // In dev, allow everything to work without redirects
  // Profiles can be accessed on localhost without redirecting to landing domain
  return;
}
```

**Comportement** :
- ✅ Pas de redirection
- ✅ Les profils sont accessibles sur `localhost:5173/username`
- ✅ Les routes app fonctionnent normalement sur `localhost:5173/dashboard`

### En production

#### Cas 1 : Accès à un profil sur le domaine app

**URL** : `https://app.getonelink.io/username`

**Comportement** :
```typescript
if (isAppDomain(host) && !isLocalhost) {
  const appRoutes = ["/dashboard", "/settings", "/welcome", "/checkout", "/pricing", "/auth"];
  const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));
  
  // Si ce n'est pas une route app, c'est probablement un profil → rediriger
  if (!isAppRoute && pathname !== "/" && pathname.length > 1) {
    window.location.replace(`${LANDING_URL}${pathname}${window.location.search}`);
  }
}
```

**Résultat** : Redirection automatique vers `https://getonelink.io/username`

#### Cas 2 : Accès aux routes app sur le domaine app

**URL** : `https://app.getonelink.io/dashboard`

**Comportement** : Pas de redirection, la route reste sur `app.getonelink.io`

#### Cas 3 : Accès au domaine landing

**URL** : `https://getonelink.io/username` ou `https://getonelink.io/`

**Comportement** : Pas de redirection, reste sur `getonelink.io`

---

## 📊 Tableau récapitulatif

| Environnement | URL d'accès | Comportement |
|--------------|-------------|--------------|
| **Localhost** | `localhost:5173/username` | ✅ Accessible directement, pas de redirection |
| **Localhost** | `localhost:5173/dashboard` | ✅ Accessible directement, pas de redirection |
| **Production** | `app.getonelink.io/username` | 🔄 Redirige vers `getonelink.io/username` |
| **Production** | `app.getonelink.io/dashboard` | ✅ Reste sur `app.getonelink.io` |
| **Production** | `getonelink.io/username` | ✅ Accessible directement |
| **Production** | Bouton Preview (depuis dashboard) | ✅ Ouvre `getonelink.io/username` |

---

## 🔍 Fichiers concernés

### ProfileLinkCard.tsx
- **Localisation** : `apps/web/src/routes/Dashboard/components/ProfileLinkCard.tsx`
- **Responsabilité** : Détermine l'URL du profil à afficher dans le bouton Preview
- **Logique** : Détecte localhost → utilise `window.location.origin`, sinon utilise `LANDING_URL`

### App.tsx
- **Localisation** : `apps/web/src/routes/App.tsx`
- **Responsabilité** : Gère les redirections entre domaines
- **Logique** : 
  - Skip en localhost
  - Redirige `app.getonelink.io/username` → `getonelink.io/username`
  - Laisse les routes app sur `app.getonelink.io`

### domain.ts
- **Localisation** : `apps/web/src/lib/domain.ts`
- **Responsabilité** : Fonctions utilitaires pour détecter le type de domaine
- **Fonctions** : `isAppDomain()`, `isLandingDomain()`

### constants.ts
- **Localisation** : `apps/web/src/lib/constants.ts`
- **Responsabilité** : Constantes des domaines et URLs
- **Constantes** : `LANDING_URL`, `APP_URL`, `ONELINK_LANDING`, `ONELINK_APP`

---

## 🧪 Tests

Les tests vérifient :
- ✅ Le bouton Preview utilise localhost en dev
- ✅ Le bouton Preview utilise `LANDING_URL` en production
- ✅ Les redirections ne s'appliquent pas en localhost
- ✅ Les redirections fonctionnent correctement en production

**Fichier de test** : `apps/web/src/routes/Dashboard/components/__tests__/ProfileLinkCard.test.tsx`

---

## 💡 Notes importantes

1. **Localhost est toujours exclu** des redirections pour permettre le développement local
2. **Les profils doivent toujours être accessibles sur `getonelink.io`** en production
3. **Le bouton Preview doit toujours ouvrir le bon domaine** selon l'environnement
4. **Les routes app (`/dashboard`, `/settings`, etc.) ne doivent jamais être redirigées**

---

## 🔄 Historique des changements

- **2024** : Ajout de la détection localhost dans `ProfileLinkCard.tsx` pour utiliser `window.location.origin` en dev
- **2024** : Ajout de la redirection `app.getonelink.io/username` → `getonelink.io/username` dans `App.tsx`
- **2024** : Exclusion explicite de localhost dans les redirections pour permettre le développement local
