import { Link } from "@tanstack/react-router";
import { type Product } from "./ProductCard";
import { ProductCarousel } from "./ProductCarousel";

export { BESTSELLERS, NEWARRIVALS } from "@/data/catalog";

export function ProductGrid({ title, eyebrow, items, kicker }: { title: string; eyebrow: string; items: Product[]; kicker?: string }) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">{title}</h2>
            {kicker && <p className="text-muted-foreground mt-3 max-w-md">{kicker}</p>}
          </div>
          <Link to="/category/$slug" params={{ slug: "montres" }} className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline">
            Voir tout →
          </Link>
        </div>
        <ProductCarousel items={items} />
      </div>
    </section>
  );
}
