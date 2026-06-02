import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { findBrandBySlug, productsByBrand, CATEGORIES } from "@/data/catalog";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/brand/$slug")({
  loader: ({ params }) => {
    const brand = findBrandBySlug(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ params }) => {
    const brand = findBrandBySlug(params.slug) ?? "Marque";
    return {
      meta: [
        { title: `${brand} — Soltani Signature` },
        { name: "description", content: `Découvrez la collection ${brand} disponible chez Soltani Signature.` },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Marque introuvable</h1>
        <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const all = useMemo(() => productsByBrand(Route.useParams().slug as never) /* placeholder */, []);
  // Re-derive properly:
  const params = Route.useParams();
  const products = useMemo(() => productsByBrand(params.slug), [params.slug]);
  const cats = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("recommended");

  const items = useMemo(() => {
    let list = cat === "all" ? products : products.filter((p) => p.category === cat);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort]);

  void all;

  return (
    <SiteLayout>
      <PageHero eyebrow="Maison" title={brand} subtitle="L'excellence d'une signature légendaire." />
      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{brand}</span>
      </div>

      <div className="container-luxe pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat("all")}
              className={`px-4 h-9 text-xs uppercase tracking-[0.2em] border rounded-sm transition ${
                cat === "all" ? "border-gold text-gold" : "border-border text-foreground/70 hover:text-gold"
              }`}
            >
              Tout ({products.length})
            </button>
            {cats.map((c) => {
              const label = CATEGORIES.find((x) => x.slug === c)?.name ?? c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 h-9 text-xs uppercase tracking-[0.2em] border rounded-sm transition ${
                    cat === c ? "border-gold text-gold" : "border-border text-foreground/70 hover:text-gold"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm"
          >
            <option value="recommended">Recommandés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>

        {items.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">Aucun produit disponible.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {items.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
