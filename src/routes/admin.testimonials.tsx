import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Star, Search, MapPin } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Testimonial, TestimonialInput } from "@/lib/testimonials-api";
import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  updateTestimonial,
} from "@/lib/testimonials-api";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
});

const GOUVERNORATS = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "La Manouba",
  "Le Kef",
  "Mahdia",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
] as const;

type EditableTestimonial = Testimonial & { isNew?: boolean };

const empty = (): EditableTestimonial => ({
  id: "new",
  rating: 5,
  name: "",
  text: "",
  gouvernorat: "Tunis",
  productTitle: "",
  productUrl: "",
  createdAt: "",
  updatedAt: "",
  isNew: true,
});

function Stars({ value, onChange }: { value: number; onChange?: (n: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n as 1 | 2 | 3 | 4 | 5)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableTestimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      items.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.text.toLowerCase().includes(q) ||
          t.gouvernorat.toLowerCase().includes(q) ||
          t.productTitle.toLowerCase().includes(q)
        );
      }),
    [items, query],
  );

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      setItems(await getAdminTestimonials());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les témoignages.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setError("");
      await deleteTestimonial(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const openNew = () => {
    setError("");
    setEditing(empty());
    setOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setError("");
    setEditing({ ...t, productUrl: t.productUrl ?? "" });
    setOpen(true);
  };

  const validate = (testimonial: EditableTestimonial) => {
    if (!testimonial.name.trim()) return "Le nom complet du client est obligatoire.";
    if (!testimonial.text.trim()) return "Le témoignage est obligatoire.";
    if (!testimonial.productTitle.trim()) return "Le titre de l'article acheté est obligatoire.";
    return "";
  };

  const toInput = (testimonial: EditableTestimonial): TestimonialInput => ({
    rating: testimonial.rating,
    name: testimonial.name.trim(),
    text: testimonial.text.trim(),
    gouvernorat: testimonial.gouvernorat,
    productTitle: testimonial.productTitle.trim(),
    productUrl: testimonial.productUrl?.trim() || undefined,
  });

  const save = async () => {
    if (!editing) return;

    const validationError = validate(editing);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editing.isNew) {
        await createTestimonial(toInput(editing));
      } else {
        await updateTestimonial(editing.id, toInput(editing));
      }
      setOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Avis clients"
        subtitle={`${items.length} témoignage(s) — affichés sur la page d'accueil`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau témoignage</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client, un produit…"
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {loading && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Chargement des témoignages…
              </CardContent>
            </Card>
          )}

          {!loading &&
            filtered.map((t) => (
              <Card key={t.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.gouvernorat}
                      </p>
                    </div>
                    <Stars value={t.rating} />
                  </div>
                  <p className="line-clamp-4 text-sm text-muted-foreground">"{t.text}"</p>
                  <div className="rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                    <span className="font-medium">Article : </span>
                    {t.productUrl ? (
                      <a href={t.productUrl} className="underline" target="_blank" rel="noreferrer">
                        {t.productTitle}
                      </a>
                    ) : (
                      <span>{t.productTitle || "—"}</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(t)}
                      aria-label="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(t.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          {!loading && filtered.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Aucun témoignage.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Nouveau témoignage" : "Modifier le témoignage"}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Stars
                  value={editing.rating}
                  onChange={(n) => setEditing({ ...editing, rating: n })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nom complet du client</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex: Salma Ben Ahmed"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Témoignage</Label>
                <Textarea
                  rows={4}
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  placeholder="Votre témoignage…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gouvernorat</Label>
                <Select
                  value={editing.gouvernorat}
                  onValueChange={(v) => setEditing({ ...editing, gouvernorat: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOUVERNORATS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Titre de l'article acheté</Label>
                <Input
                  value={editing.productTitle}
                  onChange={(e) => setEditing({ ...editing, productTitle: e.target.value })}
                  placeholder="Ex: Pack Parfum Découverte"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lien vers l'article (optionnel)</Label>
                <Input
                  value={editing.productUrl ?? ""}
                  onChange={(e) => setEditing({ ...editing, productUrl: e.target.value })}
                  placeholder="/product/pack-parfum-decouverte"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
