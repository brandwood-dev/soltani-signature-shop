import { Link } from "@tanstack/react-router";
import { ProductCard, type Product } from "./ProductCard";

export { BESTSELLERS, NEWARRIVALS } from "@/data/catalog";

export function ProductGrid({ title, eyebrow, items, kicker }: { title: string; eyebrow: string; items: Product[]; kicker?: string }) {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">{title}</h2>
            {kicker && <p className="text-muted-foreground mt-3 max-w-md">{kicker}</p>}
          </div>
          <Link to="/category/$slug" params={{ slug: "montres" }} className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </div>
    </section>
  );
}
