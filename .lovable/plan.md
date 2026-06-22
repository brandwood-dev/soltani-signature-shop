
# Plan Backend Victoria's Secret — Phase 1

## 1. Activation Lovable Cloud
Provisionne PostgreSQL, Auth, Storage et fonctions serveur (zéro config externe).

## 2. Authentification
- Email / mot de passe + Google Sign-In
- Page `/auth` (login + signup) + `/reset-password`
- Table `profiles` (nom, prénom, téléphone, adresse) auto-créée à l'inscription via trigger
- Table `user_roles` + enum `app_role` (`admin`, `client`) + fonction `has_role()` security definer
- Compte admin unique seedé via migration (ton email)

## 3. Schéma base de données

**Catalogue**
- `categories` (slug, nom, image, ordre)
- `brands` (slug, nom, logo)
- `products` (slug, nom, description, prix, prix_promo, stock, brand_id, category_id, images[], featured, actif)

**Commerce**
- `carts` + `cart_items` (panier persistant par utilisateur)
- `orders` (numéro, user_id, statut, total, adresse livraison, méthode paiement, notes)
- `order_items` (snapshot produit au moment de l'achat)
- Statuts : `en_attente`, `confirmée`, `expédiée`, `livrée`, `annulée`

**Storage**
- Bucket `product-images` (public, upload admin uniquement)

## 4. Sécurité (RLS sur toutes les tables)
- Catalogue : lecture publique, écriture admin only
- Panier : chaque user accède au sien
- Commandes : user voit les siennes, admin voit tout
- Profils : chaque user lit/modifie le sien, admin lit tout

## 5. Dashboard Admin `/admin` (protégé par rôle)
Layout dédié avec sidebar + sous-routes :
- `/admin` — Vue d'ensemble (KPIs : CA, commandes du jour, stock bas, nouveaux clients)
- `/admin/produits` — Liste, création, édition, upload images, gestion stock & promo
- `/admin/categories` — CRUD catégories
- `/admin/marques` — CRUD marques
- `/admin/commandes` — Liste filtrée par statut, détail commande, changement de statut (déclenche email)
- `/admin/clients` — Liste clients, historique commandes

## 6. Frontend connecté à la BDD
- Pages catalogue (`/femme`, `/homme`, etc.) lisent depuis `products`
- `ProductCard`, carrousels : données réelles
- Panier (`useCart`) synchronisé en BDD pour utilisateurs connectés (localStorage pour invités, fusion à la connexion)
- Checkout crée une vraie commande → page de confirmation avec numéro
- Profil `/profile` : infos perso + historique commandes
- Wishlist persistée en BDD

## 7. Emails transactionnels (Resend)
Connexion via connecteur Lovable (tu cliques pour autoriser). Emails déclenchés :
- Inscription : bienvenue
- Reset password (géré par Auth)
- Confirmation de commande (client + copie admin)
- Changement de statut commande (expédiée, livrée)

## 8. Détails techniques

```text
src/
├─ routes/
│  ├─ auth.tsx, reset-password.tsx
│  ├─ _authenticated/
│  │  ├─ profile.tsx, wishlist.tsx
│  │  └─ _admin/
│  │     ├─ route.tsx          (gate has_role('admin'))
│  │     ├─ index.tsx          (dashboard)
│  │     ├─ produits.*.tsx
│  │     ├─ commandes.*.tsx
│  │     ├─ categories.tsx, marques.tsx, clients.tsx
│  └─ api/public/webhooks/*    (si besoin futur)
├─ lib/
│  ├─ products.functions.ts    (createServerFn)
│  ├─ orders.functions.ts
│  ├─ admin.functions.ts       (CRUD admin, vérifie has_role)
│  └─ emails.functions.ts      (Resend via gateway)
└─ integrations/supabase/*     (auto)
```

- `requireSupabaseAuth` sur toutes les fonctions serveur protégées
- `supabaseAdmin` chargé en `await import` uniquement dans handlers serveur
- Bearer attaché automatiquement via `attachSupabaseAuth` dans `src/start.ts`
- Resend appelé via connecteur (`LOVABLE_API_KEY` + `RESEND_API_KEY` injectés)

## 9. Livraison en plusieurs étapes

**Étape A** — Cloud activé + Auth (login/signup/Google/reset) + table `profiles` + `user_roles` + seed admin
**Étape B** — Schéma catalogue + RLS + Dashboard admin Produits/Catégories/Marques + Storage images
**Étape C** — Schéma commandes + panier BDD + checkout réel + page commandes admin + profil client
**Étape D** — Intégration Resend + emails (bienvenue, confirmation, changement statut)

Tu valides après chaque étape avant que je passe à la suivante.

---

**À me confirmer avant de démarrer l'étape A :**
- Ton email pour le compte admin seedé
- Tu veux Google Sign-In activé dès le départ ? (sinon email/password seul)
