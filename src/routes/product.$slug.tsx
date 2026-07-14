import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { getCatalogProduct, getCatalogProducts, getProductReviews, type ProductReview } from "@/lib/catalog-api";
import { LimitedOfferCountdown } from "@/components/site/LimitedOfferCountdown";
import { getActiveLimitedOffer, type PromoBanner } from "@/lib/promo-banners-api";
import { saveQuickCheckoutLine } from "@/lib/quick-checkout";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";
import { toUserFriendlyErrorMessage } from "@/lib/error-messages";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, productJsonLd, productReviewsJsonLd, seoMeta } from "@/lib/seo";
import { Heart, Share2, Shield, Truck, RotateCcw, Star, Minus, Plus, ChevronRight, Flame, ShoppingBag } from "lucide-react";

const ProductReviewsPanel = lazy(() =>
  import("@/components/site/ProductReviewsPanel").then((module) => ({ default: module.ProductReviewsPanel })),
);

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }): Promise<{
    product: Product;
    related: Product[];
    limitedOffer: PromoBanner | null;
    reviewSummary: { total: number; averageRating: number };
    reviewSamples: ProductReview[];
  }> => {
    const product = await getCatalogProduct(params.slug).catch(() => null);
    if (!product) throw notFound();

    return {
      product,
      related: [],
      limitedOffer: null,
      reviewSummary: { total: 0, averageRating: 0 },
      reviewSamples: [],
    };
  },
  head: ({ params, loaderData }) => {
    const product = loaderData?.product;
    const path = `/product/${params.slug}`;
    const title = product ? `${product.name} ? ${product.brand} | Soltani Signature` : "Produit ? Soltani Signature";
    const description = product?.description || (product ? `${product.name} par ${product.brand}, disponible chez Soltani Signature en Tunisie.` : "D?couvrez nos produits authentiques chez Soltani Signature.");
    const categoryName = product ? formatCategoryName(product.categoryName ?? product.category) : "Catalogue";
    return {
      meta: seoMeta({ title, description, path, image: product?.image, type: "product" }),
      links: [canonicalLink(path)],
      scripts: product
        ? [
            jsonLdScript(productJsonLd(product, loaderData?.reviewSummary)),
            ...productReviewsJsonLd(product, loaderData?.reviewSamples ?? []).map(jsonLdScript),
            jsonLdScript(breadcrumbJsonLd([
              { name: "Accueil", path: "/" },
              { name: categoryName, path: `/category/${product.category}` },
              { name: product.name, path },
            ])),
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Produit introuvable</h1>
        <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">{toUserFriendlyErrorMessage(error)}</div>
    </SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const navigate = useNavigate();
  const { product, reviewSummary: initialReviewSummary } = Route.useLoaderData() as { product: Product; reviewSummary: { total: number; averageRating: number } };
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const parentSlug = product.category;
  const parentName = formatCategoryName(product.categoryName ?? product.category);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [shareMessage, setShareMessage] = useState("");
  const [reviewSummary, setReviewSummary] = useState(initialReviewSummary);
  const [related, setRelated] = useState<Product[]>([]);
  const [limitedOffer, setLimitedOffer] = useState<PromoBanner | null>(null);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const isFavorite = has(product.slug);

  useEffect(() => {
    let activeRequest = true;
    getProductReviews(product.slug, { page: 1, pageSize: 1 })
      .then((response) => {
        if (activeRequest) setReviewSummary(response.summary);
      })
      .catch(() => {
        if (activeRequest) setReviewSummary({ total: 0, averageRating: 0 });
      });
    return () => {
      activeRequest = false;
    };
  }, [product.slug]);

  useEffect(() => {
    let activeRequest = true;
    getCatalogProducts({ category: product.category, limit: 5, summary: true })
      .then((apiProducts) => {
        if (activeRequest) setRelated(apiProducts.filter((item) => item.slug !== product.slug).slice(0, 4));
      })
      .catch(() => {
        if (activeRequest) setRelated([]);
      });
    return () => {
      activeRequest = false;
    };
  }, [product.category, product.slug]);

  useEffect(() => {
    if (!product.isPromotion) return;
    let activeRequest = true;
    getActiveLimitedOffer()
      .then((offer) => {
        if (activeRequest) setLimitedOffer(offer);
      })
      .catch(() => {
        if (activeRequest) setLimitedOffer(null);
      });
    return () => {
      activeRequest = false;
    };
  }, [product.isPromotion]);

  useEffect(() => {
    trackMetaPixelEvent("ViewContent", {
      content_ids: [product.variantId ?? product.id ?? product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "TND",
    });
  }, [product.id, product.name, product.price, product.slug, product.variantId]);

  const handleAddToCart = () => {
    if (!product.variantId) return;
    add({ id: product.variantId, productSlug: product.slug, variantId: product.variantId, name: product.name, brand: product.brand, price: product.price, image: product.image, variant: product.variantLabel ?? "Standard", qty });
    trackMetaPixelEvent("AddToCart", {
      content_ids: [product.variantId],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: product.variantId, quantity: qty, item_price: product.price }],
      value: product.price * qty,
      currency: "TND",
    });
  };

  const handleBuyNow = async () => {
    if (!product.variantId) return;
    saveQuickCheckoutLine({ id: product.variantId, productSlug: product.slug, variantId: product.variantId, name: product.name, brand: product.brand, price: product.price, image: product.image, variant: product.variantLabel ?? "Standard", qty });
    trackMetaPixelEvent("InitiateCheckout", {
      content_ids: [product.variantId],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: product.variantId, quantity: qty, item_price: product.price }],
      value: product.price * qty,
      currency: "TND",
    });
    await navigate({ to: "/checkout", search: { quick: "1" } });
  };
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description ?? product.name, url });
        setShareMessage("Produit partagé.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Lien copié.");
      }
    } catch {
      setShareMessage("Partage annulé.");
    }
    window.setTimeout(() => setShareMessage(""), 2500);
  };

  const discount = product.isPromotion ? product.discountPercentage ?? 0 : 0;
  const specifications = useMemo(() => buildSpecifications(product, parentName), [product, parentName]);

  return (
    <SiteLayout>
      <div className="container-luxe pt-8 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: parentSlug }} className="hover:text-gold">{parentName}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <section className="container-luxe py-8 grid lg:grid-cols-2 gap-12">
        <div className="flex flex-col-reverse gap-3 lg:grid lg:grid-cols-[80px_1fr] lg:gap-4 lg:flex-row">
          <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
            {gallery.map((g, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`shrink-0 w-16 h-16 lg:w-auto lg:h-auto aspect-square overflow-hidden rounded-sm border-2 transition ${active === i ? "border-gold" : "border-border hover:border-gold/50"}`}>
                <img
                  src={g}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg";
                  }}
                  className="h-full w-full object-contain object-center p-1 lg:p-2"
                />
              </button>
            ))}
          </div>
          <div className="relative group aspect-square overflow-hidden rounded-sm bg-card">
            <img
              src={gallery[active]}
              alt={product.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.svg";
              }}
              className="h-full w-full object-contain object-center p-3 lg:p-4 transition-transform duration-500 group-hover:scale-150 cursor-zoom-in"
            />
            {product.isPromotion && discount > 0 && (
              <span className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">-{discount}%</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">{product.brand}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(reviewSummary.averageRating) ? "fill-gold text-gold" : "text-muted-foreground"}`} />)}</div>
            <span className="text-[11px] sm:text-xs text-muted-foreground">{reviewSummary.total} avis · Réf. {product.slug.toUpperCase().slice(0, 10)}</span>
          </div>

          <div className="flex items-end gap-2 sm:gap-3 mb-6 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold tabular-nums">{product.price} DT</span>
            {product.oldPrice && <span className="text-base sm:text-lg text-muted-foreground line-through tabular-nums">{product.oldPrice} DT</span>}
            {product.isPromotion && product.oldPrice && <span className="text-xs sm:text-sm text-destructive font-semibold">Économisez {product.oldPrice - product.price} DT</span>}
          </div>
          {product.isPromotion && discount > 0 && limitedOffer?.endsAt && (
            <PromoCountdown endsAt={limitedOffer.endsAt} />
          )}

          <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
            {product.description ?? `Une pièce d'exception sélectionnée par nos experts. ${product.brand} incarne le raffinement et la précision dans les moindres détails.`}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <div className="flex items-center border border-border rounded-sm shrink-0">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-11 sm:w-12 grid place-items-center hover:text-gold"><Minus className="h-4 w-4" /></button>
              <span className="w-8 sm:w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="h-12 w-11 sm:w-12 grid place-items-center hover:text-gold"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={handleAddToCart} className="order-3 sm:order-none w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 h-12 px-3 bg-gold text-ink text-[11px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm whitespace-nowrap">
              <ShoppingBag className="h-4 w-4 shrink-0" /> Ajouter au panier
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isFavorite) {
                  trackMetaPixelEvent("AddToWishlist", {
                    content_ids: [product.variantId ?? product.id ?? product.slug],
                    content_name: product.name,
                    content_type: "product",
                    value: product.price,
                    currency: "TND",
                  });
                }
                toggle(product.slug);
              }}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`h-12 w-12 grid place-items-center border border-border hover:border-gold hover:text-gold rounded-sm shrink-0 ${isFavorite ? "text-destructive border-destructive/40" : ""}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Partager ce produit"
              className="h-12 w-12 grid place-items-center border border-border hover:border-gold hover:text-gold rounded-sm shrink-0"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          {shareMessage && <p className="mb-3 text-xs text-gold">{shareMessage}</p>}
          <button type="button" onClick={handleBuyNow} className="flex w-full items-center justify-center text-center min-h-12 px-3 py-2 bg-ink text-cream text-[10px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold hover:opacity-90 rounded-sm leading-tight">
            <span className="text-center">Acheter maintenant — Paiement à la livraison</span>
          </button>

          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
            {[{ I: Truck, t: "Livraison gratuite", s: "Dès 300 DT" }, { I: RotateCcw, t: "Retours 14j", s: "Sans frais" }, { I: Shield, t: "Authentique", s: "100% garanti" }].map(({ I, t, s }) => (
              <div key={t} className="text-center">
                <I className="h-5 w-5 mx-auto text-gold mb-2" />
                <p className="text-xs font-semibold">{t}</p>
                <p className="text-[10px] text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="container-luxe py-12 border-t border-border">
        <div className="flex gap-5 sm:gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-none">
          {[{ k: "desc", l: "Description" }, { k: "specs", l: "Spécifications" }, { k: "reviews", l: "Avis produit" }].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k as typeof tab)}
              className={`pb-4 text-xs sm:text-sm uppercase tracking-widest transition relative whitespace-nowrap ${tab === k ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              {l}
              {tab === k && <span className="absolute bottom-0 inset-x-0 h-px bg-gold" />}
            </button>
          ))}
        </div>
        {tab === "desc" && (
          <div className="max-w-3xl text-foreground/80 leading-relaxed space-y-4">
            <p className="whitespace-pre-line">{product.description?.trim() || "Description complète bientôt disponible."}</p>
          </div>
        )}
        {tab === "specs" && (
          <div className="max-w-3xl">
            {specifications.length > 0 ? (
              <dl className="divide-y divide-border">
                {specifications.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 py-3 text-sm">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune spécification disponible pour ce produit.</p>
            )}
          </div>
        )}
        {tab === "reviews" && (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement des avis...</p>}>
            <ProductReviewsPanel slug={product.slug} onSummaryChange={setReviewSummary} />
          </Suspense>
        )}
      </section>

      {related.length > 0 && (
        <section className="container-luxe py-16 border-t border-border">
          <h2 className="font-display text-3xl font-bold mb-8">Vous pourriez aimer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function PromoCountdown({ endsAt }: { endsAt: string }) {
  const [expired, setExpired] = useState(false);

  if (expired) return null;

  return (
    <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-sm text-sm">
      <Flame className="h-4 w-4 text-destructive shrink-0" />
      <LimitedOfferCountdown endsAt={endsAt} className="text-foreground" onExpire={() => setExpired(true)} />
    </div>
  );
}

function buildSpecifications(product: Product, categoryName: string): Array<[string, string]> {
  const dynamicSpecs = Object.entries(product.attributes ?? {})
    .map(([key, values]) => [formatSpecLabel(key), values.filter(Boolean).join(", ")] as [string, string])
    .filter(([, value]) => value.trim().length > 0);

  return [
    ["Marque", product.brand],
    ["Catégorie", categoryName],
    ["Référence", product.slug.toUpperCase()],
    ...dynamicSpecs,
  ];
}

function formatSpecLabel(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
}

function formatCategoryName(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
