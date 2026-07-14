import { Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import {
  createProductReview,
  deleteProductReview,
  getMyProductReview,
  getProductReviews,
  updateProductReview,
  type ProductReview,
} from "@/lib/catalog-api";
import { getSession } from "@/lib/supabase";

type Props = {
  slug: string;
  onSummaryChange?: (summary: { total: number; averageRating: number }) => void;
};

export function ProductReviewsPanel({ slug, onSummaryChange }: Props) {
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

  const loadReviews = useCallback(
    async (nextPage: number) => {
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
    },
    [slug, onSummaryChange],
  );

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
          <p className="text-sm text-muted-foreground">
            Note moyenne : {averageRating ? `${averageRating}/5` : "aucune note"}
          </p>
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
                <option key={rating} value={rating}>
                  {rating} étoile{rating > 1 ? "s" : ""}
                </option>
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
