## Problème

Le badge du cœur (Header) affiche le nombre de slugs stockés dans `localStorage` (`soltani-wishlist`), tandis que la page `/wishlist` n'affiche que les produits dont le slug existe encore dans `PRODUCTS` (`PRODUCTS.filter(p => slugs.includes(p.slug))`).

Après la restructuration du catalogue, d'anciens slugs sauvegardés dans le navigateur ne correspondent plus à aucun produit. Résultat :
- La page Favoris paraît vide (0 carte affichée).
- Aucun bouton "Retirer" n'est rendu pour ces slugs orphelins.
- Le compteur reste bloqué à 5 car les slugs orphelins restent dans `localStorage` et personne ne les nettoie.

## Correctif

1. **`src/hooks/useWishlist.ts`** — ajouter un utilitaire `reconcile(validSlugs: string[])` qui réécrit `localStorage` en ne gardant que les slugs présents dans la liste fournie, puis émet `wishlist:change`. Exposer cette fonction depuis le hook.

2. **`src/routes/wishlist.tsx`** — au montage, calculer l'ensemble des slugs valides à partir de `PRODUCTS` et appeler `reconcile` une fois si des slugs orphelins existent. Cela vide automatiquement les références mortes et remet le badge à la bonne valeur (0 quand la page est vide).

3. Optionnel défensif : dans le hook lui-même, au premier `read()` côté client, filtrer silencieusement contre `PRODUCTS` n'est pas faisable (cycle d'import). On garde donc la réconciliation côté page Favoris, qui est l'endroit naturel où l'utilisateur constate le souci.

Aucun changement visuel, uniquement de la cohérence d'état.