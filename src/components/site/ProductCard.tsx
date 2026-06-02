import { Heart, Eye, ShoppingBag, Star } from "lucide-react";

export type Product = {
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: "Best Seller" | "Nouveau" | "Promo";
  rating?: number;
};

export function ProductCard({ p }: { p: Product }) {
  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return (
    <article className="group relative">
      <div className="relative aspect-square overflow-hidden bg-secondary/60 rounded-sm">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.badge === "Promo" || discount > 0 ? (
            <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">
              −{discount}%
            </span>
          ) : null}
          {p.badge === "Nouveau" && (
            <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-gold text-ink rounded-sm">
              Nouveau
            </span>
          )}
          {p.badge === "Best Seller" && (
            <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-cream text-ink rounded-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          aria-label="Ajouter à la wishlist"
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-ink/70 backdrop-blur text-cream hover:text-destructive hover:bg-cream transition"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <button className="flex-1 inline-flex items-center justify-center gap-2 h-10 bg-gold text-ink text-[11px] uppercase tracking-widest font-semibold hover:bg-gold-soft rounded-sm">
            <ShoppingBag className="h-3.5 w-3.5" /> Ajouter
          </button>
          <button aria-label="Quick view" className="grid h-10 w-10 place-items-center bg-ink/80 backdrop-blur text-cream border border-gold/30 hover:text-gold rounded-sm">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pt-4 pb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1.5">{p.brand}</p>
        <h3 className="text-sm font-medium text-cream line-clamp-1 group-hover:text-gold transition">{p.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold text-cream tabular-nums">{p.price} DT</span>
          {p.oldPrice && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">{p.oldPrice} DT</span>
          )}
        </div>
        {p.rating && (
          <div className="mt-1.5 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(p.rating!) ? "fill-gold text-gold" : "text-muted-foreground"}`} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
