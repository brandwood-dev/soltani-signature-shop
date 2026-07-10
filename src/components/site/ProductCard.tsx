import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug?: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: "Best Seller" | "Nouveau" | "Promo";
  isPromotion?: boolean;
  discountPercentage?: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating?: number;
  variantId?: string;
  variantLabel?: string;
  stockQuantity?: number;
  description?: string;
  gallery?: string[];
  attributes?: Record<string, string[]>;
};

export function ProductCard({ p }: { p: Product }) {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const navigate = useNavigate();
  const fav = has(p.slug);
  const promoDiscount = p.discountPercentage;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.variantId) return;
    add({ id: p.variantId, productSlug: p.slug, variantId: p.variantId, name: p.name, brand: p.brand, price: p.price, image: p.image, variant: p.variantLabel ?? "Standard" });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({ to: "/product/$slug", params: { slug: p.slug } });
  };

  return (
    <article className="group relative">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-card shadow-sm rounded-sm">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
            className="h-full w-full object-contain object-center p-3 transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {p.isPromotion && promoDiscount ? (
              <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">
                -{promoDiscount}%
              </span>
            ) : null}
            {p.badge === "Nouveau" && (
              <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-gold text-ink rounded-sm">
                Nouveau
              </span>
            )}
            {(p.isBestSeller || p.badge === "Best Seller") && (
              <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-foreground text-background rounded-sm">
                Best Seller
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={(e) => { e.preventDefault(); toggle(p.slug); }}
            className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition ${fav ? "text-destructive" : "text-foreground hover:text-destructive"}`}
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-destructive" : ""}`} />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex gap-2 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 bg-gold text-ink text-[11px] uppercase tracking-widest font-semibold hover:bg-ink hover:text-gold transition rounded-sm"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Ajouter
            </button>
            <button
              type="button"
              aria-label="Voir le produit"
              onClick={handleQuickView}
              className="grid h-10 w-10 place-items-center bg-background/85 backdrop-blur text-foreground border border-gold/30 hover:text-gold rounded-sm"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1.5">{p.brand}</p>
          <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-gold transition">{p.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-semibold text-foreground tabular-nums">{p.price} DT</span>
            {p.oldPrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">{p.oldPrice} DT</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
