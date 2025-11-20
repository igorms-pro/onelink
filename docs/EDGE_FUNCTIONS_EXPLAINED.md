# Edge Functions Supabase - Explication

## Qu'est-ce qu'une Edge Function ?

Une **Edge Function** est une fonction JavaScript/TypeScript qui tourne sur les serveurs de Supabase (pas dans votre navigateur).

### Analogie simple :
- **Frontend (React)** = Votre app dans le navigateur (visible par l'utilisateur)
- **Edge Function** = Code qui tourne sur le serveur (invisible, fait le travail en arrière-plan)

---

## Pourquoi utiliser des Edge Functions ?

### 1. **Sécurité**
- Les clés secrètes (Stripe, Supabase) ne sont jamais exposées au navigateur
- Le code sensible reste sur le serveur

### 2. **Accès privilégié**
- Peut utiliser `SUPABASE_SERVICE_ROLE_KEY` (permissions admin)
- Peut modifier n'importe quelle donnée (pas limité par RLS)

### 3. **Intégrations externes**
- Appeler Stripe API
- Recevoir des webhooks
- Appeler d'autres services

---

## Nos Edge Functions

### 1. `stripe-create-checkout`
**Rôle :** Créer une session Stripe Checkout quand l'utilisateur veut s'abonner

**Quand elle est appelée :**
- Utilisateur clique sur "Upgrade to Pro" ou "Get started" sur `/pricing`
- Le frontend appelle cette fonction

**Ce qu'elle fait :**
1. Vérifie que l'utilisateur est connecté (JWT token)
2. Récupère l'email et user_id depuis Supabase Auth
3. Crée ou trouve le customer Stripe
4. Crée une session Stripe Checkout avec le bon Price ID (Starter/Pro, Monthly/Yearly)
5. Retourne l'URL de checkout Stripe

**URL :** `https://<project>.supabase.co/functions/v1/stripe-create-checkout`

---

### 2. `stripe-webhook`
**Rôle :** Recevoir les événements Stripe (paiement réussi, abonnement annulé, etc.)

**Quand elle est appelée :**
- Automatiquement par Stripe quand un événement se produit
- Stripe envoie un POST avec les données de l'événement

**Ce qu'elle fait :**
1. Vérifie que l'événement vient bien de Stripe (signing secret)
2. Selon l'événement :
   - `checkout.session.completed` → Met le plan à "pro" ou "starter"
   - `customer.subscription.updated` → Met à jour le statut
   - `customer.subscription.deleted` → Remet le plan à "free"
3. Met à jour la table `users` dans Supabase

**URL :** `https://<project>.supabase.co/functions/v1/stripe-webhook`

---

### 3. `stripe-portal`
**Rôle :** Rediriger vers Stripe Customer Portal (gérer l'abonnement)

**Quand elle est appelée :**
- Utilisateur clique sur "Manage billing" dans Settings

**Ce qu'elle fait :**
1. Vérifie l'authentification
2. Trouve le customer Stripe
3. Crée une session Stripe Customer Portal
4. Retourne l'URL pour gérer l'abonnement

**URL :** `https://<project>.supabase.co/functions/v1/stripe-portal`

---

## Comment ça marche techniquement ?

### 1. **Déploiement**
```bash
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-portal
```

Les fonctions sont déployées sur les serveurs Supabase.

### 2. **Secrets**
Les secrets (clés Stripe, Price IDs, etc.) sont stockés dans :
- Supabase Dashboard → Edge Functions → Secrets
- Accessibles via `Deno.env.get("NOM_DU_SECRET")`

### 3. **Appel depuis le frontend**
```typescript
// Dans votre code React
const { data } = await supabase.functions.invoke("stripe-create-checkout", {
  body: { plan: "pro", period: "monthly" }
});
```

### 4. **Appel depuis Stripe (webhook)**
Stripe envoie automatiquement un POST vers votre webhook quand un événement se produit.

---

## Flow complet : Upgrade to Pro

1. **Utilisateur** clique sur "Upgrade to Pro" sur `/pricing`
2. **Frontend** appelle `stripe-create-checkout` avec `{ plan: "pro", period: "monthly" }`
3. **Edge Function** :
   - Vérifie l'auth
   - Crée session Stripe Checkout
   - Retourne l'URL Stripe
4. **Frontend** redirige vers Stripe Checkout
5. **Utilisateur** paie sur Stripe
6. **Stripe** envoie webhook `checkout.session.completed` à `stripe-webhook`
7. **Edge Function webhook** :
   - Met à jour `users.plan = "pro"`
   - Met à jour `users.status = "active"`
8. **Utilisateur** est redirigé vers `/dashboard?upgraded=1`
9. **Frontend** affiche le plan Pro

---

## Avantages vs Code dans le Frontend

| Frontend | Edge Function |
|----------|--------------|
| ❌ Expose les clés secrètes | ✅ Clés secrètes sur serveur |
| ❌ Limité par RLS | ✅ Accès admin complet |
| ❌ Peut être modifié par l'utilisateur | ✅ Code sécurisé sur serveur |
| ❌ Pas d'accès direct à Stripe | ✅ Appels API Stripe sécurisés |

---

## Résumé

**Edge Functions = Code backend qui tourne sur Supabase**

- Sécurisé (clés secrètes)
- Puissant (permissions admin)
- Intégrations externes (Stripe, etc.)

Sans Edge Functions, vous ne pourriez pas :
- Créer des sessions Stripe Checkout
- Recevoir des webhooks Stripe
- Mettre à jour les plans utilisateurs automatiquement

