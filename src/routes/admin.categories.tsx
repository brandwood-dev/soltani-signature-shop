import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fallbackCategoryTree,
  generatedCategorySlug,
  createAdminCategory,
  deleteAdminCategory,
  loadCategoryTree,
  reorderAdminCategories,
  toggleAdminCategory,
  toCategoryTree,
  updateAdminCategory,
  type CategoryTree,
} from "@/lib/categories-api";
import { uploadAdminProductImage } from "@/lib/admin-products-api";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type EditableCategory = {
  id?: string;
  parentId?: string;
  parentName?: string;
  name: string;
  slug: string;
  imageUrl: string;
  active: boolean;
  type: "category" | "subcategory";
  mode: "create" | "edit";
};

function AdminCategories() {
  const [cats, setCats] = useState<CategoryTree[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditableCategory | null>(null);

  const totalSubcategories = useMemo(
    () => cats.reduce((total, category) => total + category.subs.length, 0),
    [cats],
  );

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const next = await loadCategoryTree({ admin: true });
      setCats(next);
      setExpanded((current) =>
        current.size ? current : new Set(next.slice(0, 1).map((category) => category.id)),
      );
    } catch (err) {
      setCats(fallbackCategoryTree());
      setError(err instanceof Error ? err.message : "Connexion API momentanément indisponible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const applyReorder = async (ids: string[]) => {
    try {
      setSaving(true);
      setError("");
      const next = await reorderAdminCategories(ids);
      setCats(toCategoryTree(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier l'ordre.");
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const moveCat = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cats.length) return;
    const next = [...cats];
    [next[idx], next[target]] = [next[target], next[idx]];
    setCats(next);
    await applyReorder(next.map((category) => category.id));
  };

  const moveSub = async (catId: string, idx: number, dir: -1 | 1) => {
    const category = cats.find((item) => item.id === catId);
    if (!category) return;
    const target = idx + dir;
    if (target < 0 || target >= category.subs.length) return;
    const subs = [...category.subs];
    [subs[idx], subs[target]] = [subs[target], subs[idx]];
    setCats((current) => current.map((item) => (item.id === catId ? { ...item, subs } : item)));
    await applyReorder(subs.map((sub) => sub.id));
  };

  const handleToggle = async (id: string) => {
    const previousCats = cats;
    setCats((current) =>
      current.map((category) => {
        if (category.id === id) return { ...category, active: !category.active };
        return {
          ...category,
          subs: category.subs.map((sub) => (sub.id === id ? { ...sub, active: !sub.active } : sub)),
        };
      }),
    );
    try {
      setSaving(true);
      setError("");
      const updated = await toggleAdminCategory(id);
      setCats((current) =>
        current.map((category) => {
          if (category.id === updated.id) return { ...category, active: updated.isActive };
          return {
            ...category,
            subs: category.subs.map((sub) =>
              sub.id === updated.id ? { ...sub, active: updated.isActive } : sub,
            ),
          };
        }),
      );
    } catch (err) {
      setCats(previousCats);
      setError(
        err instanceof Error ? err.message : "Impossible d'activer ou désactiver cette catégorie.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditCategory = (category: CategoryTree) => {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl ?? "",
      active: category.active,
      type: "category",
      mode: "edit",
    });
    setEditOpen(true);
  };

  const openEditSubcategory = (sub: CategoryTree["subs"][number]) => {
    setForm({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      imageUrl: sub.imageUrl ?? "",
      active: sub.active,
      type: "subcategory",
      mode: "edit",
    });
    setEditOpen(true);
  };

  const openCreateCategory = () => {
    setForm({
      name: "",
      slug: "",
      imageUrl: "",
      active: true,
      type: "category",
      mode: "create",
    });
    setEditOpen(true);
  };

  const openCreateSubcategory = (category: CategoryTree) => {
    setForm({
      parentId: category.id,
      parentName: category.name,
      name: "",
      slug: "",
      imageUrl: "",
      active: true,
      type: "subcategory",
      mode: "create",
    });
    setEditOpen(true);
  };

  const uploadImage = async (files: FileList | null) => {
    if (!files?.[0] || !form) return;
    try {
      setUploading(true);
      setError("");
      const url = await uploadAdminProductImage(files[0]);
      setForm({ ...form, imageUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload image impossible.");
    } finally {
      setUploading(false);
    }
  };

  const saveCategory = async () => {
    if (!form || !form.name.trim()) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (form.mode === "create") {
        await createAdminCategory({
          name: form.name.trim(),
          parentId: form.parentId,
          imageUrl: form.imageUrl.trim(),
          isActive: form.active,
        });
      } else if (form.id) {
        await updateAdminCategory(form.id, {
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim(),
          isActive: form.active,
        });
      }
      await refresh();
      setEditOpen(false);
      setForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer la catégorie.");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    if (
      !window.confirm(
        "Supprimer cet élément ? Si des produits l'utilisent, la suppression sera refusée.",
      )
    )
      return;
    try {
      setSaving(true);
      setError("");
      await deleteAdminCategory(id);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Suppression impossible. Désactivez cette catégorie ou déplacez les produits liés.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Catégories"
        subtitle={`${cats.length} catégories — ${totalSubcategories} sous-catégories`}
        actions={
          <Button size="sm" onClick={openCreateCategory}>
            <Plus className="h-4 w-4" />
            Nouvelle categorie
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {loading && (
          <div className="rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
            Chargement des catégories…
          </div>
        )}

        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {cats.map((category, idx) => {
              const isOpen = expanded.has(category.id);
              return (
                <li key={category.id}>
                  <div className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="shrink-0 rounded p-1 hover:bg-muted"
                      aria-label="Déplier"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-border bg-muted sm:block">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{category.name}</p>
                        {!category.active && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        /{category.slug} · {category.subs.length} sous-catégorie
                        {category.subs.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2"
                      onClick={() => openCreateSubcategory(category)}
                      disabled={saving}
                      aria-label={`Ajouter une sous-catégorie à ${category.name}`}
                      title="Ajouter une sous-catégorie"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden lg:inline">Sous-catégorie</span>
                    </Button>
                    <div className="hidden shrink-0 gap-1 sm:flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCat(idx, -1)}
                        disabled={idx === 0 || saving}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCat(idx, 1)}
                        disabled={idx === cats.length - 1 || saving}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleToggle(category.id)}
                      disabled={saving}
                    >
                      {category.active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => openEditCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => removeCategory(category.id)}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border bg-muted/30 px-3 pb-3 sm:px-6">
                      <ul className="divide-y divide-border">
                        {category.subs.map((sub, sidx) => (
                          <li key={sub.id} className="flex items-center gap-2 py-2 pl-6 sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm">{sub.name}</p>
                                {!sub.active && (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                /{category.slug}/{sub.slug}
                              </p>
                            </div>
                            <div className="hidden gap-1 sm:flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveSub(category.id, sidx, -1)}
                                disabled={sidx === 0 || saving}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveSub(category.id, sidx, 1)}
                                disabled={sidx === category.subs.length - 1 || saving}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggle(sub.id)}
                              disabled={saving}
                            >
                              {sub.active ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditSubcategory(sub)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeCategory(sub.id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "create"
                ? form.type === "subcategory"
                  ? "Nouvelle sous-catégorie"
                  : "Nouvelle catégorie"
                : form?.type === "subcategory"
                  ? "Modifier la sous-catégorie"
                  : "Modifier la catégorie"}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              {form.mode === "create" && form.type === "subcategory" && form.parentName && (
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Catégorie parente : </span>
                  <span className="font-medium">{form.parentName}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                      slug: generatedCategorySlug(event.target.value),
                    })
                  }
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug généré automatiquement</Label>
                <Input
                  value={form.slug}
                  readOnly
                  aria-readonly="true"
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image de catégorie</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.imageUrl}
                    onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                    placeholder="URL de l'image"
                  />
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <label className="cursor-pointer">
                      <ImagePlus className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(event) => uploadImage(event.target.files)}
                      />
                    </label>
                  </Button>
                </div>
                {form.imageUrl && (
                  <div className="h-24 w-full overflow-hidden rounded-md border border-border bg-muted">
                    <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={form.active}
                  onCheckedChange={(active) => setForm({ ...form, active })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveCategory} disabled={saving || uploading}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
