import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { BESTSELLERS, NEWARRIVALS } from "@/components/site/ProductGrid";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";

const ALL: Product[] = [...BESTSELLERS, ...NEWARRIVALS];
const BRANDS = ["Tissot", "Rolex", "Cartier", "Ray-Ban", "Tom Ford", "YSL", "Porsche Design"];
const COLORS = ["Noir", "Or", "Argent", "Brun", "Rouge", "Bleu"];
const SIZES = ["S", "M", "L", "XL", "Unique"];

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.slug)} — Soltani Signature` },
      { name: "description", content: `Découvrez notre sélection ${params.slug} de luxe.` },
    ],
  }),
  component: CategoryPage,
});

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function CategoryPage() {
  const { slug } = Route.useParams();
  const [openFilters, setOpenFilters] = useState(false);
  const [price, setPrice] = useState(15000);
  const [brand, setBrand] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");

  const items = useMemo(() => {
    let list = [...ALL, ...ALL].map((p, i) => ({ ...p, name: `${p.name} ${i + 1}` }));
    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    list = list.filter((p) => p.price <= price);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [brand, price, sort]);

  const toggleBrand = (b: string) => setBrand((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const Filters = (
    <div className="space-y-8">
      <FilterBlock title="Marque">
        <div className="space-y-2.5">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={brand.includes(b)} onChange={() => toggleBrand(b)}
                className="h-4 w-4 accent-gold border-border" />
              <span className="text-sm text-foreground/80 group-hover:text-gold transition">{b}</span>
            </label>
          ))}
        </div>
      </FilterBlock>
      <FilterBlock title="Prix (max)">
        <input type="range" min={100} max={15000} step={100} value={price}
          onChange={(e) => setPrice(+e.target.value)} className="w-full accent-gold" />
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
      <PageHero eyebrow="Collection" title={cap(slug)} subtitle="Une sélection rigoureuse des meilleures pièces." />
      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{cap(slug)}</span>
      </div>

      <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <button onClick={() => setOpenFilters(true)} className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm">
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </button>
            <p className="text-sm text-muted-foreground hidden lg:block">{items.length} produits</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm">
              <option value="recommended">Recommandés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="new">Nouveautés</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {items.map((p, i) => (
              <Link key={i} to="/product/$slug" params={{ slug: `produit-${i + 1}` }}>
                <ProductCard p={p} />
              </Link>
            ))}
          </div>

          <div className="mt-16 flex justify-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} className={`h-10 w-10 text-sm border rounded-sm ${n === 1 ? "bg-gold text-ink border-gold" : "border-border hover:border-gold"}`}>{n}</button>
            ))}
          </div>
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
