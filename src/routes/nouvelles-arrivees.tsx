import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { getCatalogProducts } from "@/lib/catalog-api";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { PriceRangeSlider } from "@/components/site/PriceRangeSlider";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/nouvelles-arrivees")({
  loader: async (): Promise<{ products: Product[]; brands: string[] }> => {
    const [products, brands] = await Promise.all([
      getCatalogProducts({ featured: true, summary: true }).catch((): Product[] => []),
      getActiveFeaturedBrands().catch(() => []),
    ]);
    return { products, brands: brands.map((brand) => brand.name) };
  },
  head: () => ({
    meta: seoMeta({
      title: "Nouvelles Arrivées — Soltani Signature",
      description:
        "Découvrez les dernières nouveautés Soltani Signature : les pièces fraîchement arrivées dans notre sélection.",
      path: "/nouvelles-arrivees",
    }),
    links: [canonicalLink("/nouvelles-arrivees")],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Nouvelles Arrivées", path: "/nouvelles-arrivees" },
        ]),
      ),
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  const { products, brands: activeBrands } = Route.useLoaderData() as {
    products: Product[];
    brands: string[];
  };

  const baseList = useMemo(() => products.filter((p) => p.isFeatured), [products]);

  const brands = useMemo(
    () => activeBrands.filter((b) => baseList.some((p) => p.brand === b)).sort(),
    [activeBrands, baseList],
  );

  const [brand, setBrand] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sort, setSort] = useState("newest");
  const [openFilters, setOpenFilters] = useState(false);
  const [page, setPage] = useState(1);

  const priceBounds = useMemo(() => {
    if (baseList.length === 0) return { min: 0, max: 0 };
    const prices = baseList.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [baseList]);

  useEffect(() => {
    setPriceRange(([cMin, cMax]) => {
      if (priceBounds.max === 0) return [0, 0];
      if (cMin === 0 && cMax === 0) return [priceBounds.min, priceBounds.max];
      return [
        Math.max(priceBounds.min, Math.min(cMin, priceBounds.max)),
        Math.min(priceBounds.max, Math.max(cMax, priceBounds.min)),
      ];
    });
  }, [priceBounds.min, priceBounds.max]);

  const selectedPriceRange: [number, number] =
    priceRange[1] === 0 && priceBounds.max > 0 ? [priceBounds.min, priceBounds.max] : priceRange;

  const items = useMemo(() => {
    let list = baseList.filter(
      (p) => p.price >= selectedPriceRange[0] && p.price <= selectedPriceRange[1],
    );
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [baseList, brand, selectedPriceRange, sort]);

  useEffect(() => {
    setPage(1);
  }, [brand, sort, selectedPriceRange[0], selectedPriceRange[1]]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleBrand = (b: string) =>
    setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const activeCount =
    brand.length +
    (selectedPriceRange[0] > priceBounds.min || selectedPriceRange[1] < priceBounds.max ? 1 : 0);

  const resetFilters = () => {
    setBrand([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const Filters = (
    <div className="space-y-8">
      <Block title="Prix">
        <PriceRangeSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={selectedPriceRange}
          onChange={setPriceRange}
        />
      </Block>

      {brands.length > 0 && (
        <Block title="Marque">
          <div className="space-y-2.5">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={brand.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="h-4 w-4 accent-gold"
                />
                <span className="text-sm text-foreground/80 group-hover:text-gold transition">
                  {b}
                </span>
              </label>
            ))}
          </div>
        </Block>
      )}

      {activeCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full h-10 text-[11px] uppercase tracking-[0.25em] border border-gold/40 text-gold hover:bg-gold hover:text-ink transition rounded-sm"
        >
          Réinitialiser ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Fraîchement arrivés"
        title="Nouvelles Arrivées"
        subtitle="Les dernières pièces à rejoindre notre sélection signature."
      />

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Nouvelles Arrivées</span>
      </div>

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{baseList.length > 0 ? Filters : null}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border gap-3">
            {baseList.length > 0 && (
              <button
                onClick={() => setOpenFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filtres{" "}
                {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
              </button>
            )}
            <p className="text-sm text-muted-foreground hidden lg:block">
              {items.length} produit{items.length > 1 ? "s" : ""}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm"
            >
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {baseList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-5">
                Aucune nouveauté à afficher pour le moment.
              </p>
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-gold px-5 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition hover:bg-ink hover:text-gold"
              >
                Découvrir les produits
              </Link>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground">
              Aucun produit ne correspond à vos filtres.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
                {paginated.map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={(n) => {
                    setPage(n);
                    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpenFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Filtres</h3>
              <button onClick={() => setOpenFilters(false)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            {baseList.length > 0 ? Filters : null}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 border-b border-border">
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">{title}</h4>
      {children}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-10 px-4 border border-border rounded-sm text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:border-gold hover:text-gold transition"
      >
        Préc.
      </button>
      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-10 min-w-10 px-3 border rounded-sm text-sm transition ${
            n === page
              ? "border-gold text-gold"
              : "border-border text-foreground/70 hover:border-gold hover:text-gold"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-10 px-4 border border-border rounded-sm text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:border-gold hover:text-gold transition"
      >
        Suiv.
      </button>
    </nav>
  );
}
