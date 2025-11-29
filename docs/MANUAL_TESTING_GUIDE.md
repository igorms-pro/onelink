# Guide de Test Manuel - Settings Backend Integration

Ce guide vous aide à tester manuellement toutes les fonctionnalités implémentées dans les PR récentes.

---

## 🚀 Démarrage de l'Application

### 1. Prérequis

Assurez-vous d'avoir les variables d'environnement configurées:

```bash
# Dans apps/web/.env.local ou .env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
VITE_ENCRYPTION_KEY=votre-cle-encryption (pour 2FA)
```

### 2. Lancer l'application

```bash
cd apps/web
npm install  # Si nécessaire
npm run dev
```

L'application devrait démarrer sur `http://localhost:5173` (ou un autre port affiché).

---

## 📋 Checklist de Test

### ✅ Test 1: User Preferences (Supabase Persistence)

**Objectif:** Vérifier que les préférences utilisateur sont sauvegardées dans Supabase (pas localStorage).

#### Étapes:

1. **Se connecter** à l'application
2. **Aller dans Settings** (`/settings`)
3. **Trouver la section "Email Preferences"**
4. **Tester les toggles:**
   - ✅ Toggle "Email Notifications"
   - ✅ Toggle "Weekly Digest"
   - ✅ Toggle "Marketing Emails"
   - ✅ Toggle "Product Updates"

5. **Vérifier la persistance:**
   - ✅ Recharger la page (F5)
   - ✅ Vérifier que les préférences sont toujours les mêmes
   - ✅ Ouvrir DevTools → Application → Local Storage
   - ✅ Vérifier qu'il n'y a PAS de données de préférences dans localStorage
   - ✅ Vérifier dans Supabase Dashboard que les données sont dans la table `user_preferences`

6. **Tester sans localStorage:**
   - ✅ Ouvrir DevTools → Console
   - ✅ Exécuter: `localStorage.clear()`
   - ✅ Recharger la page
   - ✅ Vérifier que les préférences sont toujours chargées (depuis Supabase)

**Résultat attendu:**
- ✅ Les préférences persistent après rechargement
- ✅ Aucune donnée dans localStorage
- ✅ Données visibles dans Supabase `user_preferences` table

---

### ✅ Test 2: Two-Factor Authentication (2FA) avec Encryption

**Objectif:** Vérifier que le flux 2FA fonctionne et que les secrets sont encryptés.

#### Étapes:

1. **Aller dans Settings** → **Two-Factor Authentication** (`/settings/2fa`)

2. **Tester l'état initial:**
   - ✅ Vérifier que l'état "disabled" est affiché
   - ✅ Vérifier que le bouton "Enable 2FA" est visible

3. **Tester le setup:**
   - ✅ Cliquer sur "Enable 2FA"
   - ✅ Vérifier que le QR code s'affiche
   - ✅ Vérifier que la clé secrète est affichée
   - ✅ Vérifier que le bouton "Copy Secret" fonctionne
   - ✅ Scanner le QR code avec une app TOTP (Google Authenticator, Authy, etc.)

4. **Tester la vérification:**
   - ✅ Entrer le code à 6 chiffres depuis l'app TOTP
   - ✅ Cliquer sur "Verify and Activate"
   - ✅ Vérifier que l'activation réussit
   - ✅ Vérifier que les backup codes sont affichés
   - ✅ Copier et sauvegarder les backup codes

5. **Tester l'état actif:**
   - ✅ Vérifier que l'état "active" est affiché
   - ✅ Vérifier que les backup codes sont accessibles
   - ✅ Tester le bouton "Show Backup Codes"
   - ✅ Tester le bouton "Regenerate Backup Codes"

6. **Vérifier l'encryption dans la base de données:**
   - ✅ Aller dans Supabase Dashboard
   - ✅ Ouvrir la table `user_2fa`
   - ✅ Vérifier que le champ `secret` contient une chaîne encryptée (pas le secret en clair)
   - ✅ Vérifier que le champ `backup_codes` contient une chaîne encryptée (pas les codes en clair)

7. **Tester la désactivation:**
   - ✅ Entrer le mot de passe
   - ✅ Cliquer sur "Disable 2FA"
   - ✅ Vérifier que 2FA est désactivé

**Résultat attendu:**
- ✅ Le flux 2FA complet fonctionne
- ✅ Les secrets sont encryptés dans la base de données
- ✅ Les backup codes sont encryptés dans la base de données
- ✅ La désactivation fonctionne

---

### ✅ Test 3: Billing Page (Stripe API Integration)

**Objectif:** Vérifier que la page billing affiche les données Stripe correctement.

#### Étapes:

1. **Aller dans Settings** → **Billing** (`/settings/billing`)

2. **Tester l'affichage des données:**
   - ✅ Vérifier que la page charge (skeleton loader puis contenu)
   - ✅ Vérifier que les détails de subscription sont affichés:
     - Status (Active, Canceled, etc.)
     - Renewal date (date de renouvellement)
   - ✅ Vérifier que les invoices sont listées (si disponibles)
   - ✅ Vérifier que les payment methods sont affichées (si disponibles)

3. **Tester les invoices:**
   - ✅ Vérifier que chaque invoice affiche:
     - Montant formaté (€X.XX)
     - Status (paid, open, void)
     - Date de création
   - ✅ Cliquer sur le lien de téléchargement (si disponible)
   - ✅ Vérifier que le lien fonctionne

4. **Tester les payment methods:**
   - ✅ Vérifier que la carte est affichée:
     - Brand (Visa, Mastercard, etc.)
     - Derniers 4 chiffres (•••• 4242)
     - Date d'expiration (MM/YYYY)

5. **Tester la navigation:**
   - ✅ Cliquer sur "Back to Settings"
   - ✅ Vérifier la redirection vers `/settings`

6. **Tester les boutons Stripe:**
   - ✅ Cliquer sur "Upgrade to Pro" (si free plan)
   - ✅ Vérifier la redirection vers Stripe Checkout
   - ✅ Cliquer sur "Manage on Stripe" (si pro plan)
   - ✅ Vérifier la redirection vers Stripe Customer Portal

7. **Tester la gestion d'erreurs:**
   - ✅ Simuler une erreur API (via DevTools → Network → Block request)
   - ✅ Vérifier qu'un message d'erreur s'affiche
   - ✅ Vérifier que la page ne crash pas

**Résultat attendu:**
- ✅ Toutes les données Stripe sont affichées correctement
- ✅ Les invoices sont listées avec les bonnes informations
- ✅ Les payment methods sont affichées
- ✅ La navigation fonctionne
- ✅ Les erreurs sont gérées gracieusement

---

### ✅ Test 4: Session Tracking & Login History

**Objectif:** Vérifier que les sessions et l'historique de connexion sont enregistrés.

#### Étapes:

1. **Vérifier les sessions:**
   - ✅ Aller dans Settings → **Active Sessions** (`/settings/sessions`)
   - ✅ Vérifier que la session actuelle est listée
   - ✅ Vérifier les informations affichées:
     - Device OS
     - Device Browser
     - IP Address (si disponible)
     - Location (City, Country si disponible)
     - Last Activity

2. **Tester la révocation de session:**
   - ✅ Si plusieurs sessions existent, cliquer sur "Revoke" sur une autre session
   - ✅ Vérifier que la session est supprimée

3. **Vérifier dans la base de données:**
   - ✅ Aller dans Supabase Dashboard
   - ✅ Ouvrir la table `user_sessions`
   - ✅ Vérifier qu'une nouvelle session a été créée lors de la connexion
   - ✅ Vérifier que les champs sont remplis correctement

4. **Vérifier l'historique de connexion:**
   - ✅ Ouvrir la table `login_history`
   - ✅ Vérifier qu'un enregistrement existe pour chaque tentative de connexion
   - ✅ Vérifier les champs:
     - `email`
     - `status` (success/failed)
     - `ip_address`
     - `device_info`
     - `user_agent`

**Résultat attendu:**
- ✅ Les sessions sont créées automatiquement
- ✅ L'historique de connexion est enregistré
- ✅ Les données sont visibles dans Supabase

---

### ✅ Test 5: Navigation et UX Générale

**Objectif:** Vérifier que toute la navigation fonctionne correctement.

#### Étapes:

1. **Navigation dans Settings:**
   - ✅ Tous les liens de navigation fonctionnent
   - ✅ Les boutons "Back" fonctionnent
   - ✅ Les modals s'ouvrent et se ferment correctement

2. **Responsive Design:**
   - ✅ Tester sur mobile (DevTools → Toggle device toolbar)
   - ✅ Tester sur tablette
   - ✅ Vérifier que tout est lisible et utilisable

3. **Dark Mode:**
   - ✅ Tester le toggle dark/light mode
   - ✅ Vérifier que tous les composants s'adaptent

**Résultat attendu:**
- ✅ Navigation fluide
- ✅ Design responsive
- ✅ Dark mode fonctionne

---

## 🐛 Points de Vérification Spécifiques

### Vérification Supabase

1. **Table `user_preferences`:**
   ```sql
   SELECT * FROM user_preferences WHERE user_id = 'votre-user-id';
   ```
   - ✅ Vérifier que les préférences sont sauvegardées
   - ✅ Vérifier que les valeurs sont correctes

2. **Table `user_2fa`:**
   ```sql
   SELECT * FROM user_2fa WHERE user_id = 'votre-user-id';
   ```
   - ✅ Vérifier que `secret` est encrypté (chaîne longue, pas le secret TOTP)
   - ✅ Vérifier que `backup_codes` est encrypté (chaîne longue, pas les codes en clair)
   - ✅ Vérifier que `enabled` est `true` si 2FA est activé

3. **Table `user_sessions`:**
   ```sql
   SELECT * FROM user_sessions WHERE user_id = 'votre-user-id' ORDER BY created_at DESC;
   ```
   - ✅ Vérifier qu'une session est créée à chaque connexion
   - ✅ Vérifier que les champs sont remplis

4. **Table `login_history`:**
   ```sql
   SELECT * FROM login_history WHERE user_id = 'votre-user-id' ORDER BY created_at DESC;
   ```
   - ✅ Vérifier que chaque connexion est enregistrée
   - ✅ Vérifier les champs `status`, `ip_address`, `device_info`

---

## 🔍 Vérification Console (DevTools)

Ouvrir DevTools → Console et vérifier:

1. **Pas d'erreurs:**
   - ✅ Aucune erreur rouge dans la console
   - ✅ Aucun warning critique

2. **Requêtes réseau:**
   - ✅ DevTools → Network
   - ✅ Vérifier que les appels à Supabase fonctionnent
   - ✅ Vérifier que les appels à Stripe Edge Functions fonctionnent

---

## 📝 Scénarios de Test Complets

### Scénario 1: Nouvel Utilisateur

1. Créer un nouveau compte
2. Aller dans Settings
3. Configurer les préférences email
4. Activer 2FA
5. Vérifier que tout est sauvegardé dans Supabase

### Scénario 2: Utilisateur Existant

1. Se connecter avec un compte existant
2. Vérifier que les préférences sont chargées
3. Modifier les préférences
4. Recharger la page
5. Vérifier que les modifications persistent

### Scénario 3: Utilisateur Pro avec Stripe

1. Se connecter avec un compte Pro
2. Aller dans Billing
3. Vérifier que les données Stripe sont affichées
4. Vérifier les invoices
5. Vérifier les payment methods
6. Tester "Manage on Stripe"

---

## ⚠️ Problèmes Potentiels et Solutions

### Problème: Les préférences ne persistent pas

**Solution:**
- Vérifier que Supabase est accessible
- Vérifier les permissions RLS (Row Level Security) sur `user_preferences`
- Vérifier la console pour les erreurs

### Problème: 2FA ne fonctionne pas

**Solution:**
- Vérifier que `VITE_ENCRYPTION_KEY` est défini
- Vérifier que la table `user_2fa` existe
- Vérifier les permissions RLS

### Problème: Billing page ne charge pas

**Solution:**
- Vérifier que l'Edge Function `stripe-get-subscription` est déployée
- Vérifier les credentials Stripe
- Vérifier la console pour les erreurs API

---

## ✅ Checklist Finale

Avant de considérer que tout fonctionne:

- [ ] User Preferences: Persistance Supabase ✅
- [ ] User Preferences: Pas de localStorage ✅
- [ ] 2FA: Setup complet fonctionne ✅
- [ ] 2FA: Secrets encryptés dans DB ✅
- [ ] 2FA: Backup codes fonctionnent ✅
- [ ] Billing: Données Stripe affichées ✅
- [ ] Billing: Invoices listées ✅
- [ ] Billing: Payment methods affichées ✅
- [ ] Sessions: Création automatique ✅
- [ ] Login History: Enregistrement ✅
- [ ] Navigation: Tous les liens fonctionnent ✅
- [ ] Responsive: Mobile/Tablette OK ✅
- [ ] Dark Mode: Fonctionne ✅
- [ ] Pas d'erreurs console ✅
- [ ] Toutes les données dans Supabase ✅

---

## 🎯 Commandes Utiles

```bash
# Lancer l'app en dev
cd apps/web && npm run dev

# Vérifier les types
npm run type-check

# Lancer les tests unitaires
npm test

# Lancer les tests e2e
npm run e2e:ci

# Lancer tous les tests
npm run test:ci && npm run e2e:ci
```

---

**Note:** Si vous rencontrez des problèmes, vérifiez:
1. Les variables d'environnement
2. Les permissions Supabase (RLS)
3. Les Edge Functions déployées
4. La console du navigateur
5. Les logs Supabase

