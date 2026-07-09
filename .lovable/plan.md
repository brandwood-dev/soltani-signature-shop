## Problème

Sur mobile, les indicateurs de sliders sont encore visibles ou rectangulaires :
- **Hero** : indicateurs cachés en `<md` mais réapparaissent dès 768px ; toujours des barres rectangulaires.
- **Testimonials (Avis clients)** : dots visibles à partir de `sm` (≥640px), style rectangulaire `h-[2px] w-5`.
- **TrustBar mobile** (badges) : mêmes petites barres rectangulaires.

L'utilisateur veut des indicateurs mobile petits et ronds (pas rectangulaires).

## Correction

Uniformiser en petits points ronds sur mobile, garder le style barre sur desktop.

### 1. `src/components/site/Hero.tsx`
Toujours afficher les indicateurs, mais style adaptatif :
- Mobile : cercle `h-1.5 w-1.5 rounded-full` (actif = `w-4` pilule dorée).
- Desktop (`md:`) : garder les barres existantes `h-[2px] w-14 / w-7`.

### 2. `src/components/site/Testimonials.tsx`
Retirer `hidden sm:flex` (les dots doivent rester utiles pour la navigation mobile).
Passer en points ronds : `h-1.5 w-1.5 rounded-full`, actif = `w-4 rounded-full bg-gold`.

### 3. `src/components/site/TrustBar.tsx`
Remplacer les barres du carousel mobile (`h-1 w-1/w-4`) par des points ronds cohérents : `h-1.5 w-1.5 rounded-full`, actif = `bg-gold`, inactif = `bg-foreground/25`.

## Hors périmètre

- Desktop inchangé.
- Aucun changement de logique, backend, ou layout global.
- Aucune modification des autres pages.
