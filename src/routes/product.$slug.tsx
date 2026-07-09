import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { findCategory } from "@/data/catalog";
import {
  createProductReview,
  deleteProductReview,
  getCatalogProduct,
  getCatalogProducts,
  getMyProductReview,
  getProductReviews,
  updateProductReview,
  type ProductReview,
} from "@/lib/catalog-api";
import { getSession } from "@/lib/supabase";
import { CountdownInline, useStableDeadline } from "@/components/site/Countdown";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Share2, Shield, Truck, RotateCcw, Star, Minus, Plus, ChevronRight, Flame, ShoppingBag, Pencil, Trash2 } from "lucide-react";




export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }): Promise<{ product: Product; related: Product[] }> => {
    const product = await getCatalogProduct(params.slug).catch(() => null);
    if (!product) throw notFound();
    const apiProducts = await getCatalogProducts({ category: product.category }).catch(() => []);
    const related = apiProducts.filter((p: Product) => p.slug !== product.slug).slice(0, 4);
    return { product, related };
  },
  head: ({ params }) => {
    const title = "Produit — Soltani Signature";
    const description = "Découvrez nos produits authentiques chez Soltani Signature.";
    const url = `https://soltanisignature.com/product/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
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
      <div className="container-luxe py-32 text-center text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData() as { product: Product; related: Product[] };
  const gallery = product.gallery?.length ? product.gallery : [product.image, ...related.slice(0, 3).map((r: Product) => r.image)];
  const category = findCategory(product.category);
  const parentSlug = category?.kind === "sub" ? category.parent.slug : (category?.slug ?? product.category);
  const parentName = category?.kind === "sub" ? category.parent.name : (category?.name ?? "Catalogue");
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [shareMessage, setShareMessage] = useState("");
  const [reviewSummary, setReviewSummary] = useState({ total: 0, averageRating: 0 });
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

  const handleAddToCart = () => {
    if (!product.variantId) return;
    add({ id: product.variantId, productSlug: product.slug, variantId: product.variantId, name: product.name, brand: product.brand, price: product.price, image: product.image, variant: product.variantLabel ?? "Standard", qty });
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

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const specifications = useMemo(() => buildSpecifications(product, category?.name ?? product.category), [product, category]);

  return (
    <SiteLayout>
      <div className="container-luxe pt-8 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: parentSlug }} className="hover:text-gold">{parentName}</Link>
        {category?.kind === "sub" && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-gold">{category.name}</Link>
          </>
        )}
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
              onError={(event) => {
                event.currentTarget.src = "/placeholder.svg";
              }}
              className="h-full w-full object-contain object-center p-3 lg:p-4 transition-transform duration-500 group-hover:scale-150 cursor-zoom-in"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">−{discount}%</span>
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
            {product.oldPrice && <span className="text-xs sm:text-sm text-destructive font-semibold">Économisez {product.oldPrice - product.price} DT</span>}
          </div>
          {discount > 0 && (
            <PromoCountdown />
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
              onClick={() => toggle(product.slug)}
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
          <Link to="/checkout" className="flex w-full items-center justify-center text-center min-h-12 px-3 py-2 bg-ink text-cream text-[10px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold hover:opacity-90 rounded-sm leading-tight">
            <span className="text-center">Acheter maintenant — Paiement à la livraison</span>
          </Link>

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
          <ProductReviewsPanel slug={product.slug} onSummaryChange={setReviewSummary} />
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

function PromoCountdown() {
  const target = useStableDeadline(1, 18);
  return (
    <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-sm text-sm">
      <Flame className="h-4 w-4 text-destructive shrink-0" />
      <CountdownInline target={target} className="text-foreground" />
    </div>
  );
}

function ProductReviewsPanel({ slug, onSummaryChange }: { slug: string; onSummaryChange?: (summary: { total: number; averageRating: number }) => void }) {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [form, setForm] = useState({ rating: 5, title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const loadReviews = useCallback(async (nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await getProductReviews(slug, { page: nextPage, pageSize: 5 });
      setReviews(response.reviews);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.summary.total);
      setAverageRating(response.summary.averageRating);
      onSummaryChange?.(response.summary);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadMyReview = useCallback(async () => {
    try {
      const session = await getSession();
      setIsAuthenticated(Boolean(session?.accessToken));
      if (!session?.accessToken) return;

      const response = await getMyProductReview(slug);
      setMyReviewId(response.review?.id ?? null);
      if (response.review) {
        setForm({
          rating: response.review.rating,
          title: response.review.title ?? "",
          content: response.review.content,
        });
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadReviews(page);
  }, [loadReviews, page]);

  useEffect(() => {
    void loadMyReview();
  }, [loadMyReview]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.content.trim()) {
      setFormMessage("Votre avis ne peut pas être vide.");
      return;
    }

    setSaving(true);
    setFormMessage("");
    try {
      const input = {
        rating: form.rating,
        title: form.title.trim() || undefined,
        content: form.content.trim(),
      };
      const response = myReviewId
        ? await updateProductReview(slug, myReviewId, input)
        : await createProductReview(slug, input);
      setMyReviewId(response.review?.id ?? myReviewId);
      setFormMessage(myReviewId ? "Votre avis a été mis à jour." : "Votre avis a été publié.");
      setPage(1);
      await loadReviews(1);
    } catch (submitError) {
      setFormMessage(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer votre avis.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    setSaving(true);
    setFormMessage("");
    try {
      await deleteProductReview(slug, myReviewId);
      setMyReviewId(null);
      setForm({ rating: 5, title: "", content: "" });
      setFormMessage("Votre avis a été supprimé.");
      await loadReviews(1);
      setPage(1);
    } catch (deleteError) {
      setFormMessage(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer votre avis.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold">{total} avis</p>
          <p className="text-sm text-muted-foreground">Note moyenne : {averageRating ? `${averageRating}/5` : "aucune note"}</p>
        </div>
        <StarRating value={Math.round(averageRating)} />
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-semibold">Votre note</label>
            <select
              value={form.rating}
              onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} étoile{rating > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            maxLength={80}
            placeholder="Titre de votre avis (optionnel)"
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm"
          />
          <textarea
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            maxLength={800}
            rows={4}
            placeholder="Partagez votre expérience avec ce produit"
            className="w-full resize-none rounded-sm border border-border bg-background px-3 py-3 text-sm"
          />
          {formMessage && <p className="text-sm text-muted-foreground">{formMessage}</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-gold px-5 text-[12px] font-bold uppercase tracking-[0.18em] text-ink transition hover:bg-ink hover:text-gold disabled:opacity-60"
            >
              <Pencil className="h-4 w-4" /> {saving ? "Enregistrement..." : myReviewId ? "Modifier mon avis" : "Publier mon avis"}
            </button>
            {myReviewId && (
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-border px-5 text-[12px] font-bold uppercase tracking-[0.18em] transition hover:border-destructive hover:text-destructive disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> Supprimer
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="rounded-sm border border-border p-4 text-sm text-muted-foreground">
          <p className="mb-3">Connectez-vous ou créez un compte pour laisser votre avis.</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className="inline-flex h-10 items-center rounded-sm bg-gold px-4 text-xs font-bold uppercase tracking-widest text-ink">Se connecter</Link>
            <Link to="/register" className="inline-flex h-10 items-center rounded-sm border border-border px-4 text-xs font-bold uppercase tracking-widest text-foreground">S'inscrire</Link>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">Chargement des avis...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun avis pour le moment. Soyez le premier à partager votre expérience.</p>
      )}
      {!loading && !error && reviews.map((review) => (
        <article key={review.id} className="pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <span className="font-semibold">{review.authorName}</span>
              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
            <StarRating value={review.rating} />
          </div>
          {review.title && <p className="mb-1 text-sm font-semibold">{review.title}</p>}
          <p className="text-sm text-foreground/80 whitespace-pre-line">{review.content}</p>
        </article>
      ))}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="h-10 rounded-sm border border-border px-4 text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="h-10 rounded-sm border border-border px-4 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < value ? "fill-gold text-gold" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}

function buildSpecifications(product: Product, categoryName: string): Array<[string, string]> {
  const hiddenKeys = new Set(["couleur", "color", "taille", "size"]);
  const dynamicSpecs = Object.entries(product.attributes ?? {})
    .filter(([key]) => !hiddenKeys.has(normalizeSpecKey(key)))
    .map(([key, values]) => [formatSpecLabel(key), values.join(", ")] as [string, string])
    .filter(([, value]) => value.trim().length > 0);

  return [
    ["Marque", product.brand],
    ["Catégorie", categoryName],
    ["Référence", product.slug.toUpperCase()],
    ...dynamicSpecs,
  ];
}

function normalizeSpecKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatSpecLabel(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
}

