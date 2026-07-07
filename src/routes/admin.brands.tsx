import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { FeaturedBrand, FeaturedBrandInput } from "@/lib/featured-brands-api";
import {
  createFeaturedBrand,
  deleteFeaturedBrand,
  getAdminFeaturedBrands,
  reorderFeaturedBrands,
  toggleFeaturedBrand,
  updateFeaturedBrand,
} from "@/lib/featured-brands-api";

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrands,
});

const MIN_ACTIVE_BRANDS = 5;
const NAME_MAX = 80;

type EditableBrand = FeaturedBrand & { isNew?: boolean };

const emptyBrand = (sortOrder: number): EditableBrand => ({
  id: "new",
  name: "",
  logo: "",
  link: "",
  active: true,
  sortOrder,
  createdAt: "",
  updatedAt: "",
  isNew: true,
});

function AdminBrands() {
  const [items, setItems] = useState<FeaturedBrand[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableBrand | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );
  const activeCount = useMemo(() => items.filter((brand) => brand.active).length, [items]);
  const filtered = useMemo(
    () => sortedItems.filter((brand) => brand.name.toLowerCase().includes(query.toLowerCase())),
    [query, sortedItems],
  );

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      setItems(await getAdminFeaturedBrands());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les marques.");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setError("");
    setEditing(emptyBrand(items.length));
    setOpen(true);
  };

  const openEdit = (brand: FeaturedBrand) => {
    setError("");
    setEditing({ ...brand, link: brand.link ?? "" });
    setOpen(true);
  };

  const validate = (brand: EditableBrand) => {
    if (!brand.name.trim()) return "Le nom de la marque est obligatoire.";
    if (brand.name.trim().length > NAME_MAX) {
      return `Le nom de la marque ne doit pas dépasser ${NAME_MAX} caractères.`;
    }
    if (!brand.logo.trim()) return "Le logo est obligatoire.";

    const nextActiveCount =
      brand.active || brand.isNew
        ? activeCount + (brand.isNew && brand.active ? 1 : 0)
        : activeCount - 1;
    if (nextActiveCount < MIN_ACTIVE_BRANDS) {
      return `Au moins ${MIN_ACTIVE_BRANDS} logos doivent rester actifs.`;
    }

    return "";
  };

  const toInput = (brand: EditableBrand): FeaturedBrandInput => ({
    name: brand.name.trim(),
    logo: brand.logo.trim(),
    link: brand.link?.trim() || undefined,
    sortOrder: Number.isFinite(brand.sortOrder) ? brand.sortOrder : items.length,
    active: brand.active,
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
        await createFeaturedBrand(toInput(editing));
      } else {
        await updateFeaturedBrand(editing.id, toInput(editing));
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

  const remove = async (brand: FeaturedBrand) => {
    if (brand.active && activeCount <= MIN_ACTIVE_BRANDS) {
      setError(`Au moins ${MIN_ACTIVE_BRANDS} logos doivent rester actifs.`);
      return;
    }

    try {
      setError("");
      await deleteFeaturedBrand(brand.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const toggle = async (brand: FeaturedBrand) => {
    if (brand.active && activeCount <= MIN_ACTIVE_BRANDS) {
      setError(`Au moins ${MIN_ACTIVE_BRANDS} logos doivent rester actifs.`);
      return;
    }

    try {
      setError("");
      await toggleFeaturedBrand(brand.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement de statut impossible.");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedItems.length) return;

    const next = [...sortedItems];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((brand, sortOrder) => ({ ...brand, sortOrder })));

    try {
      setError("");
      setItems(await reorderFeaturedBrands(next.map((brand) => brand.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réorganisation impossible.");
      await refresh();
    }
  };

  const onUpload = (file: File | null) => {
    if (!file || !editing) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setError("Image invalide. Formats acceptés : jpg, jpeg, png, webp, svg.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditing((current) =>
        current && typeof reader.result === "string" ? { ...current, logo: reader.result } : current,
      );
    };
    reader.readAsDataURL(file);
  };

  const updateEditing = (patch: Partial<EditableBrand>) => {
    setEditing((current) => (current ? { ...current, ...patch } : current));
  };

  return (
    <>
      <AdminHeader
        title="Nos marques à la une"
        subtitle={`${items.length} logo(s) · ${activeCount} actif(s) · minimum ${MIN_ACTIVE_BRANDS}`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau logo</span>
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une marque…"
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {loading && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Chargement des marques…
              </CardContent>
            </Card>
          )}

          {!loading &&
            filtered.map((brand) => {
              const index = sortedItems.findIndex((item) => item.id === brand.id);

              return (
                <Card key={brand.id} className={`overflow-hidden ${brand.active ? "" : "opacity-60"}`}>
                  <div className="relative grid aspect-[2/1] w-full place-items-center bg-muted">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-h-[80%] max-w-[80%] object-contain" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                      #{brand.sortOrder + 1}
                    </span>
                    {!brand.active && (
                      <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                        Désactivé
                      </span>
                    )}
                  </div>
                  <CardContent className="space-y-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{brand.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{brand.link || "—"}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 1)} disabled={index === sortedItems.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(brand)} aria-label={brand.active ? "Désactiver" : "Activer"}>
                          {brand.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)} aria-label="Modifier">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(brand)} aria-label="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

          {!loading && filtered.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Aucune marque.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.isNew ? "Nouveau logo" : "Modifier le logo"}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label>Nom de la marque</Label>
                  <span className={`text-xs ${editing.name.length > NAME_MAX ? "text-destructive" : "text-muted-foreground"}`}>
                    {editing.name.length}/{NAME_MAX}
                  </span>
                </div>
                <Input
                  value={editing.name}
                  onChange={(event) => updateEditing({ name: event.target.value })}
                  placeholder="Ex: Chanel"
                  maxLength={NAME_MAX + 10}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <div className="flex gap-2">
                  <Input
                    value={editing.logo}
                    onChange={(event) => updateEditing({ logo: event.target.value })}
                    placeholder="URL ou téléverser"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
                  />
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => fileRef.current?.click()} aria-label="Téléverser">
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {editing.logo && (
                  <div className="mt-2 grid aspect-[2/1] place-items-center rounded-md border border-border bg-muted">
                    <img src={editing.logo} alt="" className="max-h-[80%] max-w-[80%] object-contain" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Lien (optionnel)</Label>
                <Input
                  value={editing.link ?? ""}
                  onChange={(event) => updateEditing({ link: event.target.value })}
                  placeholder="/brand/chanel ou https://..."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.sortOrder + 1}
                    onChange={(event) => updateEditing({ sortOrder: Math.max(0, Number(event.target.value) - 1 || 0) })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3">
                  <Label className="text-sm">Actif</Label>
                  <Switch checked={editing.active} onCheckedChange={(active) => updateEditing({ active })} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
