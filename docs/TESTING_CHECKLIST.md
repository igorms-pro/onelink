# Checklist de Test - Settings Backend Integration

## ✅ Vérification de la Base de Données

### 1. Vérifier les Tables

Dans Supabase Dashboard → Table Editor, vérifier que ces tables existent:

- [ ] `user_preferences` ✅ (visible dans votre screenshot)
- [ ] `user_2fa` ✅ (visible dans votre screenshot)
- [ ] `user_sessions` ✅ (visible dans votre screenshot)
- [ ] `login_history` ✅ (visible dans votre screenshot)

### 2. ⚠️ IMPORTANT: Vérifier le Type de `backup_codes`

**Problème détecté:** La table `user_2fa` a `backup_codes` défini comme `text[]` (array), mais le code envoie une string encryptée.

**Action requise:**

1. **Vérifier le type actuel:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_2fa' 
     AND column_name = 'backup_codes';
   ```

2. **Si c'est `ARRAY`, exécuter la migration:**
   ```sql
   -- Exécuter le fichier: supabase/sql/006_fix_user_2fa_backup_codes.sql
   ```

3. **Vérifier après migration:**
   ```sql
   -- Doit être 'text', pas 'ARRAY'
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_2fa' 
     AND column_name = 'backup_codes';
   ```

### 3. Vérifier les Permissions RLS

Vérifier que les politiques RLS sont actives:

```sql
-- Vérifier les politiques
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'user_2fa', 'user_sessions', 'login_history');
```

Doit avoir:
- `user_preferences_owner_all` ✅
- `user_2fa_owner_all` ✅
- `user_sessions_owner_all` ✅
- `login_history_owner_select` ✅
- `login_history_public_insert` ✅

---

## 🚀 Lancer l'Application

```bash
cd apps/web
npm run dev
```

L'application démarre sur `http://localhost:5173`

---

## 📋 Tests à Effectuer

### Test 1: User Preferences

1. Se connecter
2. Aller dans `/settings`
3. Toggle "Marketing Emails"
4. **Vérifier dans Supabase:**
   ```sql
   SELECT * FROM user_preferences WHERE user_id = 'votre-user-id';
   ```
   - ✅ Doit avoir `marketing_emails = true` (ou false selon le toggle)
5. Recharger la page
6. ✅ Vérifier que la préférence persiste
7. DevTools → Application → Local Storage
8. ✅ Vérifier qu'il n'y a PAS de données de préférences

### Test 2: 2FA avec Encryption

1. Aller dans `/settings/2fa`
2. Cliquer "Enable 2FA"
3. Scanner le QR code avec Google Authenticator
4. Entrer le code → Activer
5. **Vérifier dans Supabase:**
   ```sql
   SELECT user_id, enabled, 
          length(secret) as secret_length,
          length(backup_codes) as backup_codes_length
   FROM user_2fa 
   WHERE user_id = 'votre-user-id';
   ```
   - ✅ `enabled` doit être `true`
   - ✅ `secret_length` doit être > 50 (string encryptée longue)
   - ✅ `backup_codes_length` doit être > 50 (string encryptée longue)
   - ✅ Les valeurs ne doivent PAS être les secrets/codes en clair

### Test 3: Billing Page

1. Aller dans `/settings/billing`
2. ✅ Vérifier que la page charge
3. ✅ Vérifier que les données Stripe s'affichent (si disponible)
4. ✅ Vérifier les invoices (si disponibles)
5. ✅ Vérifier les payment methods (si disponibles)

### Test 4: Sessions

1. Aller dans `/settings/sessions`
2. ✅ Vérifier que la session actuelle est listée
3. **Vérifier dans Supabase:**
   ```sql
   SELECT * FROM user_sessions 
   WHERE user_id = 'votre-user-id' 
   ORDER BY created_at DESC;
   ```
   - ✅ Doit avoir au moins une session
   - ✅ Les champs doivent être remplis (device_os, device_browser, etc.)

### Test 5: Login History

1. Se déconnecter puis se reconnecter
2. **Vérifier dans Supabase:**
   ```sql
   SELECT * FROM login_history 
   WHERE user_id = 'votre-user-id' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   - ✅ Doit avoir des enregistrements
   - ✅ `status` doit être 'success' ou 'failed'
   - ✅ Les champs doivent être remplis

---

## ⚠️ Problèmes Potentiels

### Si 2FA ne fonctionne pas:

1. Vérifier `VITE_ENCRYPTION_KEY` dans `.env.local`
2. Vérifier le type de `backup_codes` (doit être `text`, pas `ARRAY`)
3. Vérifier les erreurs dans la console

### Si les préférences ne persistent pas:

1. Vérifier les permissions RLS
2. Vérifier les erreurs dans la console
3. Vérifier que Supabase est accessible

### Si Billing ne charge pas:

1. Vérifier que l'Edge Function `stripe-get-subscription` est déployée
2. Vérifier les credentials Stripe
3. Vérifier les erreurs dans la console

---

## ✅ Checklist Finale

- [ ] Toutes les tables existent
- [ ] `backup_codes` est de type `text` (pas `ARRAY`)
- [ ] RLS policies sont actives
- [ ] User Preferences persistent
- [ ] Pas de données dans localStorage
- [ ] 2FA fonctionne
- [ ] Secrets encryptés dans DB
- [ ] Billing page charge
- [ ] Sessions créées automatiquement
- [ ] Login history enregistré
- [ ] Pas d'erreurs console

