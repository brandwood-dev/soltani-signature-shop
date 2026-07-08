## Pourquoi le build échoue

Le build TypeScript échoue à cause de 28 erreurs concentrées dans **3 fichiers de route** — aucune ne concerne ta page CGV/Confidentialité/Mentions (qui est bien mise à jour).

### Cause racine

Dans chacun de ces fichiers, le loader appelle :

```ts
const products = await getCatalogProducts(...).catch(() => []);
```

Le fallback `() => []` retourne `never[]`. TypeScript infère alors le type de retour du loader comme `never[]`, ce qui fait perdre le type `Product[]` que TanStack Router expose via `useLoaderData()`. Résultat : tous les `.filter((p) => …)`, `.map((p) => …)`, clés `key={p.slug}`, etc. deviennent `any`/`unknown` → erreurs TS7006 / TS2322 / TS2345.

## Correctif (minimal, 3 fichiers)

Typer explicitement le fallback pour préserver `Product[]` :

1. **`src/routes/promotions.tsx`** (ligne 11)
   ```ts
   const products = await getCatalogProducts().catch((): Product[] => []);
   ```

2. **`src/routes/category.$slug.tsx`** (ligne 17)
   - Importer le type : `import { ProductCard, type Product } from "@/components/site/ProductCard";`
   - `const products = await getCatalogProducts({ category: params.slug }).catch((): Product[] => []);`

3. **`src/routes/brand.$slug.tsx`** (même patron)
   - Importer `type Product` depuis `@/components/site/ProductCard`
   - Typer le `.catch((): Product[] => [])`

Aucun autre changement — pas de logique métier ni d'UI touchée. Les erreurs TS7006/TS2322/TS2345 disparaissent d'un coup car le type `Product` remonte correctement dans les `useLoaderData()`.
