import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { getCatalogProducts } from "@/lib/catalog-api";
import type { Product } from "@/components/site/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Mes Favoris — Soltani Signature" },
      { name: "description", content: "Retrouvez les pièces de luxe que vous avez ajoutées à vos favoris." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { slugs, remove, reconcile } = useWishlist();
  const { add } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const items = products.filter((p) => slugs.includes(p.slug));

  const addToCartAndGo = (product: Product) => {
    if (!product.variantId) return;
    add({
      id: product.variantId,
      productSlug: product.slug,
      variantId: product.variantId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      variant: product.variantLabel ?? "Standard",
    });
    void navigate({ to: "/cart" });
  };

  useEffect(() => {
    getCatalogProducts()
      .then((items) => {
        setProducts(items);
        reconcile(items.map((p) => p.slug));
      })
      .catch(() => {
        setProducts([]);
      });
  }, [reconcile]);


  return (
    <SiteLayout>
      <PageHero eyebrow="Votre sélection" title="Mes Favoris" subtitle="Les pièces que vous aimez, rassemblées au même endroit." />

      <div className="container-luxe py-16">
        {items.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-gold/30 text-gold">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Votre liste de favoris est vide</h2>
            <p className="text-muted-foreground mb-8">
              Parcourez nos collections et ajoutez vos pièces préférées en cliquant sur le cœur.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 h-12 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{items.length} {items.length > 1 ? "pièces" : "pièce"} dans vos favoris</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((p) => (
                <article key={p.slug} className="group bg-card border border-border rounded-sm overflow-hidden flex flex-col">
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="relative aspect-square overflow-hidden block">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <button
                      onClick={(e) => { e.preventDefault(); remove(p.slug); }}
                      aria-label="Retirer des favoris"
                      className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur text-foreground hover:text-destructive transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">{p.brand}</p>
                    <h3 className="text-sm font-medium line-clamp-1 mb-2">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-base font-semibold tabular-nums">{p.price} DT</span>
                      {p.oldPrice && <span className="text-xs text-muted-foreground line-through tabular-nums">{p.oldPrice} DT</span>}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => addToCartAndGo(p)}
                        disabled={!p.variantId}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-10 bg-gold text-ink text-[11px] uppercase tracking-widest font-semibold hover:bg-ink hover:text-gold transition rounded-sm"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Ajouter
                      </button>
                      <button
                        onClick={() => remove(p.slug)}
                        aria-label="Retirer"
                        className="grid h-10 w-10 place-items-center border border-border hover:border-destructive hover:text-destructive transition rounded-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
