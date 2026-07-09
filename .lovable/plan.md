# Plan d'optimisation des performances

Objectif : alléger et accélérer la plateforme (surtout mobile) sans toucher au design ni à la logique métier.

## 1. Home — chargement différé des sections below-the-fold

Actuellement `src/routes/index.tsx` importe et rend en un seul bloc : Hero, TrustBar, Categories, ProductGrid (x2), CollectionBanners, Brands, Packs, PromoBanner, Testimonials, Promo, Newsletter, Footer. Tout est monté au premier rendu.

Actions :
- Garder eager (dans le bundle initial) uniquement : `TopBar`, `CategoryNav`, `Header`, `Hero`, `TrustBar`, `Categories`, premier `ProductGrid` (Meilleures Ventes).
- Charger en `React.lazy` + `Suspense` (fallback = simple `div` réservant la hauteur pour éviter le CLS) : `CollectionBanners`, `Brands`, second `ProductGrid`, `Packs`, `PromoBanner`, `Testimonials`, `Promo`, `Newsletter`, `Footer`.
- Wrapper chaque section lazy dans un composant `<LazySection>` basé sur `IntersectionObserver` (rootMargin ~400px) qui ne monte le composant qu'à l'approche du viewport.

## 2. Images — priorités et formats

- Ajouter `loading="lazy"` et `decoding="async"` sur toutes les `<img>` sauf la slide active du Hero (qui reste `loading="eager"` + `fetchpriority="high"`).
- Ajouter `<link rel="preload" as="image">` de l'image de la 1re slide Hero dans le `head()` de `src/routes/index.tsx`.
- Ajouter `width`/`height` explicites là où ils manquent (ProductCard, Brands, Testimonials, PromoBanner, CollectionBanners) pour éviter le layout shift.
- Sur les URLs Cloudinary, ajouter les transformations `f_auto,q_auto,w_<taille>` (helper util) — pas de changement visuel, juste des fichiers plus petits.

## 3. Sliders / carousels — ne pas tout monter

- `Hero.tsx` : ne monter dans le DOM que la slide active (au lieu de garder AnimatePresence avec plusieurs children montés). Précharger la slide suivante seulement (`<link rel="preload">` dynamique ou `new Image()`).
- `ProductCarousel.tsx` : garder le rendu (scroll natif), mais les `<img>` des cartes hors écran passent en `loading="lazy"`. Réduire `autoPlayInterval` uniquement quand visible (pause via IntersectionObserver quand le carousel n'est pas visible → pas de setInterval qui tourne inutilement).
- `Testimonials`, `TrustBar`, `Brands` (marquee) : mettre l'animation/`setInterval` en pause quand hors viewport via IntersectionObserver.

## 4. Framer Motion — réduire le coût

- Home et sections lourdes utilisent `framer-motion` (Hero AnimatePresence, potentiellement d'autres). Remplacer les animations décoratives simples (fade/slide sans logique) par des animations CSS (`animate-fade-in` déjà défini dans `tailwind.config`) — supprime la dépendance runtime pour ces sections.
- Conserver `framer-motion` uniquement là où AnimatePresence est réellement nécessaire (transitions de slides Hero).
- Respecter `prefers-reduced-motion` : désactiver les animations non essentielles (marquee, autoplay carrousels, motion.div) via une media query.

## 5. Requêtes réseau — parallélisation et cache

- Les composants (Hero, Testimonials, Brands, TopBar) font chacun leur `fetch` en `useEffect`. Les cascader coûte cher au TTI mobile.
- Passer ces `fetch` dans le `loader` de la route (déjà en place pour products) via `queryClient.ensureQueryData`, puis lire côté composant avec `useSuspenseQuery` — un seul aller-retour SSR, plus rapide, et évite le flash "loading".
- Ajouter un timeout court + fallback pour l'API externe `soltani-signature-api.vercel.app` qui échoue actuellement (visible dans les logs réseau), afin d'éviter les retries qui bloquent le rendu.
- Ajouter `staleTime` (ex. 5 min) sur les queries de contenu quasi-statiques (hero, brands, testimonials, top-banner).

## 6. Composants globaux

- `CartDrawer`, `FloatingButtons`, `MobileBottomNav`, `SearchBox` (dialog) : passer en `lazy` + monter uniquement à l'ouverture (déjà partiellement le cas pour le Dialog interne, mais le composant lui-même peut être lazy).
- Supprimer les listeners globaux inutiles (resize/scroll non passifs) — audit rapide.

## 7. Bundle / build

- Vérifier que `autoCodeSplitting` de TanStack est actif (par défaut oui). S'assurer qu'aucun composant de route n'est `export`é (règle du template) — audit rapide des routes admin (grosses) pour éviter qu'elles ne pèsent sur les chunks partagés.
- Ajouter `preconnect` vers `res.cloudinary.com` dans `__root.tsx` `head().links`.

## 8. Vérification

- Après implémentation : lancer un audit Lighthouse mobile via Playwright headless (déjà dispo dans le sandbox) sur `/`, `/femme`, `/product/[slug]` — mesurer LCP, TBT, CLS avant/après.
- Vérifier visuellement (screenshots mobile + desktop) qu'aucun élément n'a bougé.

## Détails techniques

Fichiers principalement modifiés :
- `src/routes/index.tsx` — lazy imports + Suspense + preload LCP + head links preconnect
- `src/routes/__root.tsx` — `<link rel="preconnect">` Cloudinary
- `src/components/site/Hero.tsx` — 1 slide montée à la fois, preload next, IntersectionObserver pour pause autoplay
- `src/components/site/ProductCarousel.tsx` — pause autoplay hors viewport, lazy imgs
- `src/components/site/Testimonials.tsx`, `TrustBar.tsx`, `Brands.tsx` — pause hors viewport, respect reduced-motion
- `src/components/site/ProductCard.tsx` — `loading="lazy"`, `decoding="async"`, dimensions
- `src/lib/hero-api.ts`, `testimonials-api.ts`, `featured-brands-api.ts`, `marquee-api.ts` — intégration via TanStack Query dans loaders, staleTime, timeout+fallback
- Nouveau composant utilitaire `src/components/site/LazySection.tsx` (IntersectionObserver + Suspense wrapper)
- Nouveau helper `src/lib/cloudinary.ts` (transformation URL `f_auto,q_auto,w_*`)

Aucun changement de design, de couleurs, de typographie, de layout ou de logique métier. Uniquement du chargement différé, du cache, et de la réduction de travail runtime.
