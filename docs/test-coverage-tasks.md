# Plan de Tests - Fichiers avec < 70% de Couverture

Ce document liste tous les fichiers nécessitant des tests pour améliorer la couverture de code.

## 📊 Objectif
Atteindre **74.23%** de couverture (seuil Codecov actuel: 71.42%)

---

## ✅ Priorité HAUTE - Faciles à tester (Logique métier simple)

### `lib/` - Utilitaires et helpers

#### `lib/onboarding.ts` - **10%** ⚠️ CRITIQUE
- **Fichier**: `src/lib/onboarding.ts`
- **Couverture actuelle**: 10%
- **Lignes non couvertes**: 4-15
- **Difficulté**: ⭐ Facile
- **Description**: Fonctions simples de gestion localStorage pour l'onboarding
- **Tests à ajouter**:
  - `shouldShowOnboarding()` - retourne false si window undefined
  - `shouldShowOnboarding()` - retourne true si localStorage n'a pas la clé
  - `shouldShowOnboarding()` - retourne false si localStorage a la clé à "true"
  - `setOnboardingCompleted()` - set localStorage
  - `setOnboardingIncomplete()` - remove localStorage
  - Tests avec window undefined (SSR)

#### `lib/posthog-events.ts` - **9.09%** ⚠️ CRITIQUE
- **Fichier**: `src/lib/posthog-events.ts`
- **Couverture actuelle**: 9.09%
- **Lignes non couvertes**: 10-14, 27-133
- **Difficulté**: ⭐⭐ Moyen (nécessite mock PostHog)
- **Description**: Helpers pour tracking d'événements PostHog
- **Tests à ajouter**:
  - `trackUserSignedUp()` - vérifie identifyUser et trackEvent
  - `trackUserSignedIn()` - vérifie identifyUser et trackEvent
  - `trackUserSignedOut()` - vérifie trackEvent et resetUser
  - `trackUserDeletedAccount()` - vérifie trackEvent et resetUser
  - `trackProfileCreated()` - vérifie trackEvent avec bonnes propriétés
  - `trackProfileViewed()` - vérifie trackEvent avec isOwner
  - Tous les autres événements de tracking

#### `lib/posthog.ts` - **18.86%**
- **Fichier**: `src/lib/posthog.ts`
- **Couverture actuelle**: 18.86%
- **Lignes non couvertes**: 54-183, 201-207
- **Difficulté**: ⭐⭐ Moyen (nécessite mock PostHog)
- **Description**: Initialisation et configuration PostHog
- **Tests à ajouter**:
  - `initPostHog()` - sans API key (warning)
  - `initPostHog()` - avec API key (initialise)
  - `isPostHogLoaded()` - retourne true/false
  - `trackEvent()` - avec queue avant chargement
  - `trackEvent()` - après chargement
  - `identifyUser()` - avec/sans propriétés
  - `resetUser()` - reset PostHog

#### `lib/profile.ts` - **44.82%**
- **Fichier**: `src/lib/profile.ts`
- **Couverture actuelle**: 44.82%
- **Lignes non couvertes**: 50-64, 78, 131-135
- **Difficulté**: ⭐⭐ Moyen (nécessite mock Supabase)
- **Description**: Fonctions de gestion de profil
- **Tests à ajouter**:
  - `getOrCreateProfile()` - création si n'existe pas
  - `getOrCreateProfile()` - retourne existant
  - `getOrCreateProfile()` - gestion d'erreur
  - `getPlanLinksLimit()` - free vs pro
  - `getPlanDropsLimit()` - free vs pro
  - Tests des fonctions deprecated

#### `lib/drops/getDrops.ts` - **36.36%**
- **Fichier**: `src/lib/drops/getDrops.ts`
- **Couverture actuelle**: 36.36%
- **Lignes non couvertes**: 10-29
- **Difficulté**: ⭐⭐ Moyen (nécessite mock Supabase)
- **Description**: Récupération des drops
- **Tests à ajouter**:
  - `getDrops()` - récupération réussie
  - `getDrops()` - gestion d'erreur
  - `getDrops()` - filtrage par profile_id

---

### `routes/` - Composants de routes

#### `routes/Auth.tsx` - **46.57%** ⚠️ IMPORTANT
- **Fichier**: `src/routes/Auth.tsx`
- **Couverture actuelle**: 46.57%
- **Lignes non couvertes**: 83-196, 299-365
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (nécessite mocks OAuth, Supabase)
- **Description**: Page d'authentification
- **Tests à ajouter**:
  - Affichage du formulaire email
  - Soumission email (succès/erreur)
  - Bouton Google OAuth
  - Bouton Facebook OAuth
  - Gestion erreurs OAuth dans URL
  - Affichage username pending
  - Lien vers onboarding

#### `routes/Dashboard/components/InboxTab.tsx` - **58.87%**
- **Fichier**: `src/routes/Dashboard/components/InboxTab.tsx`
- **Couverture actuelle**: 58.87%
- **Lignes non couvertes**: 107, 213-224, 466
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (composant complexe)
- **Description**: Onglet inbox du dashboard
- **Tests à ajouter**:
  - Affichage submissions
  - Marquer comme lu
  - Supprimer submission
  - Filtres
  - États vides

#### `routes/Dashboard/components/ProfileLinkCard.tsx` - **58.33%**
- **Fichier**: `src/routes/Dashboard/components/ProfileLinkCard.tsx`
- **Couverture actuelle**: 58.33%
- **Lignes non couvertes**: 32-38, 48-50
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Carte de profil dans dashboard
- **Tests à ajouter**:
  - Affichage du profil
  - Clic sur la carte
  - États de chargement

#### `routes/Pricing/components/PricingFAQ.tsx` - **53.84%**
- **Fichier**: `src/routes/Pricing/components/PricingFAQ.tsx`
- **Couverture actuelle**: 53.84%
- **Lignes non couvertes**: 17-23, 40
- **Difficulté**: ⭐ Facile
- **Description**: FAQ de la page pricing
- **Tests à ajouter**:
  - Affichage des questions
  - Expansion/collapse des réponses
  - Toutes les questions/réponses

#### `routes/Pricing/components/PricingHeader.tsx` - **50%**
- **Fichier**: `src/routes/Pricing/components/PricingHeader.tsx`
- **Couverture actuelle**: 50%
- **Lignes non couvertes**: 47-59
- **Difficulté**: ⭐ Facile
- **Description**: En-tête de la page pricing
- **Tests à ajouter**:
  - Affichage du titre
  - Affichage de la description
  - Responsive

#### `routes/Pricing/hooks/usePricingPlans.ts` - **57.14%**
- **Fichier**: `src/routes/Pricing/hooks/usePricingPlans.ts`
- **Couverture actuelle**: 57.14%
- **Lignes non couvertes**: 44-57, 67-74
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Hook pour récupérer les plans pricing
- **Tests à ajouter**:
  - Récupération des plans
  - Gestion d'erreur
  - États de chargement
  - Changement de période (mensuel/annuel)

---

## ⚠️ Priorité MOYENNE - Tests moyens (Composants UI)

### `components/` - Composants réutilisables

#### `components/ProfileEditor/ProfileFormFields.tsx` - **28.57%**
- **Fichier**: `src/components/ProfileEditor/ProfileFormFields.tsx`
- **Couverture actuelle**: 28.57%
- **Lignes non couvertes**: 43-48
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Champs du formulaire de profil
- **Tests à ajouter**:
  - Validation des champs
  - Soumission du formulaire
  - Gestion d'erreurs

#### `components/ProfileEditor/index.tsx` - **66.66%**
- **Fichier**: `src/components/ProfileEditor/index.tsx`
- **Couverture actuelle**: 66.66%
- **Lignes non couvertes**: 30-33, 41, 50-58
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Éditeur de profil
- **Tests à ajouter**:
  - Affichage du formulaire
  - Sauvegarde réussie
  - Gestion d'erreurs
  - Validation

#### `components/onboarding/hooks/useOnboardingCarousel.ts` - **60%**
- **Fichier**: `src/components/onboarding/hooks/useOnboardingCarousel.ts`
- **Couverture actuelle**: 60%
- **Lignes non couvertes**: 13-17
- **Difficulté**: ⭐ Facile
- **Description**: Hook pour carrousel onboarding
- **Tests à ajouter**:
  - Navigation entre slides
  - État actuel
  - Callback onComplete

#### `components/onboarding/components/OnboardingDots.tsx` - **66.66%`
- **Fichier**: `src/components/onboarding/components/OnboardingDots.tsx`
- **Couverture actuelle**: 66.66%
- **Lignes non couvertes**: 17
- **Difficulté**: ⭐ Facile
- **Description**: Indicateurs de slide onboarding
- **Tests à ajouter**:
  - Affichage des dots
  - Dots actifs/inactifs

---

### `routes/Dashboard/components/ContentTab/` - Modals

#### `routes/Dashboard/components/ContentTab/EditDropModal.tsx` - **55.55%**
- **Fichier**: `src/routes/Dashboard/components/ContentTab/EditDropModal.tsx`
- **Couverture actuelle**: 55.55%
- **Lignes non couvertes**: 63, 112, 131, 151
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Modal d'édition de drop
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Édition des champs
  - Sauvegarde
  - Gestion d'erreurs

#### `routes/Dashboard/components/ContentTab/EditLinkModal.tsx` - **47.36%**
- **Fichier**: `src/routes/Dashboard/components/ContentTab/EditLinkModal.tsx`
- **Couverture actuelle**: 47.36%
- **Lignes non couvertes**: 3, 47-54, 85, 105
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Modal d'édition de lien
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Édition des champs
  - Sauvegarde
  - Validation URL

#### `routes/Dashboard/components/ContentTab/DeleteDropModal.tsx` - **29.78%**
- **Fichier**: `src/routes/Dashboard/components/ContentTab/DeleteDropModal.tsx`
- **Couverture actuelle**: 29.78%
- **Lignes non couvertes**: 10-120, 165-200
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Modal de suppression de drop
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Confirmation suppression
  - Gestion d'erreurs
  - États de chargement

#### `routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx` - **31.70%`
- **Fichier**: `src/routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx`
- **Couverture actuelle**: 31.70%
- **Lignes non couvertes**: 96-102, 122, 142
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Modal de suppression de lien
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Confirmation suppression
  - Gestion d'erreurs

#### `routes/Dashboard/components/ContentTab/ShareDropModal.tsx` - **36.36%**
- **Fichier**: `src/routes/Dashboard/components/ContentTab/ShareDropModal.tsx`
- **Couverture actuelle**: 36.36%
- **Lignes non couvertes**: 30-36
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Modal de partage de drop
- **Tests à ajouter**:
  - Affichage du lien de partage
  - Copie du lien
  - QR code

---

### `routes/Settings/` - Paramètres

#### `routes/Settings/components/ChangePasswordModal.tsx` - **22.58%**
- **Fichier**: `src/routes/Settings/components/ChangePasswordModal.tsx`
- **Couverture actuelle**: 22.58%
- **Lignes non couvertes**: 17, 122-127, 198
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé (nécessite mock Supabase auth)
- **Description**: Modal de changement de mot de passe
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Validation des champs
  - Changement réussi
  - Gestion d'erreurs
  - Validation mot de passe

#### `routes/Settings/components/DataExportModal.tsx` - **47.91%`
- **Fichier**: `src/routes/Settings/components/DataExportModal.tsx`
- **Couverture actuelle**: 47.91%
- **Lignes non couvertes**: 76, 81-108, 149
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Modal d'export de données
- **Tests à ajouter**:
  - Ouverture/fermeture modal
  - Sélection format (JSON/CSV)
  - Sélection données à exporter
  - Déclenchement export
  - États de progression

#### `routes/Settings/components/DataExport/useDataExport.ts` - **31.25%`
- **Fichier**: `src/routes/Settings/components/DataExport/useDataExport.ts`
- **Couverture actuelle**: 31.25%
- **Lignes non couvertes**: 28-56, 63-70, 79-80
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Hook pour export de données
- **Tests à ajouter**:
  - Export JSON
  - Export CSV
  - Gestion d'erreurs
  - États de chargement
  - Filtrage des données

#### `routes/Settings/components/DataExport/DataExportReadyState.tsx` - **33.33%`
- **Fichier**: `src/routes/Settings/components/DataExport/DataExportReadyState.tsx`
- **Couverture actuelle**: 33.33%
- **Lignes non couvertes**: 15-21
- **Difficulté**: ⭐ Facile
- **Description**: État "prêt" de l'export
- **Tests à ajouter**:
  - Affichage du message
  - Bouton de téléchargement

#### `routes/Settings/components/ApiIntegrationsSection.tsx` - **50%**
- **Fichier**: `src/routes/Settings/components/ApiIntegrationsSection.tsx`
- **Couverture actuelle**: 50%
- **Lignes non couvertes**: 24, 64-79
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Section intégrations API
- **Tests à ajouter**:
  - Affichage de la section
  - Affichage de la clé API
  - Copie de la clé
  - Régénération de la clé

#### `routes/Settings/pages/CustomDomainPage.tsx` - **60%**
- **Fichier**: `src/routes/Settings/pages/CustomDomainPage.tsx`
- **Couverture actuelle**: 60%
- **Lignes non couvertes**: 35-69
- **Difficulté**: ⭐⭐⭐ Moyen-Élevé
- **Description**: Page de gestion des domaines personnalisés
- **Tests à ajouter**:
  - Affichage des domaines
  - Ajout d'un domaine
  - Suppression d'un domaine
  - Validation du domaine
  - États de chargement

#### `routes/Settings/pages/CustomDomain/useCustomDomains.ts` - **32.35%`
- **Fichier**: `src/routes/Settings/pages/CustomDomain/useCustomDomains.ts`
- **Couverture actuelle**: 32.35%
- **Lignes non couvertes**: 74-113, 120-141
- **Difficulté**: ⭐⭐ Moyen
- **Description**: Hook pour gestion domaines personnalisés
- **Tests à ajouter**:
  - Récupération des domaines
  - Ajout d'un domaine
  - Suppression d'un domaine
  - Gestion d'erreurs

---

## 🔴 Priorité BASSE - Tests complexes ou à exclure

### Fichiers à EXCLURE (difficiles ou non critiques)

#### ❌ Fichiers de traduction JSON (0%)
- `lib/locales/*.json` - Fichiers de traduction, pas besoin de tests unitaires

#### ❌ Composants UI complexes (0%)
- `components/ui/drawer.tsx` - Composant UI de base, déjà testé indirectement
- `components/ui/dialog.tsx` - Composant UI de base (70% déjà)

#### ❌ Utilitaires non critiques (0%)
- `lib/billing/*` - Fonctions Stripe, tests d'intégration plutôt que unitaires
- `lib/drops/getDropFiles.ts`, `getDropOwner.ts`, `uploadFiles.ts` - Tests E2E plutôt
- `lib/utils/socialDetection.ts` - Utilitaires simples, faible priorité
- `lib/sessionTracking.ts` - Tracking, tests d'intégration plutôt

#### ❌ Composants complexes (0%)
- `routes/Dashboard/components/DashboardHeader.tsx` - Composant simple, faible priorité
- `routes/Dashboard/components/OwnerFileUpload.tsx` - Upload fichiers, tests E2E
- `routes/Settings/components/ChangePasswordInput.tsx` - Composant simple
- `routes/Settings/pages/CustomDomain/*` (sauf useCustomDomains.ts) - Composants UI simples
- `routes/Settings/pages/SessionsPage/components/SessionHistoryList.tsx` - Composant simple

#### ❌ TwoFactor - Tests complexes (15-52%)
- `routes/Settings/pages/TwoFactor/*` - Tests MFA complexes, nécessitent setup Supabase MFA réel
- **Note**: Ces fichiers nécessitent des tests d'intégration plutôt que unitaires

#### ❌ Composants Profile (5.26%)
- `routes/Profile/components/ProfileLanguageToggleButton.tsx` - **5.26%**
- **Difficulté**: ⭐⭐⭐ Élevé (nécessite i18n setup complet)
- **Note**: Peut être testé mais complexe

---

## 📋 Checklist par Agent

### Agent 1 - Utilitaires `lib/`
- [ ] `lib/onboarding.ts` (10%)
- [ ] `lib/posthog-events.ts` (9.09%)
- [ ] `lib/posthog.ts` (18.86%)
- [ ] `lib/profile.ts` (44.82%)
- [ ] `lib/drops/getDrops.ts` (36.36%)

### Agent 2 - Routes principales
- [ ] `routes/Auth.tsx` (46.57%)
- [ ] `routes/Pricing/components/PricingFAQ.tsx` (53.84%)
- [ ] `routes/Pricing/components/PricingHeader.tsx` (50%)
- [ ] `routes/Pricing/hooks/usePricingPlans.ts` (57.14%)

### Agent 3 - Dashboard Components
- [ ] `routes/Dashboard/components/InboxTab.tsx` (58.87%)
- [ ] `routes/Dashboard/components/ProfileLinkCard.tsx` (58.33%)
- [ ] `routes/Dashboard/components/ContentTab/ShareDropModal.tsx` (36.36%)

### Agent 4 - Dashboard Modals
- [ ] `routes/Dashboard/components/ContentTab/EditDropModal.tsx` (55.55%)
- [ ] `routes/Dashboard/components/ContentTab/EditLinkModal.tsx` (47.36%)
- [ ] `routes/Dashboard/components/ContentTab/DeleteDropModal.tsx` (29.78%)
- [ ] `routes/Dashboard/components/ContentTab/DeleteLinkModal.tsx` (31.70%)

### Agent 5 - Settings Components
- [ ] `routes/Settings/components/ChangePasswordModal.tsx` (22.58%)
- [ ] `routes/Settings/components/DataExportModal.tsx` (47.91%)
- [ ] `routes/Settings/components/DataExport/useDataExport.ts` (31.25%)
- [ ] `routes/Settings/components/DataExport/DataExportReadyState.tsx` (33.33%)
- [ ] `routes/Settings/components/ApiIntegrationsSection.tsx` (50%)

### Agent 6 - Settings Pages & Profile Editor
- [ ] `routes/Settings/pages/CustomDomainPage.tsx` (60%)
- [ ] `routes/Settings/pages/CustomDomain/useCustomDomains.ts` (32.35%)
- [ ] `components/ProfileEditor/ProfileFormFields.tsx` (28.57%)
- [ ] `components/ProfileEditor/index.tsx` (66.66%)
- [ ] `components/onboarding/hooks/useOnboardingCarousel.ts` (60%)
- [ ] `components/onboarding/components/OnboardingDots.tsx` (66.66%)

---

## 📝 Notes importantes

1. **Ordre de priorité**: Commencer par les fichiers `lib/` (utilitaires) car ils sont utilisés partout
2. **Mocking**: La plupart nécessitent des mocks pour Supabase, PostHog, ou React Router
3. **Tests existants**: Vérifier les patterns dans les tests existants avant de créer de nouveaux
4. **Coverage goal**: Chaque fichier doit atteindre au moins 70% de couverture
5. **Fichiers exclus**: Ne pas tester les fichiers listés dans "Priorité BASSE"

---

## 🎯 Objectif final

- **Couverture globale**: Passer de **71.42%** à **≥74.23%**
- **Fichiers critiques**: Tous les fichiers `lib/` doivent être ≥70%
- **Routes principales**: `Auth.tsx` et routes Dashboard doivent être ≥70%
