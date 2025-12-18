# Plan de Tests - Système de Notifications

**Status:** 🔴 Not Started  
**Priority:** Medium  
**Estimated Time:** 6-8 hours

---

## 📋 Vue d'Ensemble

Ce document décrit tous les tests à créer pour le système de notifications (Phase 1). Les tests couvrent :
- Tests unitaires (hooks, composants, utilitaires)
- Tests d'intégration (Edge Functions)
- Tests E2E (flux utilisateur complets)

---

## 🧪 Tests Unitaires

### 1. Hooks Realtime

#### `useSubmissionsRealtime.test.ts`
**File:** `apps/web/src/hooks/__tests__/useSubmissionsRealtime.test.ts`

**Tests à créer:**
- ✅ S'abonne correctement aux INSERT sur `submissions`
- ✅ Filtre les submissions par `profile_id`
- ✅ Met à jour `setSubmissions` quand une nouvelle submission arrive
- ✅ Affiche un toast notification avec le bon message
- ✅ Nettoie la subscription au unmount
- ✅ Ne s'abonne pas si `profileId` est null
- ✅ Gère les erreurs de query drop correctement
- ✅ Ignore les submissions qui n'appartiennent pas au profile

**Mock nécessaire:**
- `supabase.channel()` et `.on()`
- `supabase.from("drops").select()`
- `supabase.rpc("get_submissions_by_profile")`
- `toast.success()`

---

#### `useFileDownloadsRealtime.test.ts`
**File:** `apps/web/src/hooks/__tests__/useFileDownloadsRealtime.test.ts`

**Tests à créer:**
- ✅ S'abonne correctement aux INSERT sur `file_downloads`
- ✅ Filtre les downloads par `profile_id` (via submission → drop)
- ✅ Exclut les downloads du propriétaire
- ✅ Met à jour `setDownloads` quand un nouveau download arrive
- ✅ Affiche un toast notification avec nom du fichier
- ✅ Nettoie la subscription au unmount
- ✅ Ne s'abonne pas si `profileId` est null
- ✅ Ignore les downloads de submissions supprimées (`deleted_at`)

**Mock nécessaire:**
- `supabase.channel()` et `.on()`
- `supabase.from("submissions").select()`
- `supabase.from("drops").select()`
- `supabase.from("profiles").select()`
- `supabase.rpc("get_downloads_by_profile")`
- `toast.success()`

---

### 2. Hook Dashboard Data

#### `useDashboardData.test.ts`
**File:** `apps/web/src/routes/Dashboard/hooks/__tests__/useDashboardData.test.ts`

**Tests à créer:**
- ✅ Charge les données initiales (profile, links, drops, submissions, downloads)
- ✅ Calcule `unreadCount` correctement (submissions où `read_at` est null)
- ✅ `unreadCount` se met à jour quand submissions changent
- ✅ `refreshInbox` recharge submissions et downloads
- ✅ `refreshInbox` retourne `false` en cas d'erreur
- ✅ `clearAllSubmissions` appelle la fonction RPC correcte
- ✅ `clearAllSubmissions` recharge les submissions après suppression
- ✅ Intègre `useSubmissionsRealtime` et `useFileDownloadsRealtime`
- ✅ Ne charge rien si `userId` est null
- ✅ Nettoie les subscriptions au unmount

**Mock nécessaire:**
- `getOrCreateProfile()`
- `getSelfPlan()`
- `supabase.from().select()`
- `supabase.rpc()`
- `useSubmissionsRealtime` (mock du hook)
- `useFileDownloadsRealtime` (mock du hook)

---

### 3. Composants Dashboard

#### `InboxTab.test.tsx`
**File:** `apps/web/src/routes/Dashboard/components/__tests__/InboxTab.test.tsx`

**Tests à créer:**
- ✅ Affiche le message "No submissions yet" quand vide
- ✅ Affiche toutes les submissions avec les bonnes données
- ✅ Affiche les downloads combinés avec submissions (tri chronologique)
- ✅ Affiche les indicateurs read/unread correctement (styles bleu/gris)
- ✅ Bouton "Mark as read" apparaît seulement pour submissions non lues
- ✅ Bouton "Mark all as read" apparaît seulement si `unreadCount > 0`
- ✅ Appelle `handleMarkAsRead` avec le bon `submission_id`
- ✅ Appelle `handleMarkAllAsRead` quand cliqué
- ✅ Appelle `refreshInbox` quand bouton refresh cliqué
- ✅ Affiche l'icône de refresh animée pendant le refresh
- ✅ Affiche les fichiers avec liens de téléchargement
- ✅ Affiche les informations submitter (name, email, note)
- ✅ Gère les erreurs de mark as read (alert affiché)

**Mock nécessaire:**
- `useTranslation()`
- `supabase.rpc()`
- `supabase.storage.from().getPublicUrl()`
- `refreshInbox` (mock function)

---

#### `TabNavigation.test.tsx`
**File:** `apps/web/src/routes/Dashboard/components/__tests__/TabNavigation.test.tsx`

**Tests à créer:**
- ✅ Affiche le badge `unreadCount` seulement si `unreadCount > 0`
- ✅ Badge affiche le bon nombre
- ✅ Badge a le bon style (gradient purple)
- ✅ Change d'onglet quand cliqué
- ✅ Affiche l'onglet actif avec le bon style

**Mock nécessaire:**
- `useTranslation()`

---

#### `BottomNavigation.test.tsx`
**File:** `apps/web/src/routes/Dashboard/components/__tests__/BottomNavigation.test.tsx`

**Tests à créer:**
- ✅ Affiche le dot purple seulement si `unreadCount > 0` et `activeTab !== "inbox"`
- ✅ Dot disparaît quand on est sur l'onglet inbox
- ✅ Change d'onglet quand cliqué
- ✅ Affiche le bouton "Clear all" seulement sur inbox avec submissions
- ✅ Appelle `onClearAll` quand bouton clear cliqué

**Mock nécessaire:**
- `useTranslation()`
- `useScrollState()`

---

### 4. Fonctions Utilitaires

#### `markSubmissionRead.test.ts` (si fonction séparée)
**File:** `apps/web/src/lib/notifications/__tests__/markSubmissionRead.test.ts`

**Tests à créer:**
- ✅ Appelle `supabase.rpc("mark_submission_read")` avec le bon ID
- ✅ Retourne `true` en cas de succès
- ✅ Retourne `false` en cas d'erreur
- ✅ Gère les erreurs correctement

---

## 🔗 Tests d'Intégration (Edge Functions)

### 1. `send-notification-email` Edge Function

#### `send-notification-email.test.ts`
**File:** `supabase/functions/send-notification-email/__tests__/index.test.ts`

**Tests à créer:**
- ✅ Retourne 405 pour méthodes non-POST
- ✅ Retourne 400 si `submission_id` ou `user_id` manquant
- ✅ Retourne 500 si configuration Supabase manquante
- ✅ Retourne 200 (skipped) si préférences email désactivées
- ✅ Retourne 404 si submission non trouvée
- ✅ Retourne 403 si submission n'appartient pas à l'utilisateur
- ✅ Rate limiting: retourne 200 (skipped) si email envoyé il y a < 5 min
- ✅ Envoie l'email avec les bonnes données
- ✅ Met à jour `last_email_sent_at` après envoi réussi
- ✅ Retourne 500 si envoi email échoue
- ✅ Logs les erreurs correctement
- ✅ Template email rendu avec les bonnes variables
- ✅ Gère CORS preflight (OPTIONS)

**Mock nécessaire:**
- `Deno.env.get()`
- `createClient()` (Supabase)
- `sendEmail()` (from `_shared/email.ts`)
- `Deno.readTextFile()` (templates)

**Setup:**
- Mock Supabase client avec données de test
- Mock Resend API
- Mock templates email

---

### 2. `send-weekly-digest` Edge Function

#### `send-weekly-digest.test.ts`
**File:** `supabase/functions/send-weekly-digest/__tests__/index.test.ts`

**Tests à créer:**
- ✅ Retourne 405 pour méthodes non-POST
- ✅ Retourne 500 si configuration Supabase manquante
- ✅ Récupère tous les utilisateurs avec `weekly_digest = true`
- ✅ Ignore les utilisateurs sans préférence
- ✅ Agrège les submissions de la semaine passée par drop
- ✅ Envoie un email par utilisateur avec préférence activée
- ✅ Template email rendu avec les bonnes données agrégées
- ✅ Gère les utilisateurs sans submissions (skip)
- ✅ Gère les erreurs par utilisateur sans tout faire échouer
- ✅ Retourne le bon résumé (succeeded, skipped, failed)
- ✅ Logs les résultats correctement

**Mock nécessaire:**
- `Deno.env.get()`
- `createClient()` (Supabase)
- `sendEmail()` (from `_shared/email.ts`)
- `Deno.readTextFile()` (templates)

---

## 🎭 Tests E2E (Playwright)

### 1. Notifications Temps Réel

#### `notifications-realtime.spec.ts`
**File:** `apps/web/e2e/notifications-realtime.spec.ts`

**Scénarios à tester:**

**Test 1: Nouvelle Submission Apparaît en Temps Réel**
- Ouvrir Dashboard dans un onglet
- Dans un autre onglet (ou navigateur), aller sur profil public
- Soumettre un fichier dans un Drop
- Vérifier que la submission apparaît automatiquement dans le Dashboard
- Vérifier que le toast notification apparaît
- Vérifier que `unreadCount` augmente
- Vérifier que la submission est marquée comme non lue (fond bleu)

**Test 2: Download Notification en Temps Réel**
- Avoir au moins une submission avec fichiers
- Dans un autre onglet, télécharger un fichier depuis une submission publique
- Vérifier que le download apparaît dans l'Inbox
- Vérifier que le toast notification apparaît
- Vérifier que le download est trié chronologiquement avec submissions

**Test 3: Multiple Submissions Rapides**
- Soumettre 3 fichiers rapidement (dans les 5 minutes)
- Vérifier que toutes apparaissent dans l'Inbox
- Vérifier que le `unreadCount` est correct

---

### 2. Read/Unread Functionality

#### `notifications-read-unread.spec.ts`
**File:** `apps/web/e2e/notifications-read-unread.spec.ts`

**Scénarios à tester:**

**Test 1: Mark as Read Individuel**
- Avoir plusieurs submissions non lues
- Cliquer sur "Mark read" sur une submission
- Vérifier que la submission passe en gris (lu)
- Vérifier que le point bleu disparaît
- Vérifier que le badge `unreadCount` diminue
- Vérifier que le bouton "Mark read" disparaît

**Test 2: Mark All as Read**
- Avoir plusieurs submissions non lues
- Cliquer sur "Mark all as read"
- Vérifier que toutes les submissions passent en gris
- Vérifier que tous les points bleus disparaissent
- Vérifier que le badge `unreadCount` devient 0
- Vérifier que le bouton "Mark all as read" disparaît

**Test 3: Persistance Read Status**
- Marquer une submission comme lue
- Rafraîchir la page
- Vérifier que la submission reste marquée comme lue

---

### 3. Navigation Badges

#### `notifications-badges.spec.ts`
**File:** `apps/web/e2e/notifications-badges.spec.ts`

**Scénarios à tester:**

**Test 1: Badge Desktop (TabNavigation)**
- Avoir des submissions non lues
- Vérifier que le badge apparaît sur l'onglet "Inbox" (desktop)
- Vérifier que le badge affiche le bon nombre
- Vérifier que le badge a le bon style (gradient purple)
- Marquer toutes comme lues
- Vérifier que le badge disparaît

**Test 2: Dot Mobile (BottomNavigation)**
- Avoir des submissions non lues
- Passer en mode mobile (viewport réduit)
- Vérifier que le dot purple apparaît sur l'icône Inbox
- Changer d'onglet (Content)
- Vérifier que le dot reste visible
- Revenir sur Inbox
- Vérifier que le dot disparaît (car on est sur inbox)
- Marquer toutes comme lues
- Vérifier que le dot disparaît complètement

---

### 4. Refresh Functionality

#### `notifications-refresh.spec.ts`
**File:** `apps/web/e2e/notifications-refresh.spec.ts`

**Scénarios à tester:**

**Test 1: Manual Refresh Button (Desktop)**
- Avoir des submissions dans l'Inbox
- Soumettre un nouveau fichier depuis un autre onglet
- Cliquer sur le bouton "Refresh"
- Vérifier que l'icône tourne pendant le refresh
- Vérifier que les nouvelles submissions apparaissent
- Vérifier que le bouton est désactivé pendant le refresh

**Test 2: Pull-to-Refresh (Mobile)**
- Passer en mode mobile
- Avoir des submissions dans l'Inbox
- Soumettre un nouveau fichier depuis un autre onglet
- Faire glisser vers le bas depuis le haut de la liste
- Vérifier que l'indicateur de refresh apparaît
- Vérifier que l'icône tourne quand on tire assez (60px)
- Vérifier que le refresh se déclenche automatiquement
- Vérifier que les nouvelles données sont chargées

---

### 5. Email Notifications

#### `notifications-email.spec.ts`
**File:** `apps/web/e2e/notifications-email.spec.ts`

**Scénarios à tester:**

**Test 1: Email Envoyé sur Nouvelle Submission**
- Activer les préférences email dans Settings
- Soumettre un fichier depuis un profil public
- Vérifier qu'un email est reçu (nécessite configuration email de test)
- Vérifier que l'email contient les bonnes informations
- Vérifier que le lien Dashboard fonctionne

**Test 2: Rate Limiting Email**
- Soumettre 3 fichiers rapidement (dans les 5 minutes) dans le même Drop
- Vérifier que seul le premier email est reçu
- Attendre 6 minutes
- Soumettre un autre fichier
- Vérifier qu'un nouvel email est reçu

**Test 3: Préférences Email Désactivées**
- Désactiver les préférences email dans Settings
- Soumettre un fichier
- Vérifier qu'aucun email n'est reçu

---

### 6. Download Notifications

#### `notifications-downloads.spec.ts`
**File:** `apps/web/e2e/notifications-downloads.spec.ts`

**Scénarios à tester:**

**Test 1: Download Affiché dans Inbox**
- Avoir une submission avec fichiers
- Télécharger un fichier depuis un profil public
- Vérifier que le download apparaît dans l'Inbox
- Vérifier que le download est trié chronologiquement avec submissions
- Vérifier que les informations du download sont correctes (nom fichier, drop, date)

**Test 2: Download du Propriétaire Exclu**
- Se connecter comme propriétaire
- Télécharger un fichier depuis son propre drop
- Vérifier que le download n'apparaît PAS dans l'Inbox (exclu)

---

## 📁 Structure des Fichiers de Test

```
apps/web/
├── src/
│   ├── hooks/
│   │   └── __tests__/
│   │       ├── useSubmissionsRealtime.test.ts
│   │       └── useFileDownloadsRealtime.test.ts
│   ├── routes/
│   │   └── Dashboard/
│   │       ├── hooks/
│   │       │   └── __tests__/
│   │       │       └── useDashboardData.test.ts
│   │       └── components/
│   │           └── __tests__/
│   │               ├── InboxTab.test.tsx
│   │               ├── TabNavigation.test.tsx
│   │               └── BottomNavigation.test.tsx
│   └── lib/
│       └── notifications/
│           └── __tests__/
│               └── markSubmissionRead.test.ts (si fonction séparée)

supabase/functions/
├── send-notification-email/
│   └── __tests__/
│       └── index.test.ts
└── send-weekly-digest/
    └── __tests__/
        └── index.test.ts

apps/web/e2e/
├── notifications-realtime.spec.ts
├── notifications-read-unread.spec.ts
├── notifications-badges.spec.ts
├── notifications-refresh.spec.ts
├── notifications-email.spec.ts
└── notifications-downloads.spec.ts
```

---

## 🛠️ Setup Requis

### Pour Tests Unitaires (Vitest)
```bash
# Déjà configuré dans le projet
pnpm test
```

### Pour Tests E2E (Playwright)
```bash
# Installer les browsers si nécessaire
pnpm exec playwright install

# Lancer les tests
pnpm exec playwright test e2e/notifications-*.spec.ts
```

### Pour Tests Edge Functions (Deno)
```bash
# Installer Deno si nécessaire
# Tests avec Deno test
deno test supabase/functions/**/__tests__/*.test.ts
```

---

## 📊 Checklist de Tests

### Tests Unitaires
- [ ] `useSubmissionsRealtime.test.ts` (8 tests)
- [ ] `useFileDownloadsRealtime.test.ts` (8 tests)
- [ ] `useDashboardData.test.ts` (10 tests)
- [ ] `InboxTab.test.tsx` (15 tests)
- [ ] `TabNavigation.test.tsx` (5 tests)
- [ ] `BottomNavigation.test.tsx` (5 tests)

**Total Tests Unitaires:** ~51 tests

### Tests d'Intégration
- [ ] `send-notification-email.test.ts` (14 tests)
- [ ] `send-weekly-digest.test.ts` (11 tests)

**Total Tests d'Intégration:** ~25 tests

### Tests E2E
- [ ] `notifications-realtime.spec.ts` (3 scénarios)
- [ ] `notifications-read-unread.spec.ts` (3 scénarios)
- [ ] `notifications-badges.spec.ts` (2 scénarios)
- [ ] `notifications-refresh.spec.ts` (2 scénarios)
- [ ] `notifications-email.spec.ts` (3 scénarios)
- [ ] `notifications-downloads.spec.ts` (2 scénarios)

**Total Tests E2E:** ~15 scénarios

---

## 🎯 Priorités

### High Priority (Critique)
1. Tests E2E pour notifications temps réel
2. Tests E2E pour read/unread functionality
3. Tests unitaires pour `useDashboardData`
4. Tests unitaires pour `InboxTab`

### Medium Priority (Important)
1. Tests unitaires pour hooks realtime
2. Tests d'intégration pour Edge Functions
3. Tests E2E pour badges et refresh

### Low Priority (Nice to have)
1. Tests unitaires pour composants navigation
2. Tests E2E pour emails (nécessite setup email de test)

---

## 📝 Notes Importantes

1. **Mocks:** Utiliser `vi.mock()` pour Vitest, `@playwright/test` mocks pour E2E
2. **Setup/Teardown:** Nettoyer les données de test après chaque test
3. **Isolation:** Chaque test doit être indépendant
4. **Fixtures:** Créer des fixtures Playwright pour setup utilisateur/profil
5. **Email Testing:** Utiliser un service de test email (Mailtrap, Mailhog) ou mocker Resend
6. **Realtime Testing:** Utiliser des délais appropriés pour les updates temps réel
7. **Edge Functions:** Tester avec Deno test framework (déjà configuré)

---

## 🚀 Ordre d'Implémentation Recommandé

1. **Tests Unitaires Hooks** (2-3h)
   - Plus simples, bonne base
   - `useSubmissionsRealtime` → `useFileDownloadsRealtime` → `useDashboardData`

2. **Tests Unitaires Composants** (2-3h)
   - `InboxTab` → `TabNavigation` → `BottomNavigation`

3. **Tests E2E Critiques** (2h)
   - `notifications-realtime` → `notifications-read-unread` → `notifications-badges`

4. **Tests d'Intégration Edge Functions** (1-2h)
   - `send-notification-email` → `send-weekly-digest`

5. **Tests E2E Complémentaires** (1h)
   - `notifications-refresh` → `notifications-downloads` → `notifications-email`

**Total Estimé:** 8-11 heures
