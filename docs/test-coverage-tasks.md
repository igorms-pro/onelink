# Plan de Tests - Fichiers avec < 70% de Couverture

**Objectif**: Atteindre **≥74.23%** de couverture (actuellement: 71.42%)

---

## 📋 Structure de Distribution

Ce document est organisé en **PHASES** et **TÂCHES** pour faciliter la distribution entre plusieurs agents.

Chaque **TÂCHE** est indépendante et peut être assignée à un agent différent.

---

## 🎯 Phase 1: Utilitaires Critiques `lib/` (Priorité MAXIMALE)

Ces fichiers sont utilisés partout dans l'application. Les tester en premier améliorera la couverture globale.

### TÂCHE 1.1: `lib/onboarding.ts` ⭐ FACILE
- **Fichier**: `src/lib/onboarding.ts`
- **Couverture actuelle**: 10%
- **Lignes non couvertes**: 4-15
- **Difficulté**: ⭐ Facile (pas de dépendances externes)
- **Temps estimé**: 15-20 min

**Tests à créer**: `src/lib/__tests__/onboarding.test.ts`

**Tests à ajouter**:
```typescript
describe("onboarding.ts", () => {
  // Test shouldShowOnboarding()
  - Retourne false si window est undefined (SSR)
  - Retourne true si localStorage n'a pas la clé
  - Retourne false si localStorage a la clé à "true"
  
  // Test setOnboardingCompleted()
  - Set localStorage avec la bonne clé
  - Ne fait rien si window est undefined
  
  // Test setOnboardingIncomplete()
  - Remove la clé du localStorage
  - Ne fait rien si window est undefined
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester toutes les fonctions
- [ ] Tester les cas SSR (window undefined)
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for lib/onboarding.ts"

---

### TÂCHE 1.2: `lib/posthog-events.ts` ⭐⭐ MOYEN
- **Fichier**: `src/lib/posthog-events.ts`
- **Couverture actuelle**: 9.09%
- **Lignes non couvertes**: 10-14, 27-133
- **Difficulté**: ⭐⭐ Moyen (nécessite mock PostHog)
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/lib/__tests__/posthog-events.test.ts`

**Tests à ajouter**:
```typescript
describe("posthog-events.ts", () => {
  // Mock PostHog avant chaque test
  
  // User Lifecycle Events
  - trackUserSignedUp() - vérifie identifyUser + trackEvent
  - trackUserSignedIn() - vérifie identifyUser + trackEvent
  - trackUserSignedOut() - vérifie trackEvent + resetUser
  - trackUserDeletedAccount() - vérifie trackEvent + resetUser
  
  // Profile Actions
  - trackProfileCreated() - vérifie trackEvent avec bonnes propriétés
  - trackProfileViewed() - vérifie trackEvent avec isOwner
  
  // Link Actions
  - trackLinkCreated() - vérifie trackEvent
  - trackLinkDeleted() - vérifie trackEvent
  - trackLinkClicked() - vérifie trackEvent
  
  // Drop Actions
  - trackDropCreated() - vérifie trackEvent
  - trackDropDeleted() - vérifie trackEvent
  - trackDropSubmissionReceived() - vérifie trackEvent
  
  // Tous les autres événements...
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock PostHog (identifyUser, trackEvent, resetUser)
- [ ] Tester tous les événements de tracking
- [ ] Vérifier les propriétés passées aux événements
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for lib/posthog-events.ts"

---

### TÂCHE 1.3: `lib/posthog.ts` ⭐⭐ MOYEN
- **Fichier**: `src/lib/posthog.ts`
- **Couverture actuelle**: 18.86%
- **Lignes non couvertes**: 54-183, 201-207
- **Difficulté**: ⭐⭐ Moyen (nécessite mock PostHog)
- **Temps estimé**: 40-50 min

**Tests à créer**: `src/lib/__tests__/posthog.test.ts`

**Tests à ajouter**:
```typescript
describe("posthog.ts", () => {
  // initPostHog()
  - Sans API key - affiche warning, ne s'initialise pas
  - Avec API key - s'initialise correctement
  - Avec host personnalisé
  - Avec environment personnalisé
  
  // isPostHogLoaded()
  - Retourne false avant init
  - Retourne true après init
  
  // trackEvent()
  - Avec queue avant chargement (ajoute à queue)
  - Après chargement (appelle directement PostHog)
  - Queue max size (50 événements)
  
  // identifyUser()
  - Avec propriétés
  - Sans propriétés
  
  // resetUser()
  - Reset PostHog user
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock posthog-js
- [ ] Tester initPostHog avec/sans API key
- [ ] Tester queue d'événements
- [ ] Tester identifyUser et resetUser
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for lib/posthog.ts"

---

### TÂCHE 1.4: `lib/profile.ts` ⭐⭐ MOYEN
- **Fichier**: `src/lib/profile.ts`
- **Couverture actuelle**: 44.82%
- **Lignes non couvertes**: 50-64, 78, 131-135
- **Difficulté**: ⭐⭐ Moyen (nécessite mock Supabase)
- **Temps estimé**: 40-50 min

**Tests à créer**: `src/lib/__tests__/profile.test.ts`

**Tests à ajouter**:
```typescript
describe("profile.ts", () => {
  // Mock Supabase avant chaque test
  
  // getOrCreateProfile()
  - Création si profil n'existe pas
  - Retourne profil existant
  - Gestion d'erreur Supabase
  
  // getPlanLinksLimit()
  - Retourne 4 pour "free"
  - Retourne Infinity pour "pro"
  - Retourne 4 pour autres plans
  
  // getPlanDropsLimit()
  - Retourne 2 pour "free"
  - Retourne Infinity pour "pro"
  - Retourne 2 pour autres plans
  
  // Fonctions deprecated (si encore utilisées)
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase (from, select, insert)
- [ ] Tester getOrCreateProfile (création + récupération)
- [ ] Tester getPlanLinksLimit et getPlanDropsLimit
- [ ] Tester gestion d'erreurs
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for lib/profile.ts"

---

### TÂCHE 1.5: `lib/drops/getDrops.ts` ⭐⭐ MOYEN
- **Fichier**: `src/lib/drops/getDrops.ts`
- **Couverture actuelle**: 36.36%
- **Lignes non couvertes**: 10-29
- **Difficulté**: ⭐⭐ Moyen (nécessite mock Supabase)
- **Temps estimé**: 20-30 min

**Tests à créer**: `src/lib/drops/__tests__/getDrops.test.ts`

**Tests à ajouter**:
```typescript
describe("getDrops.ts", () => {
  // Mock Supabase
  
  // getDrops()
  - Récupération réussie avec profile_id
  - Récupération vide (pas de drops)
  - Gestion d'erreur Supabase
  - Filtrage par profile_id correct
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester récupération réussie
- [ ] Tester cas vide
- [ ] Tester gestion d'erreurs
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for lib/drops/getDrops.ts"

---

## 🎯 Phase 2: Routes Principales (Priorité HAUTE)

### TÂCHE 2.1: `routes/Auth.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Auth.tsx`
- **Couverture actuelle**: 46.57%
- **Lignes non couvertes**: 83-196, 299-365
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (nécessite mocks OAuth, Supabase)
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/__tests__/Auth.test.tsx` (existe déjà, à compléter)

**Tests à ajouter**:
```typescript
describe("Auth.tsx", () => {
  // Tests existants: vérifier ce qui manque
  
  // Formulaire email
  - Soumission email réussie (toast success)
  - Soumission email erreur (toast error)
  - Validation email (required)
  - Reset du formulaire après succès
  
  // OAuth Google
  - Clic bouton Google (appelle signInWithOAuth)
  - Gestion erreur OAuth
  - Gestion annulation OAuth
  
  // OAuth Facebook
  - Clic bouton Facebook
  - Gestion erreur OAuth
  
  // Username pending
  - Affichage si username dans URL
  - Affichage si username dans localStorage
  - Stockage username dans localStorage
  
  // Erreurs OAuth dans URL
  - Affichage erreur si ?error= dans URL
  - Nettoyage URL après affichage erreur
  
  // Lien onboarding
  - Clic sur "View onboarding"
})
```

**Checklist**:
- [ ] Lire les tests existants
- [ ] Identifier les lignes non couvertes
- [ ] Ajouter tests manquants
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: improve coverage for routes/Auth.tsx"

---

### TÂCHE 2.2: `routes/Pricing/components/PricingFAQ.tsx` ⭐ FACILE
- **Fichier**: `src/routes/Pricing/components/PricingFAQ.tsx`
- **Couverture actuelle**: 53.84%
- **Lignes non couvertes**: 17-23, 40
- **Difficulté**: ⭐ Facile
- **Temps estimé**: 20-30 min

**Tests à créer**: `src/routes/Pricing/components/__tests__/PricingFAQ.test.tsx`

**Tests à ajouter**:
```typescript
describe("PricingFAQ.tsx", () => {
  - Affichage de toutes les questions
  - Expansion d'une question (clic)
  - Collapse d'une question (re-clic)
  - Plusieurs questions peuvent être ouvertes en même temps
  - Affichage des réponses
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester affichage FAQ
- [ ] Tester expansion/collapse
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for PricingFAQ.tsx"

---

### TÂCHE 2.3: `routes/Pricing/components/PricingHeader.tsx` ⭐ FACILE
- **Fichier**: `src/routes/Pricing/components/PricingHeader.tsx`
- **Couverture actuelle**: 50%
- **Lignes non couvertes**: 47-59
- **Difficulté**: ⭐ Facile
- **Temps estimé**: 15-20 min

**Tests à créer**: `src/routes/Pricing/components/__tests__/PricingHeader.test.tsx`

**Tests à ajouter**:
```typescript
describe("PricingHeader.tsx", () => {
  - Affichage du titre
  - Affichage de la description
  - Responsive (mobile/desktop)
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester affichage
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for PricingHeader.tsx"

---

### TÂCHE 2.4: `routes/Pricing/hooks/usePricingPlans.ts` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Pricing/hooks/usePricingPlans.ts`
- **Couverture actuelle**: 57.14%
- **Lignes non couvertes**: 44-57, 67-74
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/routes/Pricing/hooks/__tests__/usePricingPlans.test.ts`

**Tests à ajouter**:
```typescript
describe("usePricingPlans.ts", () => {
  - Récupération des plans (mensuel)
  - Récupération des plans (annuel)
  - Changement de période
  - États de chargement
  - Gestion d'erreur
  - Calcul des prix avec remise annuelle
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock les données de plans
- [ ] Tester récupération plans
- [ ] Tester changement période
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for usePricingPlans.ts"

---

## 🎯 Phase 3: Dashboard Components (Priorité MOYENNE)

### TÂCHE 3.1: `routes/Dashboard/components/InboxTab.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Dashboard/components/InboxTab.tsx`
- **Couverture actuelle**: 58.87%
- **Lignes non couvertes**: 107, 213-224, 466
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (composant complexe)
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Dashboard/components/__tests__/InboxTab.test.tsx` (existe déjà, à compléter)

**Tests à ajouter**:
```typescript
describe("InboxTab.tsx", () => {
  // Vérifier tests existants et ajouter:
  
  - Affichage submissions
  - Marquer comme lu (ligne 107)
  - Supprimer submission (lignes 213-224)
  - Filtres (ligne 466)
  - États vides
  - Gestion erreurs
})
```

**Checklist**:
- [ ] Lire tests existants
- [ ] Identifier lignes non couvertes
- [ ] Ajouter tests manquants
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: improve coverage for InboxTab.tsx"

---

### TÂCHE 3.2: `routes/Dashboard/components/ProfileLinkCard.tsx` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Dashboard/components/ProfileLinkCard.tsx`
- **Couverture actuelle**: 58.33%
- **Lignes non couvertes**: 32-38, 48-50
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/routes/Dashboard/components/__tests__/ProfileLinkCard.test.tsx` (existe déjà, à compléter)

**Tests à ajouter**:
```typescript
describe("ProfileLinkCard.tsx", () => {
  // Vérifier tests existants et ajouter:
  
  - Affichage du profil (lignes 32-38)
  - Clic sur la carte (lignes 48-50)
  - États de chargement
})
```

**Checklist**:
- [ ] Lire tests existants
- [ ] Ajouter tests manquants
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: improve coverage for ProfileLinkCard.tsx"

---

### TÂCHE 3.3: `routes/Dashboard/components/ContentTab/ShareDropModal.tsx` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Dashboard/components/ContentTab/ShareDropModal.tsx`
- **Couverture actuelle**: 36.36%
- **Lignes non couvertes**: 30-36
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/routes/Dashboard/components/ContentTab/__tests__/ShareDropModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("ShareDropModal.tsx", () => {
  - Ouverture/fermeture modal
  - Affichage du lien de partage
  - Copie du lien (clipboard)
  - Affichage QR code
  - Gestion erreur copie
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock clipboard API
- [ ] Tester ouverture/fermeture
- [ ] Tester copie lien
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for ShareDropModal.tsx"

---

## 🎯 Phase 4: Dashboard Modals (Priorité MOYENNE)

### TÂCHE 4.1: `routes/Dashboard/components/ContentTab/EditDropModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Dashboard/components/ContentTab/EditDropModal.tsx`
- **Couverture actuelle**: 55.55%
- **Lignes non couvertes**: 63, 112, 131, 151
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Dashboard/components/ContentTab/__tests__/EditDropModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("EditDropModal.tsx", () => {
  - Ouverture modal avec données existantes
  - Fermeture modal
  - Édition des champs (nom, description, etc.)
  - Sauvegarde réussie
  - Sauvegarde erreur
  - Validation des champs
  - États de chargement
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester ouverture/fermeture
- [ ] Tester édition champs
- [ ] Tester sauvegarde
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for EditDropModal.tsx"

---

### TÂCHE 4.2: `routes/Dashboard/components/ContentTab/EditLinkModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Dashboard/components/ContentTab/EditLinkModal.tsx`
- **Couverture actuelle**: 47.36%
- **Lignes non couvertes**: 3, 47-54, 85, 105
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Dashboard/components/ContentTab/__tests__/EditLinkModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("EditLinkModal.tsx", () => {
  - Ouverture modal avec données existantes
  - Fermeture modal
  - Édition des champs (titre, URL, etc.)
  - Validation URL
  - Sauvegarde réussie
  - Sauvegarde erreur
  - États de chargement
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester ouverture/fermeture
- [ ] Tester édition champs
- [ ] Tester validation URL
- [ ] Tester sauvegarde
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for EditLinkModal.tsx"

---

### TÂCHE 4.3: `routes/Dashboard/components/ContentTab/DeleteDropModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Dashboard/components/ContentTab/DeleteDropModal.tsx`
- **Couverture actuelle**: 29.78%
- **Lignes non couvertes**: 10-120, 165-200
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Dashboard/components/ContentTab/__tests__/DeleteDropModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("DeleteDropModal.tsx", () => {
  - Ouverture modal
  - Fermeture modal (annulation)
  - Confirmation suppression
  - Suppression réussie
  - Suppression erreur
  - États de chargement
  - Message de confirmation
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester ouverture/fermeture
- [ ] Tester confirmation
- [ ] Tester suppression
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for DeleteDropModal.tsx"

---

### TÂCHE 4.4: `routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx`
- **Couverture actuelle**: 31.70%
- **Lignes non couvertes**: 96-102, 122, 142
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Dashboard/components/ContentTab/__tests__/DeleteLinkModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("DeleteLinkModal.tsx", () => {
  - Ouverture modal
  - Fermeture modal (annulation)
  - Confirmation suppression
  - Suppression réussie
  - Suppression erreur
  - États de chargement
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester ouverture/fermeture
- [ ] Tester confirmation
- [ ] Tester suppression
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for DeleteLinkModal.tsx"

---

## 🎯 Phase 5: Settings Components (Priorité MOYENNE)

### TÂCHE 5.1: `routes/Settings/components/ChangePasswordModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Settings/components/ChangePasswordModal.tsx`
- **Couverture actuelle**: 22.58%
- **Lignes non couvertes**: 17, 122-127, 198
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (nécessite mock Supabase auth)
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Settings/components/__tests__/ChangePasswordModal.test.tsx`

**Tests à ajouter**:
```typescript
describe("ChangePasswordModal.tsx", () => {
  - Ouverture/fermeture modal
  - Validation des champs (ancien mot de passe requis)
  - Validation nouveau mot de passe (force, longueur)
  - Changement réussi
  - Changement erreur (mauvais ancien mot de passe)
  - Changement erreur (autre erreur)
  - États de chargement
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase auth (updateUser)
- [ ] Tester ouverture/fermeture
- [ ] Tester validation
- [ ] Tester changement réussi
- [ ] Tester gestion erreurs
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for ChangePasswordModal.tsx"

---

### TÂCHE 5.2: `routes/Settings/components/DataExportModal.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Settings/components/DataExportModal.tsx`
- **Couverture actuelle**: 47.91%
- **Lignes non couvertes**: 76, 81-108, 149
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Settings/components/__tests__/DataExportModal.test.tsx` (existe déjà, à compléter)

**Tests à ajouter**:
```typescript
describe("DataExportModal.tsx", () => {
  // Vérifier tests existants et ajouter:
  
  - Ouverture/fermeture modal (ligne 76)
  - Sélection format JSON/CSV (lignes 81-108)
  - Sélection données à exporter
  - Déclenchement export
  - États de progression (ligne 149)
})
```

**Checklist**:
- [ ] Lire tests existants
- [ ] Identifier lignes non couvertes
- [ ] Ajouter tests manquants
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: improve coverage for DataExportModal.tsx"

---

### TÂCHE 5.3: `routes/Settings/components/DataExport/useDataExport.ts` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Settings/components/DataExport/useDataExport.ts`
- **Couverture actuelle**: 31.25%
- **Lignes non couvertes**: 28-56, 63-70, 79-80
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 40-50 min

**Tests à créer**: `src/routes/Settings/components/DataExport/__tests__/useDataExport.test.ts`

**Tests à ajouter**:
```typescript
describe("useDataExport.ts", () => {
  - Export JSON avec toutes les données
  - Export JSON avec données sélectionnées
  - Export CSV avec toutes les données
  - Export CSV avec données sélectionnées
  - Gestion d'erreurs
  - États de chargement
  - Formatage des données pour CSV
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock les données utilisateur
- [ ] Tester export JSON
- [ ] Tester export CSV
- [ ] Tester filtrage données
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for useDataExport.ts"

---

### TÂCHE 5.4: `routes/Settings/components/DataExport/DataExportReadyState.tsx` ⭐ FACILE
- **Fichier**: `src/routes/Settings/components/DataExport/DataExportReadyState.tsx`
- **Couverture actuelle**: 33.33%
- **Lignes non couvertes**: 15-21
- **Difficulté**: ⭐ Facile
- **Temps estimé**: 15-20 min

**Tests à créer**: `src/routes/Settings/components/DataExport/__tests__/DataExportReadyState.test.tsx`

**Tests à ajouter**:
```typescript
describe("DataExportReadyState.tsx", () => {
  - Affichage du message "prêt"
  - Bouton de téléchargement visible
  - Clic sur téléchargement déclenche download
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester affichage
- [ ] Tester téléchargement
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for DataExportReadyState.tsx"

---

### TÂCHE 5.5: `routes/Settings/components/ApiIntegrationsSection.tsx` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Settings/components/ApiIntegrationsSection.tsx`
- **Couverture actuelle**: 50%
- **Lignes non couvertes**: 24, 64-79
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/routes/Settings/components/__tests__/ApiIntegrationsSection.test.tsx`

**Tests à ajouter**:
```typescript
describe("ApiIntegrationsSection.tsx", () => {
  - Affichage de la section
  - Affichage de la clé API
  - Copie de la clé (clipboard)
  - Régénération de la clé
  - Gestion erreurs
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock clipboard API
- [ ] Tester affichage clé
- [ ] Tester copie
- [ ] Tester régénération
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for ApiIntegrationsSection.tsx"

---

### TÂCHE 5.6: `routes/Settings/pages/CustomDomainPage.tsx` ⭐⭐⭐ MOYEN-ÉLEVÉ
- **Fichier**: `src/routes/Settings/pages/CustomDomainPage.tsx`
- **Couverture actuelle**: 60%
- **Lignes non couvertes**: 35-69
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Temps estimé**: 60-90 min

**Tests à créer**: `src/routes/Settings/pages/__tests__/CustomDomainPage.test.tsx`

**Tests à ajouter**:
```typescript
describe("CustomDomainPage.tsx", () => {
  - Affichage des domaines existants
  - Ajout d'un domaine
  - Suppression d'un domaine
  - Validation du domaine
  - États de chargement
  - Gestion erreurs
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock useCustomDomains hook
- [ ] Tester affichage domaines
- [ ] Tester ajout domaine
- [ ] Tester suppression domaine
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for CustomDomainPage.tsx"

---

### TÂCHE 5.7: `routes/Settings/pages/CustomDomain/useCustomDomains.ts` ⭐⭐ MOYEN
- **Fichier**: `src/routes/Settings/pages/CustomDomain/useCustomDomains.ts`
- **Couverture actuelle**: 32.35%
- **Lignes non couvertes**: 74-113, 120-141
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 40-50 min

**Tests à créer**: `src/routes/Settings/pages/CustomDomain/__tests__/useCustomDomains.test.ts`

**Tests à ajouter**:
```typescript
describe("useCustomDomains.ts", () => {
  - Récupération des domaines
  - Ajout d'un domaine
  - Suppression d'un domaine
  - Gestion d'erreurs
  - États de chargement
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Mock Supabase
- [ ] Tester récupération
- [ ] Tester ajout
- [ ] Tester suppression
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for useCustomDomains.ts"

---

## 🎯 Phase 6: Components & Hooks (Priorité BASSE)

### TÂCHE 6.1: `components/ProfileEditor/ProfileFormFields.tsx` ⭐⭐ MOYEN
- **Fichier**: `src/components/ProfileEditor/ProfileFormFields.tsx`
- **Couverture actuelle**: 28.57%
- **Lignes non couvertes**: 43-48
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 30-40 min

**Tests à créer**: `src/components/ProfileEditor/__tests__/ProfileFormFields.test.tsx`

**Tests à ajouter**:
```typescript
describe("ProfileFormFields.tsx", () => {
  - Affichage des champs
  - Validation des champs
  - Soumission du formulaire
  - Gestion d'erreurs
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester validation
- [ ] Tester soumission
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for ProfileFormFields.tsx"

---

### TÂCHE 6.2: `components/ProfileEditor/index.tsx` ⭐⭐ MOYEN
- **Fichier**: `src/components/ProfileEditor/index.tsx`
- **Couverture actuelle**: 66.66%
- **Lignes non couvertes**: 30-33, 41, 50-58
- **Difficulté**: ⭐⭐ Moyen
- **Temps estimé**: 40-50 min

**Tests à créer**: `src/components/ProfileEditor/__tests__/index.test.tsx`

**Tests à ajouter**:
```typescript
describe("ProfileEditor/index.tsx", () => {
  - Affichage du formulaire
  - Sauvegarde réussie
  - Gestion d'erreurs
  - Validation
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester affichage
- [ ] Tester sauvegarde
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for ProfileEditor/index.tsx"

---

### TÂCHE 6.3: `components/onboarding/hooks/useOnboardingCarousel.ts` ⭐ FACILE
- **Fichier**: `src/components/onboarding/hooks/useOnboardingCarousel.ts`
- **Couverture actuelle**: 60%
- **Lignes non couvertes**: 13-17
- **Difficulté**: ⭐ Facile
- **Temps estimé**: 20-30 min

**Tests à créer**: `src/components/onboarding/hooks/__tests__/useOnboardingCarousel.test.ts`

**Tests à ajouter**:
```typescript
describe("useOnboardingCarousel.ts", () => {
  - Navigation entre slides
  - État slide actuel
  - Callback onComplete
  - Navigation précédent/suivant
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester navigation
- [ ] Tester callback
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for useOnboardingCarousel.ts"

---

### TÂCHE 6.4: `components/onboarding/components/OnboardingDots.tsx` ⭐ FACILE
- **Fichier**: `src/components/onboarding/components/OnboardingDots.tsx`
- **Couverture actuelle**: 66.66%
- **Lignes non couvertes**: 17
- **Difficulté**: ⭐ Facile
- **Temps estimé**: 15-20 min

**Tests à créer**: `src/components/onboarding/components/__tests__/OnboardingDots.test.tsx`

**Tests à ajouter**:
```typescript
describe("OnboardingDots.tsx", () => {
  - Affichage des dots
  - Dots actifs/inactifs
  - Nombre de dots correspond au nombre de slides
})
```

**Checklist**:
- [ ] Créer le fichier de test
- [ ] Tester affichage dots
- [ ] Tester état actif
- [ ] Vérifier couverture ≥70%
- [ ] Commit avec message: "test: add tests for OnboardingDots.tsx"

---

## 📊 Résumé des Tâches par Phase

### Phase 1: Utilitaires Critiques (5 tâches)
- TÂCHE 1.1: `lib/onboarding.ts` ⭐ Facile
- TÂCHE 1.2: `lib/posthog-events.ts` ⭐⭐ Moyen
- TÂCHE 1.3: `lib/posthog.ts` ⭐⭐ Moyen
- TÂCHE 1.4: `lib/profile.ts` ⭐⭐ Moyen
- TÂCHE 1.5: `lib/drops/getDrops.ts` ⭐⭐ Moyen

### Phase 2: Routes Principales (4 tâches)
- TÂCHE 2.1: `routes/Auth.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 2.2: `routes/Pricing/components/PricingFAQ.tsx` ⭐ Facile
- TÂCHE 2.3: `routes/Pricing/components/PricingHeader.tsx` ⭐ Facile
- TÂCHE 2.4: `routes/Pricing/hooks/usePricingPlans.ts` ⭐⭐ Moyen

### Phase 3: Dashboard Components (3 tâches)
- TÂCHE 3.1: `routes/Dashboard/components/InboxTab.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 3.2: `routes/Dashboard/components/ProfileLinkCard.tsx` ⭐⭐ Moyen
- TÂCHE 3.3: `routes/Dashboard/components/ContentTab/ShareDropModal.tsx` ⭐⭐ Moyen

### Phase 4: Dashboard Modals (4 tâches)
- TÂCHE 4.1: `routes/Dashboard/components/ContentTab/EditDropModal.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 4.2: `routes/Dashboard/components/ContentTab/EditLinkModal.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 4.3: `routes/Dashboard/components/ContentTab/DeleteDropModal.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 4.4: `routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx` ⭐⭐⭐ Moyen-Élevé

### Phase 5: Settings Components (7 tâches)
- TÂCHE 5.1: `routes/Settings/components/ChangePasswordModal.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 5.2: `routes/Settings/components/DataExportModal.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 5.3: `routes/Settings/components/DataExport/useDataExport.ts` ⭐⭐ Moyen
- TÂCHE 5.4: `routes/Settings/components/DataExport/DataExportReadyState.tsx` ⭐ Facile
- TÂCHE 5.5: `routes/Settings/components/ApiIntegrationsSection.tsx` ⭐⭐ Moyen
- TÂCHE 5.6: `routes/Settings/pages/CustomDomainPage.tsx` ⭐⭐⭐ Moyen-Élevé
- TÂCHE 5.7: `routes/Settings/pages/CustomDomain/useCustomDomains.ts` ⭐⭐ Moyen

### Phase 6: Components & Hooks (4 tâches)
- TÂCHE 6.1: `components/ProfileEditor/ProfileFormFields.tsx` ⭐⭐ Moyen
- TÂCHE 6.2: `components/ProfileEditor/index.tsx` ⭐⭐ Moyen
- TÂCHE 6.3: `components/onboarding/hooks/useOnboardingCarousel.ts` ⭐ Facile
- TÂCHE 6.4: `components/onboarding/components/OnboardingDots.tsx` ⭐ Facile

---

## 🚀 Guide de Distribution

### Pour dispatcher le travail:

1. **Assigner une PHASE complète** à un agent (recommandé pour cohérence)
2. **Ou assigner des TÂCHES individuelles** si besoin de parallélisation maximale

### Exemple de distribution:

**Agent A** → Phase 1 complète (5 tâches utilitaires)
**Agent B** → Phase 2 complète (4 tâches routes)
**Agent C** → Phase 3 + Phase 4 (7 tâches dashboard)
**Agent D** → Phase 5 complète (7 tâches settings)
**Agent E** → Phase 6 complète (4 tâches components)

### Ou distribution par difficulté:

**Agent 1** → Toutes les tâches ⭐ Faciles (1.1, 2.2, 2.3, 5.4, 6.3, 6.4)
**Agent 2** → Toutes les tâches ⭐⭐ Moyennes (1.2, 1.3, 1.4, 1.5, 2.4, 3.2, 3.3, 5.3, 5.5, 5.7, 6.1, 6.2)
**Agent 3** → Toutes les tâches ⭐⭐⭐ Moyen-Élevé (2.1, 3.1, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.6)

---

## ✅ Checklist Générale pour chaque Agent

Avant de commencer:
- [ ] Lire le fichier source à tester
- [ ] Vérifier s'il existe déjà des tests
- [ ] Comprendre les dépendances (mocks nécessaires)

Pendant le développement:
- [ ] Créer le fichier de test dans le bon dossier `__tests__/`
- [ ] Suivre les patterns des tests existants
- [ ] Tester tous les cas d'usage (succès, erreurs, edge cases)
- [ ] Vérifier la couverture avec `pnpm test --coverage`

Avant de commit:
- [ ] Vérifier que tous les tests passent (`pnpm test`)
- [ ] Vérifier couverture ≥70% pour le fichier
- [ ] Vérifier qu'il n'y a pas d'erreurs de lint (`pnpm lint`)
- [ ] Commit avec message: `test: add tests for [nom-du-fichier]`

---

## 📈 Suivi de Progrès

**Total**: 27 tâches
- Phase 1: 5 tâches
- Phase 2: 4 tâches
- Phase 3: 3 tâches
- Phase 4: 4 tâches
- Phase 5: 7 tâches
- Phase 6: 4 tâches

**Objectif**: Toutes les tâches doivent être complétées pour atteindre ≥74.23% de couverture.
