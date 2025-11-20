# Guide de Configuration Stripe

## Étape 1 : Créer les 4 Produits et Prix dans Stripe

1. **Aller dans Stripe Dashboard** → [https://dashboard.stripe.com](https://dashboard.stripe.com)

2. **Créer les 4 Produits (un par un) :**

   ### Produit 1 : OneLink Starter (Monthly)
   - Menu : **Products** → **Add product**
   - **Name** : `OneLink Starter`
   - **Description** : `Unlimited links & drops, custom domain, 500MB/file, 30-day retention, basic analytics`
   - Cliquer sur **Save product**
   - **Ajouter un Prix :**
     - Cliquer sur **Add pricing**
     - **Pricing model** : `Standard pricing`
     - **Price** : `6.00`
     - **Billing period** : `Recurring` → `Monthly`
     - **Currency** : `EUR` (Euro)
     - Cliquer sur **Save price**
     - **Copier le Price ID** : `price_xxxxxxxxxxxxx` → C'est votre `PRICE_ID_STARTER_MONTHLY`

   ### Produit 2 : OneLink Starter (Yearly)
   - Dans le même produit "OneLink Starter", cliquer sur **Add pricing**
   - **Price** : `58.00` (€6/mois × 12 avec 20% de remise)
   - **Billing period** : `Recurring` → `Yearly`
   - **Currency** : `EUR`
   - Cliquer sur **Save price**
   - **Copier le Price ID** : `price_xxxxxxxxxxxxx` → C'est votre `PRICE_ID_STARTER_YEARLY`

   ### Produit 3 : OneLink Pro (Monthly)
   - Menu : **Products** → **Add product**
   - **Name** : `OneLink Pro`
   - **Description** : `Unlimited links & drops, custom domain, 2GB/file, 90-day retention, advanced analytics (30 & 90 days), Google Analytics integration, priority support`
   - Cliquer sur **Save product**
   - **Ajouter un Prix :**
     - Cliquer sur **Add pricing**
     - **Price** : `12.00`
     - **Billing period** : `Recurring` → `Monthly`
     - **Currency** : `EUR`
     - Cliquer sur **Save price**
     - **Copier le Price ID** : `price_xxxxxxxxxxxxx` → C'est votre `PRICE_ID_PRO_MONTHLY`

   ### Produit 4 : OneLink Pro (Yearly)
   - Dans le même produit "OneLink Pro", cliquer sur **Add pricing**
   - **Price** : `115.00` (€12/mois × 12 avec 20% de remise)
   - **Billing period** : `Recurring` → `Yearly`
   - **Currency** : `EUR`
   - Cliquer sur **Save price**
   - **Copier le Price ID** : `price_xxxxxxxxxxxxx` → C'est votre `PRICE_ID_PRO_YEARLY`

3. **⚠️ IMPORTANT : Copier les 4 Price IDs** - vous en aurez besoin dans votre code pour gérer les différents plans

---

## Étape 2 : Récupérer les Clés API Stripe

1. **Aller dans Stripe Dashboard** → **Developers** → **API keys**

2. **Copier la Secret key :**
   - Vous verrez deux clés : **Publishable key** (commence par `pk_`) et **Secret key** (commence par `sk_`)
   - **Copier la Secret key** (celle qui commence par `sk_test_` en mode test, ou `sk_live_` en production)
   - C'est votre `STRIPE_SECRET_KEY`

3. **⚠️ Note :** 
   - Mode **Test** : Utilisez les clés qui commencent par `sk_test_`
   - Mode **Production** : Utilisez les clés qui commencent par `sk_live_`

---

## Étape 3 : Configurer le Webhook Stripe

1. **Aller dans Stripe Dashboard** → **Developers** → **Webhooks**

2. **Ajouter un endpoint :**
   - Cliquer sur **Add endpoint**
   - **Endpoint URL** : 
     ```
     https://<votre-project-id>.supabase.co/functions/v1/stripe-webhook
     ```
     - Remplacez `<votre-project-id>` par votre ID de projet Supabase
     - Exemple : `https://tdxzkceksiqcvposgcsm.supabase.co/functions/v1/stripe-webhook`

3. **Sélectionner les événements à écouter :**
   - Cliquer sur **Select events**
   - Cocher ces 4 événements :
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
   - Cliquer sur **Add events**

4. **Copier le Signing secret :**
   - Une fois le webhook créé, cliquer sur le webhook dans la liste
   - Dans la section **Signing secret**, cliquer sur **Reveal** ou **Click to reveal**
   - **Copier le secret** (commence par `whsec_`)
   - C'est votre `STRIPE_WEBHOOK_SECRET`

---

## Étape 4 : Récapitulatif des Valeurs à Copier

Vous devez avoir ces valeurs :

1. ✅ **PRICE_ID_STARTER_MONTHLY** : `price_xxxxxxxxxxxxx` (Starter mensuel)
2. ✅ **PRICE_ID_STARTER_YEARLY** : `price_xxxxxxxxxxxxx` (Starter annuel)
3. ✅ **PRICE_ID_PRO_MONTHLY** : `price_xxxxxxxxxxxxx` (Pro mensuel)
4. ✅ **PRICE_ID_PRO_YEARLY** : `price_xxxxxxxxxxxxx` (Pro annuel)
5. ✅ **STRIPE_SECRET_KEY** : `sk_test_xxxxxxxxxxxxx` (depuis l'étape 2)
6. ✅ **STRIPE_WEBHOOK_SECRET** : `whsec_xxxxxxxxxxxxx` (depuis l'étape 3)

---

## Étape 5 : Ajouter les Variables dans Supabase

1. **Aller dans Supabase Dashboard** → Votre projet → **Edge Functions** → **Secrets**

2. **Ajouter chaque variable :**
   - Cliquer sur **Add secret**
   - Ajouter ces secrets un par un :
     - **Name** : `STRIPE_SECRET_KEY` → **Value** : (votre clé secrète Stripe)
     - **Name** : `STRIPE_WEBHOOK_SECRET` → **Value** : (votre webhook secret)
     - **Name** : `PRICE_ID_STARTER_MONTHLY` → **Value** : (Price ID Starter mensuel)
     - **Name** : `PRICE_ID_STARTER_YEARLY` → **Value** : (Price ID Starter annuel)
     - **Name** : `PRICE_ID_PRO_MONTHLY` → **Value** : (Price ID Pro mensuel)
     - **Name** : `PRICE_ID_PRO_YEARLY` → **Value** : (Price ID Pro annuel)
     - **Name** : `SITE_URL` → **Value** : `https://votre-domaine.com` (ou votre URL de production)
     - **Name** : `SUPABASE_URL` → **Value** : `https://<project-id>.supabase.co` (votre URL Supabase)
     - **Name** : `SUPABASE_SERVICE_ROLE_KEY` → **Value** : (depuis Supabase → Settings → API → service_role key)

3. **⚠️ Important :** 
   - Ces secrets sont partagés par **toutes** les Edge Functions
   - Assurez-vous que les noms sont exactement comme ci-dessus (majuscules/minuscules)

---

## Étape 6 : Déployer les Edge Functions

```bash
# Dans le terminal, depuis la racine du projet
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-portal
supabase functions deploy stripe-webhook
```

---

## Étape 7 : Tester le Webhook

1. **Dans Stripe Dashboard** → **Developers** → **Webhooks**
2. Cliquer sur votre webhook
3. Cliquer sur **Send test webhook**
4. Sélectionner un événement (ex: `checkout.session.completed`)
5. Vérifier que le webhook reçoit bien les événements (onglet **Events**)

---

## Checklist Finale

- [ ] 4 Produits créés dans Stripe (Starter Monthly, Starter Yearly, Pro Monthly, Pro Yearly)
- [ ] 4 Prix créés avec Price IDs copiés
- [ ] Secret key Stripe copiée
- [ ] Webhook créé avec endpoint Supabase
- [ ] 4 événements sélectionnés dans le webhook
- [ ] Webhook signing secret copié
- [ ] Tous les secrets ajoutés dans Supabase Edge Functions (8 secrets au total)
- [ ] Edge Functions déployées
- [ ] Webhook testé avec un événement test

## Prix en Euros (Récapitulatif)

| Plan | Mensuel | Annuel (20% off) | Économie |
|------|---------|------------------|----------|
| **Starter** | €6/mois | €58/an (€4.83/mois) | €14/an |
| **Pro** | €12/mois | €115/an (€9.58/mois) | €29/an |

---

## Mode Test vs Production

### Mode Test (Développement)
- Utilisez les clés qui commencent par `sk_test_`
- Les paiements sont simulés (cartes de test Stripe)
- Webhook peut pointer vers votre environnement de dev

### Mode Production
- Utilisez les clés qui commencent par `sk_live_`
- Créez un **nouveau webhook** pour la production
- Utilisez votre URL de production pour `SITE_URL`

---

## Cartes de Test Stripe (Mode Test)

Pour tester les paiements en mode test, utilisez ces cartes :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres

