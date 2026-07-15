import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { PriceRangeSlider } from "@/components/site/PriceRangeSlider";
import {
  findCategory,
  findParent,
} from "@/data/catalog";
import { getFacetsForCategory, type FacetDef } from "@/data/filters";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { getCatalogProducts } from "@/lib/catalog-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";
import {
  fallbackCategoryTree,
  findInCategoryTree,
  findParentInTree,
  loadCategoryTree,
  type CategoryTree,
} from "@/lib/categories-api";
import { toUserFriendlyErrorMessage } from "@/lib/error-messages";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const [categoryTree, activeBrands] = await Promise.all([
      loadCategoryTree().catch(() => fallbackCategoryTree()),
      getActiveFeaturedBrands().catch(() => []),
    ]);
    const cat = findInCategoryTree(params.slug, categoryTree) ?? findCategory(params.slug);
    if (!cat) throw notFound();
    const products = await getCatalogProducts({ category: params.slug }).catch((): Product[] => []);
    return { category: cat, categoryTree, products, brands: activeBrands.map((brand) => brand.name) };
  },
  head: ({ params, loaderData }) => {
    const cat = loaderData?.category ?? findCategory(params.slug);
    const title = cat ? cat.name : "Catégorie";
    const fullTitle = `${title} — Soltani Signature`;
    const description = cat
      ? `Découvrez notre sélection ${title.toLowerCase()} chez Soltani Signature : produits authentiques, livraison rapide en Tunisie et paiement à la livraison.`
      : "Explorez nos catégories beauté, parfums, soins, mode et lifestyle chez Soltani Signature.";
    const parent = cat?.kind === "sub" ? cat.parent : null;
    const path = `/category/${params.slug}`;
    return {
      meta: seoMeta({ title: fullTitle, description, path, image: cat?.image }),
      links: [canonicalLink(path)],
      scripts: [
        jsonLdScript(breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          ...(parent ? [{ name: parent.name, path: `/category/${parent.slug}` }] : []),
          { name: title, path },
        ])),
      ],
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
      <div className="container-luxe py-32 text-center text-muted-foreground">{toUserFriendlyErrorMessage(error)}</div>
    </SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, categoryTree, products, brands: activeBrands } = Route.useLoaderData() as {
    category: ReturnType<typeof findCategory> & object;
    categoryTree: CategoryTree[];
    products: Product[];
    brands: string[];
  };
  const [openFilters, setOpenFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [brand, setBrand] = useState<string[]>([]);
  const [subFilter, setSubFilter] = useState<string | "all">("all");
  const [sort, setSort] = useState("recommended");
  const [facetSel, setFacetSel] = useState<Record<string, string[]>>({});

  const isParent = category.kind === "parent";
  const parent = isParent
    ? findParentInTree(category.slug, categoryTree) ?? findParent(category.slug)
    : findParentInTree(category.parent.slug, categoryTree) ?? findParent(category.parent.slug);

  const baseList = useMemo(() => products, [products]);

  const priceBounds = useMemo(() => {
    if (baseList.length === 0) return { min: 0, max: 0 };
    const prices = baseList.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [baseList]);

  useEffect(() => {
    setPriceRange(([currentMin, currentMax]) => {
      if (priceBounds.max === 0) return [0, 0];
      if (currentMin === 0 && currentMax === 0) return [priceBounds.min, priceBounds.max];
      return [
        Math.max(priceBounds.min, Math.min(currentMin, priceBounds.max)),
        Math.min(priceBounds.max, Math.max(currentMax, priceBounds.min)),
      ];
    });
  }, [priceBounds.min, priceBounds.max]);

  const selectedPriceRange: [number, number] = priceRange[1] === 0 && priceBounds.max > 0 ? [priceBounds.min, priceBounds.max] : priceRange;

  const brands = useMemo(
    () => activeBrands.filter((brandName) => baseList.some((product) => product.brand === brandName)).sort(),
    [activeBrands, baseList],
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
    list = list.filter((p) => p.price >= selectedPriceRange[0] && p.price <= selectedPriceRange[1]);
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
  }, [baseList, brand, selectedPriceRange, sort, subFilter, isParent, facetSel]);

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
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const activeCount =
    brand.length +
    Object.values(facetSel).reduce((a, v) => a + v.length, 0) +
    (selectedPriceRange[0] > priceBounds.min || selectedPriceRange[1] < priceBounds.max ? 1 : 0);

  const renderFilters = (isMobile = false) => (
    <div className={`space-y-8 ${isMobile ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : ""}`}>
      {isParent && parent && parent.subs.length > 0 && (
        <FilterBlock title="Sous-catégorie">
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={isMobile ? "mobile-sub" : "desktop-sub"}
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
                  name={isMobile ? "mobile-sub" : "desktop-sub"}
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

      <FilterBlock title="Prix">
        <PriceRangeSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={selectedPriceRange}
          onChange={setPriceRange}
        />
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

      {!isMobile && activeCount > 0 && (
        <button
          onClick={resetFacets}
          className="w-full h-10 text-[11px] uppercase tracking-[0.25em] border border-gold/40 text-gold hover:bg-gold hover:text-ink transition rounded-sm"
        >
          Réinitialiser ({activeCount})
        </button>
      )}

      {isMobile && (
        <div className="sticky bottom-0 z-10 -mx-6 mt-8 border-t border-border bg-background/95 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetFacets}
              disabled={activeCount === 0}
              className="h-11 rounded-sm border border-gold/40 text-[11px] font-bold uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              RÃ©initialiser
            </button>
            <button
              type="button"
              onClick={() => setOpenFilters(false)}
              className="h-11 rounded-sm bg-gold text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition hover:bg-ink hover:text-gold"
            >
              Appliquer
            </button>
          </div>
        </div>
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
        <aside className="hidden lg:block">{renderFilters()}</aside>

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
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpenFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Filtres</h3>
              <button onClick={() => setOpenFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            {renderFilters(true)}
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
