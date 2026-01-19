# Configuration des templates d'email Supabase

Ce guide explique comment configurer les templates d'email personnalisés pour les emails d'authentification Supabase.

## Templates disponibles

Les templates suivants ont été créés dans `supabase/functions/_shared/emails/` :

1. **supabase-magic-link.html** - Email de connexion (magic link)
2. **supabase-password-reset.html** - Réinitialisation de mot de passe
3. **supabase-email-change.html** - Changement d'email

## Configuration dans le dashboard Supabase

1. Allez dans votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Settings** → **Authentication** → **Email Templates**
3. Pour chaque template, copiez le contenu HTML correspondant :

### Magic Link (Confirmation)

- Template : `supabase-magic-link.html`
- Dans Supabase : **Magic Link** → **Confirmation**
- Copiez le contenu HTML du fichier

### Magic Link (Change Email)

- Template : `supabase-email-change.html`
- Dans Supabase : **Magic Link** → **Change Email**
- Copiez le contenu HTML du fichier

### Password Reset

- Template : `supabase-password-reset.html`
- Dans Supabase : **Password Reset**
- Copiez le contenu HTML du fichier

## Variables disponibles

Les templates utilisent les variables suivantes de Supabase :

- `{{ .ConfirmationURL }}` - URL de confirmation avec token
- `{{ .Email }}` - Adresse email de l'utilisateur
- `{{ .SiteURL }}` - URL de base du site
- `{{ .RedirectTo }}` - URL de redirection après confirmation
- `{{ .NewEmail }}` - Nouvelle adresse email (pour le changement d'email)
- `{{ .OldEmail }}` - Ancienne adresse email (pour les notifications)

## Notes importantes

- Les templates utilisent le logo depuis `https://getonelink.io/onelink-logo.png`
- Le style est cohérent avec les autres emails transactionnels de l'application
- Les liens expirent après 1 heure (configuré dans Supabase Auth settings)
- Après avoir copié les templates, testez-les en envoyant des emails de test depuis le dashboard Supabase
