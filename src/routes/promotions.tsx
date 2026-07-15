import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { LimitedOfferCountdown } from "@/components/site/LimitedOfferCountdown";
import { Flame, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { getCatalogProducts } from "@/lib/catalog-api";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { PriceRangeSlider } from "@/components/site/PriceRangeSlider";
import { getActiveLimitedOffer, type PromoBanner } from "@/lib/promo-banners-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/promotions")({
  loader: async (): Promise<{
    products: Product[];
    limitedOffer: PromoBanner | null;
    brands: string[];
  }> => {
    const [products, limitedOffer, brands] = await Promise.all([
      getCatalogProducts().catch((): Product[] => []),
      getActiveLimitedOffer().catch(() => null),
      getActiveFeaturedBrands().catch(() => []),
    ]);
    return { products, limitedOffer, brands: brands.map((brand) => brand.name) };
  },
  head: () => ({
    meta: seoMeta({
      title: "Promotions — Soltani Signature",
      description:
        "Toutes les offres promotionnelles Soltani Signature : parfums, soins, maquillage, cheveux et lifestyle.",
      path: "/promotions",
    }),
    links: [canonicalLink("/promotions")],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Promotions", path: "/promotions" },
        ]),
      ),
    ],
  }),
  component: PromotionsPage,
});

const DISCOUNT_TIERS = [
  { label: "10% et +", min: 10 },
  { label: "20% et +", min: 20 },
  { label: "30% et +", min: 30 },
];

function PromotionsPage() {
  const {
    products,
    limitedOffer,
    brands: activeBrands,
  } = Route.useLoaderData() as {
    products: Product[];
    limitedOffer: PromoBanner | null;
    brands: string[];
  };
  const [offerExpired, setOfferExpired] = useState(false);
  const allPromos = useMemo(
    () =>
      products
        .filter((p) => p.isPromotion)
        .map((p) => ({
          ...p,
          discount: p.discountPercentage ?? 0,
        })),
    [products],
  );

  const brands = useMemo(
    () =>
      activeBrands
        .filter((brandName) => allPromos.some((product) => product.brand === brandName))
        .sort(),
    [activeBrands, allPromos],
  );

  const [brand, setBrand] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sort, setSort] = useState("discount-desc");

  const priceBounds = useMemo(() => {
    if (allPromos.length === 0) return { min: 0, max: 0 };
    const prices = allPromos.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [allPromos]);

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
  const effectivePriceRange = useMemo<[number, number]>(() => {
    if (priceRange[1] === 0 && priceBounds.max > 0) {
      return [priceBounds.min, priceBounds.max];
    }

    return priceRange;
  }, [priceBounds.max, priceBounds.min, priceRange]);
  const [openFilters, setOpenFilters] = useState(false);

  const items = useMemo(() => {
    let list = allPromos.filter(
      (p) =>
        p.discount >= minDiscount &&
        p.price >= effectivePriceRange[0] &&
        p.price <= effectivePriceRange[1],
    );
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => b.discount - a.discount);
    return list;
  }, [allPromos, brand, effectivePriceRange, minDiscount, sort]);

  const toggleBrand = (b: string) =>
    setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const resetFilters = () => {
    setBrand([]);
    setMinDiscount(0);
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const activeCount =
    brand.length +
    (minDiscount > 0 ? 1 : 0) +
    (effectivePriceRange[0] > priceBounds.min || effectivePriceRange[1] < priceBounds.max ? 1 : 0);

  const renderFilters = (scope: string, isMobile = false) => (
    <div className={`space-y-8 ${isMobile ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : ""}`}>
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

      <Block title="Réduction">
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={`${scope}-disc`}
              checked={minDiscount === 0}
              onChange={() => setMinDiscount(0)}
              className="accent-gold"
            />
            <span className="text-sm text-foreground/80">Toutes</span>
          </label>
          {DISCOUNT_TIERS.map((d) => (
            <label key={d.min} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={`${scope}-disc`}
                checked={minDiscount === d.min}
                onChange={() => setMinDiscount(d.min)}
                className="accent-gold"
              />
              <span className="text-sm text-foreground/80">−{d.label}</span>
            </label>
          ))}
        </div>
      </Block>

      <Block title="Prix">
        <PriceRangeSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={effectivePriceRange}
          onChange={setPriceRange}
        />
      </Block>

      {isMobile && (
        <div className="sticky bottom-0 z-10 -mx-6 mt-8 border-t border-border bg-background/95 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetFilters}
              disabled={activeCount === 0}
              className="h-11 rounded-sm border border-gold/40 text-[11px] font-bold uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Réinitialiser
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
      <PageHero
        eyebrow="Offres exclusives"
        title="Promotions"
        subtitle="Une sélection rare de pièces signées à prix exceptionnels."
      />

      {limitedOffer?.endsAt && !offerExpired && (
        <div className="bg-ink text-cream py-5 border-y border-gold/20">
          <div className="container-luxe flex flex-wrap items-center justify-center gap-3 text-sm">
            <Flame className="h-4 w-4 text-destructive" />
            <span className="uppercase tracking-[0.2em] text-[11px] text-cream/70">
              Offres en cours —
            </span>
            <LimitedOfferCountdown
              endsAt={limitedOffer.endsAt}
              className="text-cream"
              onExpire={() => setOfferExpired(true)}
            />
          </div>
        </div>
      )}

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Promotions</span>
      </div>

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{allPromos.length > 0 ? renderFilters("desktop") : null}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border gap-3">
            {allPromos.length > 0 && (
              <button
                onClick={() => setOpenFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filtres{" "}
                {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
              </button>
            )}
            <p className="text-sm text-muted-foreground hidden lg:block">
              {items.length} offre{items.length > 1 ? "s" : ""}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm"
            >
              <option value="discount-desc">Meilleures réductions</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {allPromos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-5">
                Aucune promotion en cours. Restez connecté pour profiter de nos prochaines offres.
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
              Aucune promotion ne correspond à vos filtres.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {items.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
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
              <button onClick={() => setOpenFilters(false)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            {allPromos.length > 0 ? renderFilters("mobile", true) : null}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 border-b border-border">
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">
        {title}
      </h4>
      {children}
    </div>
  );
}
