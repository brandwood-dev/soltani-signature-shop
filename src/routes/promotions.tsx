import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { LimitedOfferCountdown } from "@/components/site/LimitedOfferCountdown";
import { Flame, ChevronRight } from "lucide-react";
import { getCatalogProducts } from "@/lib/catalog-api";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { getActiveLimitedOffer, type PromoBanner } from "@/lib/promo-banners-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/promotions")({
  loader: async (): Promise<{ products: Product[]; limitedOffer: PromoBanner | null; brands: string[] }> => {
    const [products, limitedOffer, brands] = await Promise.all([
      getCatalogProducts().catch((): Product[] => []),
      getActiveLimitedOffer().catch(() => null),
      getActiveFeaturedBrands().catch(() => []),
    ]);
    return { products, limitedOffer, brands: brands.map((brand) => brand.name) };
  },
  head: () => ({
    meta: seoMeta({
      title: "Promotions ? Soltani Signature",
      description: "Toutes les offres promotionnelles Soltani Signature : parfums, soins, maquillage, cheveux et lifestyle.",
      path: "/promotions",
    }),
    links: [canonicalLink("/promotions")],
    scripts: [
      jsonLdScript(breadcrumbJsonLd([
        { name: "Accueil", path: "/" },
        { name: "Promotions", path: "/promotions" },
      ])),
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
  const { products, limitedOffer, brands: activeBrands } = Route.useLoaderData() as { products: Product[]; limitedOffer: PromoBanner | null; brands: string[] };
  const [offerExpired, setOfferExpired] = useState(false);
  const allPromos = useMemo(() => products.filter((p) => p.isPromotion).map((p) => ({
    ...p,
    discount: p.discountPercentage ?? 0,
  })), [products]);

  const brands = useMemo(
    () => activeBrands.filter((brandName) => allPromos.some((product) => product.brand === brandName)).sort(),
    [activeBrands, allPromos],
  );

  const [brand, setBrand] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sort, setSort] = useState("discount-desc");

  const items = useMemo(() => {
    let list = allPromos.filter((p) => p.discount >= minDiscount && p.price <= maxPrice);
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => b.discount - a.discount);
    return list;
  }, [allPromos, brand, minDiscount, maxPrice, sort]);

  const toggleBrand = (b: string) =>
    setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

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
            <span className="uppercase tracking-[0.2em] text-[11px] text-cream/70">Offres en cours —</span>
            <LimitedOfferCountdown endsAt={limitedOffer.endsAt} className="text-cream" onExpire={() => setOfferExpired(true)} />
          </div>
        </div>
      )}

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Promotions</span>
      </div>

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="space-y-8">
          <Block title="Marque">
            <div className="space-y-2.5">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={brand.includes(b)} onChange={() => toggleBrand(b)} className="h-4 w-4 accent-gold" />
                  <span className="text-sm text-foreground/80 group-hover:text-gold transition">{b}</span>
                </label>
              ))}
            </div>
          </Block>

          <Block title="Réduction">
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="disc" checked={minDiscount === 0} onChange={() => setMinDiscount(0)} className="accent-gold" />
                <span className="text-sm text-foreground/80">Toutes</span>
              </label>
              {DISCOUNT_TIERS.map((d) => (
                <label key={d.min} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="disc" checked={minDiscount === d.min} onChange={() => setMinDiscount(d.min)} className="accent-gold" />
                  <span className="text-sm text-foreground/80">−{d.label}</span>
                </label>
              ))}
            </div>
          </Block>

          <Block title="Prix (max)">
            <input type="range" min={100} max={20000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-gold" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>100 DT</span><span className="text-gold font-semibold">{maxPrice} DT</span>
            </div>
          </Block>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">{items.length} offre{items.length > 1 ? "s" : ""}</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm">
              <option value="discount-desc">Meilleures réductions</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {items.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground">Aucune promotion ne correspond à vos filtres.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {items.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          )}
        </div>
      </div>
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
