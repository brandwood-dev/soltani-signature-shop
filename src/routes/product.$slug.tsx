import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, type Product, type ProductVariant } from "@/components/site/ProductCard";
import {
  getCatalogProduct,
  getCatalogProducts,
  getProductPreview,
  getProductReviews,
  type ProductReview,
} from "@/lib/catalog-api";
import { LimitedOfferCountdown } from "@/components/site/LimitedOfferCountdown";
import { getActiveLimitedOffer, type PromoBanner } from "@/lib/promo-banners-api";
import { saveQuickCheckoutLine } from "@/lib/quick-checkout";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";
import { toUserFriendlyErrorMessage } from "@/lib/error-messages";
import { getCategoryDisplayName } from "@/lib/category-name";
import {
  breadcrumbJsonLd,
  canonicalLink,
  jsonLdScript,
  productJsonLd,
  productReviewsJsonLd,
  seoMeta,
} from "@/lib/seo";
import {
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Eye,
  Flame,
  ShoppingBag,
} from "lucide-react";

const ProductReviewsPanel = lazy(() =>
  import("@/components/site/ProductReviewsPanel").then((module) => ({
    default: module.ProductReviewsPanel,
  })),
);

export const Route = createFileRoute("/product/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview:
      typeof search.preview === "string" && search.preview.length > 0 ? search.preview : undefined,
  }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({
    params,
    deps,
  }): Promise<{
    product: Product;
    related: Product[];
    limitedOffer: PromoBanner | null;
    reviewSummary: { total: number; averageRating: number };
    reviewSamples: ProductReview[];
    isPreview: boolean;
    previewExpiresAt: string | null;
  }> => {
    const preview = deps.preview ? await getProductPreview(deps.preview).catch(() => null) : null;
    const product = deps.preview
      ? (preview?.product ?? null)
      : await getCatalogProduct(params.slug).catch(() => null);
    if (!product) throw notFound();

    return {
      product,
      related: [],
      limitedOffer: null,
      reviewSummary: product.reviewSummary ?? { total: 0, averageRating: 0 },
      reviewSamples: [],
      isPreview: Boolean(deps.preview),
      previewExpiresAt: preview?.expiresAt ?? null,
    };
  },
  headers: ({ loaderData }) =>
    loaderData?.isPreview
      ? {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        }
      : undefined,
  head: ({ params, loaderData }) => {
    const product = loaderData?.product;
    const path = `/product/${params.slug}`;
    if (loaderData?.isPreview) {
      return {
        meta: seoMeta({
          title: product ? `Aperçu privé · ${product.name}` : "Aperçu privé · Soltani Signature",
          description: "Aperçu temporaire et non publié d’un produit Soltani Signature.",
          path,
          image: product?.image,
          type: "product",
          noindex: true,
        }),
        links: [],
        scripts: [],
      };
    }
    const title = product
      ? `${product.name} ? ${product.brand} | Soltani Signature`
      : "Produit ? Soltani Signature";
    const description =
      product?.description ||
      (product
        ? `${product.name} par ${product.brand}, disponible chez Soltani Signature en Tunisie.`
        : "D?couvrez nos produits authentiques chez Soltani Signature.");
    const categoryName = product
      ? getCategoryDisplayName(product.categoryName, product.category)
      : "Catalogue";
    return {
      meta: seoMeta({ title, description, path, image: product?.image, type: "product" }),
      links: [canonicalLink(path)],
      scripts: product
        ? [
            jsonLdScript(productJsonLd(product, loaderData?.reviewSummary)),
            ...productReviewsJsonLd(product, loaderData?.reviewSamples ?? []).map(jsonLdScript),
            jsonLdScript(
              breadcrumbJsonLd([
                { name: "Accueil", path: "/" },
                { name: categoryName, path: `/category/${product.category}` },
                { name: product.name, path },
              ]),
            ),
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Produit introuvable</h1>
        <Link to="/" className="text-gold underline">
          Retour à l'accueil
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">
        {toUserFriendlyErrorMessage(error)}
      </div>
    </SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const navigate = useNavigate();
  const {
    product,
    reviewSummary: initialReviewSummary,
    isPreview,
    previewExpiresAt,
  } = Route.useLoaderData();
  const productVariants = (product.variants ?? []).filter((variant) => variant.isActive);
  const variantAxes = (product.variantAxes ?? []).filter((axis) => axis.values.length > 0);
  const requiresOptionSelection = variantAxes.length > 0 && productVariants.length > 1;
  const initialVariant = productVariants.find((variant) => variant.isDefault) ?? productVariants[0];
  const initialOptions = requiresOptionSelection
    ? {}
    : Object.fromEntries(
        (initialVariant?.selections ?? []).map((selection) => [selection.axisKey, selection.value]),
      );
  const variantSelectionKey = productVariants
    .map(
      (variant) =>
        `${variant.id}:${variant.isDefault}:${variant.selections
          ?.map((selection) => `${selection.axisKey}=${selection.value}`)
          .join("|")}`,
    )
    .join("|");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions);
  const hasCompleteSelection = variantAxes.every((axis) => Boolean(selectedOptions[axis.key]));
  const selectedVariant = variantAxes.length
    ? hasCompleteSelection
      ? productVariants.find((variant) =>
          variantAxes.every((axis) =>
            variant.selections?.some(
              (selection) =>
                selection.axisKey === axis.key && selection.value === selectedOptions[axis.key],
            ),
          ),
        )
      : undefined
    : initialVariant;
  const gallery = useMemo(() => {
    const baseGallery = product.gallery?.length ? product.gallery : [product.image];
    return selectedVariant?.imageUrl
      ? [
          selectedVariant.imageUrl,
          ...baseGallery.filter((image) => image !== selectedVariant.imageUrl),
        ]
      : baseGallery;
  }, [product.gallery, product.image, selectedVariant?.imageUrl]);
  const selectedPrice = selectedVariant?.price ?? product.price;
  const hasValidComparePrice = Boolean(product.oldPrice && product.oldPrice > selectedPrice);
  const selectedReference =
    selectedVariant?.reference || selectedVariant?.sku || product.slug.toUpperCase();
  const canPurchase =
    Boolean(selectedVariant?.id ?? product.variantId) &&
    (!requiresOptionSelection || Boolean(selectedVariant));
  const parentSlug = product.category;
  const parentName = getCategoryDisplayName(product.categoryName, product.category);
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
    setSelectedOptions(initialOptions);
  }, [product.slug, requiresOptionSelection, variantSelectionKey]);

  useEffect(() => {
    setQty(1);
    setActive(0);
  }, [selectedVariant?.id]);

  const selectOption = (axisIndex: number, axisKey: string, value: string) => {
    setSelectedOptions((current) => {
      const next = Object.fromEntries(
        variantAxes
          .slice(0, axisIndex)
          .filter((axis) => current[axis.key])
          .map((axis) => [axis.key, current[axis.key]]),
      );
      next[axisKey] = value;
      return next;
    });
  };

  const optionIsAvailable = (axisIndex: number, axisKey: string, value: string) =>
    productVariants.some(
      (variant) =>
        variant.stockQuantity > 0 &&
        variant.selections?.some(
          (selection) => selection.axisKey === axisKey && selection.value === value,
        ) &&
        variantAxes.slice(0, axisIndex).every((axis) => {
          const selected = selectedOptions[axis.key];
          return (
            !selected ||
            variant.selections?.some(
              (selection) => selection.axisKey === axis.key && selection.value === selected,
            )
          );
        }),
    );

  useEffect(() => {
    if (isPreview) {
      setReviewSummary(initialReviewSummary);
      return;
    }
    if (product.reviewSummary) {
      setReviewSummary(product.reviewSummary);
      return;
    }
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
  }, [initialReviewSummary, isPreview, product.reviewSummary, product.slug]);

  useEffect(() => {
    if (isPreview) {
      setRelated([]);
      return;
    }
    let activeRequest = true;
    getCatalogProducts({ category: product.category, limit: 5, summary: true })
      .then((apiProducts) => {
        if (activeRequest)
          setRelated(apiProducts.filter((item) => item.slug !== product.slug).slice(0, 4));
      })
      .catch(() => {
        if (activeRequest) setRelated([]);
      });
    return () => {
      activeRequest = false;
    };
  }, [isPreview, product.category, product.slug]);

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
    if (isPreview) return;
    trackMetaPixelEvent("ViewContent", {
      content_ids: [product.variantId ?? product.id ?? product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "TND",
    });
  }, [isPreview, product.id, product.name, product.price, product.slug, product.variantId]);

  const handleAddToCart = () => {
    const variantId = selectedVariant?.id ?? product.variantId;
    if (isPreview || !variantId || !canPurchase) return;
    const variantLabel = selectedVariant?.label ?? product.variantLabel ?? "Standard";
    const image = selectedVariant?.imageUrl ?? product.image;
    add({
      id: variantId,
      productSlug: product.slug,
      variantId,
      name: product.name,
      brand: product.brand,
      price: selectedPrice,
      image,
      variant: variantLabel,
      variantReference: selectedVariant?.reference,
      variantColorHex: selectedVariant?.colorHex,
      qty,
    });
    trackMetaPixelEvent("AddToCart", {
      content_ids: [variantId],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: variantId, quantity: qty, item_price: selectedPrice }],
      value: selectedPrice * qty,
      currency: "TND",
    });
  };

  const handleBuyNow = async () => {
    const variantId = selectedVariant?.id ?? product.variantId;
    if (isPreview || !variantId || !canPurchase) return;
    const variantLabel = selectedVariant?.label ?? product.variantLabel ?? "Standard";
    const image = selectedVariant?.imageUrl ?? product.image;
    saveQuickCheckoutLine({
      id: variantId,
      productSlug: product.slug,
      variantId,
      name: product.name,
      brand: product.brand,
      price: selectedPrice,
      image,
      variant: variantLabel,
      variantReference: selectedVariant?.reference,
      variantColorHex: selectedVariant?.colorHex,
      qty,
    });
    trackMetaPixelEvent("InitiateCheckout", {
      content_ids: [variantId],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: variantId, quantity: qty, item_price: selectedPrice }],
      value: selectedPrice * qty,
      currency: "TND",
    });
    await navigate({ to: "/checkout", search: { quick: "1" } });
  };
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description ?? product.name,
          url,
        });
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

  const discount = product.isPromotion ? (product.discountPercentage ?? 0) : 0;
  const specifications = useMemo(
    () => buildSpecifications(product, parentName, selectedVariant),
    [product, parentName, selectedVariant],
  );

  return (
    <SiteLayout>
      {isPreview ? (
        <div className="border-y border-gold/40 bg-ink text-cream" role="status">
          <div className="container-luxe flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold">
                <Eye className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Aperçu privé
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-cream/75">
                  Version temporaire non publiée. Les actions d’achat et de partage sont
                  désactivées.
                </p>
              </div>
            </div>
            {previewExpiresAt ? (
              <p className="pl-12 text-[11px] text-cream/60 sm:pl-0 sm:text-right">
                Expire à {formatPreviewExpiration(previewExpiresAt)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="container-luxe pt-8 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: parentSlug }} className="hover:text-gold">
          {parentName}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <section className="container-luxe py-8 grid lg:grid-cols-2 gap-12">
        <div className="flex flex-col-reverse gap-3 lg:grid lg:grid-cols-[80px_1fr] lg:gap-4 lg:flex-row">
          <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-16 h-16 lg:w-auto lg:h-auto aspect-square overflow-hidden rounded-sm border-2 transition ${active === i ? "border-gold" : "border-border hover:border-gold/50"}`}
              >
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
              <span className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">{product.brand}</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {isPreview ? null : (
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(reviewSummary.averageRating) ? "fill-gold text-gold" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            )}
            <span className="text-[11px] sm:text-xs text-muted-foreground">
              {isPreview ? "Données du formulaire" : `${reviewSummary.total} avis`} · Réf.{" "}
              {selectedReference}
            </span>
          </div>

          <div className="flex items-end gap-2 sm:gap-3 mb-6 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold tabular-nums">{selectedPrice} DT</span>
            {hasValidComparePrice && (
              <span className="text-base sm:text-lg text-muted-foreground line-through tabular-nums">
                {product.oldPrice} DT
              </span>
            )}
            {product.isPromotion && hasValidComparePrice && product.oldPrice && (
              <span className="text-xs sm:text-sm text-destructive font-semibold">
                Économisez {product.oldPrice - selectedPrice} DT
              </span>
            )}
          </div>
          {product.isPromotion && discount > 0 && limitedOffer?.endsAt && (
            <PromoCountdown endsAt={limitedOffer.endsAt} />
          )}

          <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
            {product.description ??
              `Une pièce d'exception sélectionnée par nos experts. ${product.brand} incarne le raffinement et la précision dans les moindres détails.`}
          </p>

          {variantAxes.length > 0 && productVariants.length > 0 ? (
            <div className="mb-6 space-y-4 rounded-sm border border-border bg-card/50 p-3 sm:p-4">
              {variantAxes.map((axis, axisIndex) => {
                const selectedValue = axis.values.find(
                  (value) => value.value === selectedOptions[axis.key],
                );
                return (
                  <fieldset key={axis.id || axis.key}>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em]">
                      {axis.label}
                      {selectedValue ? (
                        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                          {selectedValue.label}
                          {selectedValue.code ? ` · Réf. ${selectedValue.code}` : ""}
                        </span>
                      ) : null}
                    </legend>

                    {axis.displayType === "select" ? (
                      <select
                        value={selectedOptions[axis.key] ?? ""}
                        onChange={(event) => selectOption(axisIndex, axis.key, event.target.value)}
                        className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold sm:max-w-xs"
                        aria-label={`Choisir ${axis.label}`}
                      >
                        <option value="">Choisir {axis.label.toLowerCase()}</option>
                        {axis.values.map((value) => {
                          const available = optionIsAvailable(axisIndex, axis.key, value.value);
                          return (
                            <option
                              key={value.id || value.value}
                              value={value.value}
                              disabled={!available}
                            >
                              {value.label}
                              {available ? "" : " - Indisponible"}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2.5">
                        {axis.values.map((value) => {
                          const isSelected = selectedOptions[axis.key] === value.value;
                          const isUnavailable = !optionIsAvailable(
                            axisIndex,
                            axis.key,
                            value.value,
                          );
                          return axis.displayType === "swatch" ? (
                            <button
                              key={value.id || value.value}
                              type="button"
                              onClick={() => selectOption(axisIndex, axis.key, value.value)}
                              disabled={isUnavailable}
                              aria-pressed={isSelected}
                              aria-label={`${value.label}${value.code ? `, référence ${value.code}` : ""}${isUnavailable ? ", indisponible" : ""}`}
                              title={`${value.label}${isUnavailable ? " - Indisponible" : ""}`}
                              className={`relative grid h-12 w-12 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${isSelected ? "ring-2 ring-ink ring-offset-2" : "hover:scale-105"} ${isUnavailable ? "cursor-not-allowed opacity-35" : ""}`}
                            >
                              <span
                                className="h-10 w-10 rounded-full border border-black/20 shadow-inner"
                                style={{ backgroundColor: value.colorHex || "#C47A7A" }}
                                aria-hidden="true"
                              />
                              {isSelected ? (
                                <span className="absolute inset-0 grid place-items-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  ✓
                                </span>
                              ) : null}
                            </button>
                          ) : (
                            <button
                              key={value.id || value.value}
                              type="button"
                              onClick={() => selectOption(axisIndex, axis.key, value.value)}
                              disabled={isUnavailable}
                              aria-pressed={isSelected}
                              className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${isSelected ? "border-ink bg-ink text-cream" : "border-border bg-background hover:border-gold"} ${isUnavailable ? "cursor-not-allowed line-through opacity-35" : ""}`}
                            >
                              {value.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </fieldset>
                );
              })}

              <div className="min-h-10 border-t border-border pt-3 text-sm">
                {selectedVariant ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p>
                      <span className="font-semibold">{selectedVariant.label}</span> · Réf.{" "}
                      {selectedReference}
                    </p>
                    <p
                      className={
                        selectedVariant.stockQuantity > 0 ? "text-emerald-700" : "text-destructive"
                      }
                    >
                      {selectedVariant.stockQuantity > 0
                        ? `${selectedVariant.stockQuantity} en stock`
                        : "Rupture de stock"}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-destructive">
                    Sélectionnez toutes les options avant d’ajouter ce produit au panier.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {isPreview ? (
            <div className="rounded-sm border border-gold/30 bg-gold/5 px-4 py-4 text-sm leading-relaxed text-foreground/80">
              Mode aperçu en lecture seule. Aucun panier, favori, partage ou achat ne sera
              enregistré.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <div className="flex items-center border border-border rounded-sm shrink-0">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-12 w-11 sm:w-12 grid place-items-center hover:text-gold"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 sm:w-10 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    disabled={Boolean(selectedVariant && qty >= selectedVariant.stockQuantity)}
                    className="h-12 w-11 sm:w-12 grid place-items-center hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !canPurchase || Boolean(selectedVariant && selectedVariant.stockQuantity <= 0)
                  }
                  className="order-3 sm:order-none w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 h-12 px-3 bg-gold text-ink text-[11px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" /> Ajouter au panier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isFavorite) {
                      trackMetaPixelEvent("AddToWishlist", {
                        content_ids: [
                          selectedVariant?.id ?? product.variantId ?? product.id ?? product.slug,
                        ],
                        content_name: product.name,
                        content_type: "product",
                        value: selectedPrice,
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
              {shareMessage ? <p className="mb-3 text-xs text-gold">{shareMessage}</p> : null}
              {!canPurchase && requiresOptionSelection ? (
                <p className="mb-3 text-center text-xs font-medium text-destructive">
                  Choisissez toutes les options pour continuer.
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={
                  !canPurchase || Boolean(selectedVariant && selectedVariant.stockQuantity <= 0)
                }
                className="flex w-full items-center justify-center text-center min-h-12 px-3 py-2 bg-ink text-cream text-[10px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold hover:opacity-90 rounded-sm leading-tight disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="text-center">Acheter maintenant — Paiement à la livraison</span>
              </button>
            </>
          )}

          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
            {[
              { I: Truck, t: "Livraison express", s: "Partout en Tunisie" },
              { I: RotateCcw, t: "Retours 14j", s: "Sans frais" },
              { I: Shield, t: "Authentique", s: "100% garanti" },
            ].map(({ I, t, s }) => (
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
          {[
            { k: "desc", l: "Description" },
            { k: "specs", l: "Spécifications" },
            ...(isPreview ? [] : [{ k: "reviews", l: "Avis produit" }]),
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setTab(k as typeof tab)}
              className={`pb-4 text-xs sm:text-sm uppercase tracking-widest transition relative whitespace-nowrap ${tab === k ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l}
              {tab === k && <span className="absolute bottom-0 inset-x-0 h-px bg-gold" />}
            </button>
          ))}
        </div>
        {tab === "desc" && (
          <div className="max-w-3xl text-foreground/80 leading-relaxed space-y-4">
            <p className="whitespace-pre-line">
              {product.description?.trim() || "Description complète bientôt disponible."}
            </p>
          </div>
        )}
        {tab === "specs" && (
          <div className="max-w-3xl">
            {specifications.length > 0 ? (
              <dl className="divide-y divide-border">
                {specifications.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 py-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune spécification disponible pour ce produit.
              </p>
            )}
          </div>
        )}
        {!isPreview && tab === "reviews" && (
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Chargement des avis...</p>}
          >
            <ProductReviewsPanel slug={product.slug} onSummaryChange={setReviewSummary} />
          </Suspense>
        )}
      </section>

      {!isPreview && related.length > 0 && (
        <section className="container-luxe py-16 border-t border-border">
          <h2 className="font-display text-3xl font-bold mb-8">Vous pourriez aimer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
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
      <LimitedOfferCountdown
        endsAt={endsAt}
        className="text-foreground"
        onExpire={() => setExpired(true)}
      />
    </div>
  );
}

function buildSpecifications(
  product: Product,
  categoryName: string,
  selectedVariant?: ProductVariant,
): Array<[string, string]> {
  const dynamicSpecs = Object.entries(product.attributes ?? {})
    .map(
      ([key, values]) =>
        [formatSpecLabel(key), values.filter(Boolean).join(", ")] as [string, string],
    )
    .filter(([, value]) => value.trim().length > 0);

  return [
    ["Marque", product.brand],
    ["Catégorie", categoryName],
    ["Référence", selectedVariant?.reference || selectedVariant?.sku || product.slug.toUpperCase()],
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

function formatPreviewExpiration(value: string) {
  const expiration = new Date(value);
  if (Number.isNaN(expiration.getTime())) return "bientôt";

  return new Intl.DateTimeFormat("fr-TN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Tunis",
  }).format(expiration);
}
