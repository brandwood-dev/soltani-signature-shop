import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import {
  PRODUCTS,
  findCategory,
  productsByCategory,
  findParent,
} from "@/data/catalog";
import { getFacetsForCategory, type FacetDef } from "@/data/filters";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { getCatalogProducts } from "@/lib/catalog-api";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const cat = findCategory(params.slug);
    if (!cat) throw notFound();
    const products = await getCatalogProducts({ category: params.slug }).catch(() => []);
    return { category: cat, products };
  },
  head: ({ params }) => {
    const cat = findCategory(params.slug);
    const title = cat ? cat.name : "Catégorie";
    const fullTitle = `${title} — Soltani Signature`;
    const description = cat
      ? `Découvrez notre sélection ${title.toLowerCase()} de luxe chez Soltani Signature : marques d'exception, authenticité garantie, livraison rapide en Tunisie et paiement en 3 fois sans frais.`
      : "Explorez nos catégories de luxe : parfums, montres, maroquinerie, bijoux et cosmétiques signés des plus grandes maisons.";
    const url = `https://soltani-signature-shop.lovable.app/category/${params.slug}`;
    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: description },
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: fullTitle },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Catégorie introuvable</h1>
        <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  const [openFilters, setOpenFilters] = useState(false);
  const [price, setPrice] = useState(20000);
  const [brand, setBrand] = useState<string[]>([]);
  const [subFilter, setSubFilter] = useState<string | "all">("all");
  const [sort, setSort] = useState("recommended");
  const [facetSel, setFacetSel] = useState<Record<string, string[]>>({});

  const isParent = category.kind === "parent";
  const parent = isParent ? findParent(category.slug) : findParent(category.parent.slug);

  const baseList = useMemo(() => (products.length ? products : productsByCategory(category.slug)), [category.slug, products]);

  const brands = useMemo(
    () => Array.from(new Set(baseList.map((p) => p.brand))).sort(),
    [baseList],
  );

  const facets: FacetDef[] = useMemo(() => {
    if (isParent && parent) {
      return getFacetsForCategory(category.slug, parent.subs.map((s) => s.slug));
    }
    return getFacetsForCategory(category.slug);
  }, [category.slug, isParent, parent]);

  const items = useMemo(() => {
    let list = baseList;
    if (isParent && subFilter !== "all") {
      list = list.filter((p) => p.category === subFilter);
    }
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    list = list.filter((p) => p.price <= price);
    // Filtres dynamiques
    for (const [key, vals] of Object.entries(facetSel)) {
      if (!vals.length) continue;
      list = list.filter((p) => {
        const pv = p.attributes?.[key];
        if (!pv?.length) return false;
        return pv.some((v) => vals.includes(v));
      });
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [baseList, brand, price, sort, subFilter, isParent, facetSel]);

  const toggleBrand = (b: string) =>
    setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const toggleFacet = (key: string, val: string) =>
    setFacetSel((s) => {
      const curr = s[key] ?? [];
      const next = curr.includes(val) ? curr.filter((x) => x !== val) : [...curr, val];
      return { ...s, [key]: next };
    });

  const resetFacets = () => {
    setFacetSel({});
    setBrand([]);
    setPrice(maxBound);
  };

  const maxBound = Math.max(20000, ...baseList.map((p) => p.price), ...PRODUCTS.map((p) => p.price));
  const activeCount =
    brand.length +
    Object.values(facetSel).reduce((a, v) => a + v.length, 0) +
    (price < maxBound ? 1 : 0);

  const Filters = (
    <div className="space-y-8">
      {isParent && parent && parent.subs.length > 0 && (
        <FilterBlock title="Sous-catégorie">
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sub"
                checked={subFilter === "all"}
                onChange={() => setSubFilter("all")}
                className="accent-gold"
              />
              <span className="text-sm text-foreground/80">Toutes</span>
            </label>
            {parent.subs.map((s) => (
              <label key={s.slug} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="sub"
                  checked={subFilter === s.slug}
                  onChange={() => setSubFilter(s.slug)}
                  className="accent-gold"
                />
                <span className="text-sm text-foreground/80">{s.name}</span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      <FilterBlock title="Prix (max)">
        <input type="range" min={50} max={maxBound} step={50} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-gold" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>50 DT</span><span className="text-gold font-semibold">{price} DT</span>
        </div>
      </FilterBlock>

      <FilterBlock title="Marque">
        <div className="space-y-2.5">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={brand.includes(b)} onChange={() => toggleBrand(b)} className="h-4 w-4 accent-gold border-border" />
              <span className="text-sm text-foreground/80 group-hover:text-gold transition">{b}</span>
            </label>
          ))}
        </div>
      </FilterBlock>

      {facets.map((f) => (
        <FilterBlock key={f.key} title={f.label}>
          <div className="space-y-2.5">
            {f.options.map((o) => {
              const checked = (facetSel[f.key] ?? []).includes(o);
              return (
                <label key={o} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFacet(f.key, o)}
                    className="h-4 w-4 accent-gold border-border"
                  />
                  <span className="text-sm text-foreground/80 group-hover:text-gold transition">{o}</span>
                </label>
              );
            })}
          </div>
        </FilterBlock>
      ))}

      {activeCount > 0 && (
        <button
          onClick={resetFacets}
          className="w-full h-10 text-[11px] uppercase tracking-[0.25em] border border-gold/40 text-gold hover:bg-gold hover:text-ink transition rounded-sm"
        >
          Réinitialiser ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      <PageHero eyebrow={isParent ? "Univers" : category.parent.name} title={category.name} subtitle="Une sélection rigoureuse." />
      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        {!isParent && (
          <>
            <Link to="/category/$slug" params={{ slug: category.parent.slug }} className="hover:text-gold">
              {category.parent.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground">{category.name}</span>
      </div>

      {/* Quick links sous-cat pour parent */}
      {isParent && parent && (
        <div className="container-luxe pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubFilter("all")}
              className={`px-4 h-9 text-xs uppercase tracking-[0.2em] border rounded-sm transition ${
                subFilter === "all" ? "border-gold text-gold" : "border-border text-foreground/70 hover:text-gold"
              }`}
            >
              Tout
            </button>
            {parent.subs.map((s) => (
              <Link
                key={s.slug}
                to="/category/$slug"
                params={{ slug: s.slug }}
                className="px-4 h-9 inline-flex items-center text-xs uppercase tracking-[0.2em] border border-border text-foreground/70 hover:text-gold hover:border-gold transition rounded-sm"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <button onClick={() => setOpenFilters(true)} className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm">
              <SlidersHorizontal className="h-4 w-4" /> Filtres {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
            </button>
            <p className="text-sm text-muted-foreground hidden lg:block">{items.length} produits</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm">
              <option value="recommended">Recommandés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {items.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground">Aucun produit ne correspond à vos filtres.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {items.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpenFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Filtres</h3>
              <button onClick={() => setOpenFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            {Filters}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 border-b border-border">
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">{title}</h4>
      {children}
    </div>
  );
}
