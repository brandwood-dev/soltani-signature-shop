## Correction

Réduire les indicateurs de sliders sur mobile à des micro-points ronds de 3px, actif = pilule 12px. Desktop inchangé.

### Fichiers

**1. `src/components/site/Hero.tsx`** (ligne 132)
Mobile : `h-[3px] w-[3px]` (inactif), `h-[3px] w-3` (actif). Desktop `md:` : garder barres `md:h-[2px] md:w-14 / md:w-7`.

**2. `src/components/site/Testimonials.tsx`** (ligne 101)
Points : `h-[3px] w-[3px]` inactif, `h-[3px] w-3` actif. `rounded-full` conservé.

**3. `src/components/site/TrustBar.tsx`** (ligne 73)
Points carousel mobile : `h-[3px] w-[3px]` inactif, `h-[3px] w-3` actif. Réduire `gap-1.5` → `gap-1`.

## Hors périmètre

Desktop, backend, autres pages, logique métier.
