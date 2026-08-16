import { Link } from "@tanstack/react-router";
import { type Product } from "./ProductCard";
import { ProductCarousel } from "./ProductCarousel";

type ProductGridProps = {
  title: string;
  eyebrow: string;
  items: Product[];
  kicker?: string;
  viewAllTo?: "/meilleures-ventes" | "/nouvelles-arrivees";
  loadState?: "ready" | "loading" | "error";
  onRetry?: () => void;
};

export function ProductGrid({
  title,
  eyebrow,
  items,
  kicker,
  viewAllTo,
  loadState = "ready",
  onRetry,
}: ProductGridProps) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">
              {title}
            </h2>
            {kicker && <p className="text-muted-foreground mt-3 max-w-md">{kicker}</p>}
          </div>
          {viewAllTo ? (
            <Link
              to={viewAllTo}
              className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline"
            >
              Voir tout →
            </Link>
          ) : (
            <Link
              to="/category/$slug"
              params={{ slug: "montres" }}
              className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline"
            >
              Voir tout →
            </Link>
          )}
        </div>
        {loadState === "loading" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-live="polite">
            <span className="sr-only">Chargement des produits...</span>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3" aria-hidden="true">
                <div className="aspect-[4/5] animate-pulse rounded-sm bg-muted/70" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted/70" />
              </div>
            ))}
          </div>
        ) : loadState === "error" ? (
          <div className="flex flex-col items-center rounded-sm border border-dashed border-border bg-card/40 px-4 py-10 text-center sm:px-6 sm:py-12">
            <p className="text-sm text-muted-foreground">
              Le catalogue prend plus de temps que prévu à répondre.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm border border-gold px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Réessayer
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
            Aucun produit réel disponible pour le moment.
          </div>
        ) : (
          <ProductCarousel items={items} />
        )}
      </div>
    </section>
  );
}
