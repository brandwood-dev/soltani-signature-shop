import { Link } from "@tanstack/react-router";
import { ProductCarousel } from "./ProductCarousel";
import type { Product } from "./ProductCard";

export function Packs({ items }: { items: Product[] }) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Coffrets</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">Nos Packs</h2>
            <p className="text-muted-foreground mt-3 max-w-md">Des sélections signature pensées comme des rituels.</p>
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: "coffrets-parfum" }}
            className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
            Aucun coffret parfum disponible pour le moment.
          </div>
        ) : (
          <ProductCarousel items={items} />
        )}
      </div>
    </section>
  );
}
