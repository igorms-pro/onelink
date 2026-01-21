# Domaines Personnalisés - Guide Complet

## 🎯 Comment ça fonctionne avec votre domaine existant

### Votre situation
Vous avez déjà `igormorenosemedo.com` pour votre portfolio.

### Solutions possibles

#### Option 1: Sous-domaine (Recommandé) ✅

**Exemple :** `links.igormorenosemedo.com` ou `bio.igormorenosemedo.com`

**Comment ça marche :**
1. Dans OneLink Settings → Custom Domain, ajoutez `links.igormorenosemedo.com`
2. Dans votre DNS (chez votre registrar), ajoutez un **CNAME** :
   ```
   Type: CNAME
   Name: links
   Value: cname.vercel-dns.com
   ```
3. Vercel vérifie automatiquement le domaine (via Edge Function)
4. Une fois vérifié, `links.igormorenosemedo.com` affiche votre profil OneLink

**Avantages :**
- ✅ Votre portfolio reste sur `igormorenosemedo.com`
- ✅ Votre OneLink sur `links.igormorenosemedo.com`
- ✅ Pas de conflit entre les deux
- ✅ SSL automatique via Vercel

**Autres sous-domaines possibles :**
- `bio.igormorenosemedo.com`
- `link.igormorenosemedo.com`
- `me.igormorenosemedo.com`
- `contact.igormorenosemedo.com`

---

#### Option 2: Domaine apex (Plus complexe) ⚠️

**Exemple :** `igormorenosemedo.com` directement

**Problème :**
- ❌ Conflit avec votre portfolio existant
- ❌ Vous devriez choisir : portfolio OU OneLink sur le domaine principal
- ❌ Plus complexe à configurer (record A au lieu de CNAME)

**Si vous voulez quand même :**
1. Déplacer votre portfolio sur un sous-domaine (ex: `www.igormorenosemedo.com`)
2. Configurer `igormorenosemedo.com` pour OneLink
3. Ajouter un record **A** dans votre DNS :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

**Recommandation :** Utilisez un sous-domaine, c'est plus simple et vous gardez votre portfolio !

---

## 📋 Exemple concret : Votre cas

### Scénario recommandé

**Portfolio :** `igormorenosemedo.com` (reste comme avant)
**OneLink :** `links.igormorenosemedo.com` (nouveau)

**Configuration DNS :**
```
Type: CNAME
Name: links
Value: cname.vercel-dns.com
TTL: 3600 (ou auto)
```

**Résultat :**
- Visiteurs de `igormorenosemedo.com` → Voir votre portfolio
- Visiteurs de `links.igormorenosemedo.com` → Voir votre profil OneLink
- Partagez `links.igormorenosemedo.com` dans vos bios Instagram/Twitter/etc.

---

## 🔍 Comment OneLink détecte le domaine

Dans le code (`apps/web/src/routes/Profile/hooks/useProfileData.ts`), OneLink :

1. **Détecte le host** (`window.location.host`)
2. **Vérifie si c'est un domaine personnalisé** :
   - Cherche dans la table `custom_domains`
   - Vérifie que `verified = true`
3. **Charge le profil associé** au domaine
4. **Affiche le profil** avec tous les liens et drops

**Exemple de flow :**
```
Visiteur → links.igormorenosemedo.com
  ↓
OneLink détecte le domaine
  ↓
Query Supabase: SELECT * FROM custom_domains WHERE domain = 'links.igormorenosemedo.com' AND verified = true
  ↓
Trouve votre profil associé
  ↓
Affiche votre profil OneLink avec tous vos liens
```

---

## ✅ Avantages vs Linktree

**Linktree :**
- ❌ Pas de domaines personnalisés nativement
- ❌ Toujours `linktr.ee/votre-nom`
- ❌ Pas de contrôle sur le domaine

**OneLink :**
- ✅ Domaines personnalisés supportés
- ✅ `links.votredomaine.com` possible
- ✅ Contrôle total sur votre branding
- ✅ SEO meilleur (domaine à vous, pas linktr.ee)

---

## 🛠️ Configuration dans OneLink

1. **Aller dans Settings → Custom Domain** (nécessite plan Pro)
2. **Ajouter votre domaine** : `links.igormorenosemedo.com`
3. **Suivre les instructions DNS** affichées
4. **Attendre la vérification** (automatique via Edge Function)
5. **Une fois vérifié** : Le domaine pointe vers votre profil !

---

## 📝 Notes importantes

- **Plan Pro requis** : Les domaines personnalisés sont une fonctionnalité Pro
- **Vérification automatique** : L'Edge Function `domain-verify` vérifie périodiquement les domaines
- **SSL automatique** : Vercel génère automatiquement un certificat SSL
- **Propagation DNS** : Peut prendre quelques minutes à quelques heures

---

**Dernière mise à jour :** Janvier 2026
