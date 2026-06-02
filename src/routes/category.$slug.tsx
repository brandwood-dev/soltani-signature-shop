import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, PRODUCTS, findCategory, productsByCategory } from "@/data/catalog";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";

const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand)));
const COLORS = ["Noir", "Or", "Argent", "Brun", "Rouge", "Bleu"];
const SIZES = ["S", "M", "L", "XL", "Unique"];

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = findCategory(params.slug);
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const title = cat ? cat.name : "Catégorie";
    return {
      meta: [
        { title: `${title} — Soltani Signature` },
        { name: "description", content: `Découvrez notre sélection ${title.toLowerCase()} de luxe.` },
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
      <div className="container-luxe py-32 text-center text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const [openFilters, setOpenFilters] = useState(false);
  const [price, setPrice] = useState(20000);
  const [brand, setBrand] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");

  const items = useMemo(() => {
    let list = productsByCategory(category.slug);
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    list = list.filter((p) => p.price <= price);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category.slug, brand, price, sort]);

  const toggleBrand = (b: string) => setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const Filters = (
    <div className="space-y-8">
      <FilterBlock title="Marque">
        <div className="space-y-2.5">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={brand.includes(b)} onChange={() => toggleBrand(b)} className="h-4 w-4 accent-gold border-border" />
              <span className="text-sm text-foreground/80 group-hover:text-gold transition">{b}</span>
            </label>
          ))}
        </div>
      </FilterBlock>
      <FilterBlock title="Prix (max)">
        <input type="range" min={100} max={20000} step={100} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-gold" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>100 DT</span><span className="text-gold font-semibold">{price} DT</span>
        </div>
      </FilterBlock>
      <FilterBlock title="Couleur">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c} className="px-3 py-1.5 text-xs border border-border hover:border-gold hover:text-gold transition rounded-sm">{c}</button>
          ))}
        </div>
      </FilterBlock>
      <FilterBlock title="Taille">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} className="h-9 min-w-9 px-3 text-xs border border-border hover:border-gold hover:text-gold transition rounded-sm">{s}</button>
          ))}
        </div>
      </FilterBlock>
      <FilterBlock title="Genre">
        {["Homme", "Femme", "Unisexe"].map((g) => (
          <label key={g} className="flex items-center gap-3 cursor-pointer mb-2">
            <input type="radio" name="gender" className="accent-gold" />
            <span className="text-sm text-foreground/80">{g}</span>
          </label>
        ))}
      </FilterBlock>
    </div>
  );

  return (
    <SiteLayout>
      <PageHero eyebrow="Collection" title={category.name} subtitle="Une sélection rigoureuse des meilleures pièces." />
      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{category.name}</span>
      </div>

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <button onClick={() => setOpenFilters(true)} className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm">
              <SlidersHorizontal className="h-4 w-4" /> Filtres
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
