import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Eye, EyeOff } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPromoBanner,
  deletePromoBanner,
  getAdminPromoBanners,
  togglePromoBanner,
  updatePromoBanner,
  type PromoBanner,
} from "@/lib/promo-banners-api";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const PAGES = [
  { value: "home", label: "Accueil" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "enfant", label: "Enfant" },
  { value: "maison", label: "Maison" },
  { value: "bien-etre", label: "Bien-être" },
] as const;

type PageKey = (typeof PAGES)[number]["value"];

const empty = (page: PageKey): PromoBanner => ({
  id: `new_${Date.now()}`,
  page,
  image: "",
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaUrl: "",
  active: true,
  sortOrder: 0,
  createdAt: "",
  updatedAt: "",
});

function AdminBanners() {
  const [items, setItems] = useState<PromoBanner[]>([]);
  const [tab, setTab] = useState<PageKey | "all">("all");
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [countsByPage, setCountsByPage] = useState<Record<string, number>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminPromoBanners({ page: tab, pageIndex: page, pageSize });
      setItems(response.banners);
      setTotal(response.pagination.total);
      setCountsByPage(response.countsByPage ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les bannières.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab, page, pageSize]);

  const filtered = useMemo(() => items, [items]);

  const remove = async (id: string) => {
    try {
      setError("");
      await deletePromoBanner(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const toggle = async (id: string) => {
    try {
      setError("");
      await togglePromoBanner(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement de statut impossible.");
    }
  };

  const openNew = () => {
    setEditing(empty(tab === "all" ? "home" : tab));
    setOpen(true);
  };

  const openEdit = (banner: PromoBanner) => {
    setEditing({ ...banner });
    setOpen(true);
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    try {
      setSaving(true);
      setError("");
      const payload = {
        page: editing.page,
        image: editing.image,
        title: editing.title,
        subtitle: editing.subtitle,
        ctaLabel: editing.ctaLabel,
        ctaUrl: editing.ctaUrl,
        active: editing.active,
        sortOrder: editing.sortOrder,
      };
      const saved = editing.id.startsWith("new_")
        ? await createPromoBanner(payload)
        : await updatePromoBanner(editing.id, payload);

      void saved;
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Bannières promotionnelles"
        subtitle={`${total} banniere(s)`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle bannière</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as PageKey | "all");
            setPage(1);
          }}
        >
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            {PAGES.map((page) => (
              <TabsTrigger key={page.value} value={page.value}>
                {page.label} ({countsByPage[page.value] ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filtered.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative aspect-[2/1] w-full bg-muted">
                {banner.image && <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <h3 className="line-clamp-1 text-sm font-semibold">{banner.title}</h3>
                  <p className="line-clamp-1 text-xs opacity-90">{banner.subtitle}</p>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium capitalize text-foreground">
                  {PAGES.find((page) => page.value === banner.page)?.label}
                </span>
                {!banner.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                    Inactive
                  </span>
                )}
              </div>
              <CardContent className="flex items-center justify-between p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {banner.ctaLabel} → {banner.ctaUrl}
                </span>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(banner.id)}>
                    {banner.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filtered.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Aucune bannière pour cette page.
              </CardContent>
            </Card>
          )}
        </div>

        <DataPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing && !editing.id.startsWith("new_") ? "Modifier la bannière" : "Nouvelle bannière"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Page</Label>
                <Select value={editing.page} onValueChange={(value) => setEditing({ ...editing, page: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGES.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input value={editing.image} onChange={(event) => setEditing({ ...editing, image: event.target.value })} placeholder="URL de l'image" />
                  <Button variant="outline" size="icon" className="shrink-0" aria-label="Téléverser">
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {editing.image && <img src={editing.image} alt="" className="mt-2 aspect-[2/1] w-full rounded-md object-cover" />}
              </div>
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <Input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Sous-titre</Label>
                <Textarea rows={2} value={editing.subtitle} onChange={(event) => setEditing({ ...editing, subtitle: event.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Libellé CTA</Label>
                  <Input value={editing.ctaLabel} onChange={(event) => setEditing({ ...editing, ctaLabel: event.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>URL CTA</Label>
                  <Input value={editing.ctaUrl} onChange={(event) => setEditing({ ...editing, ctaUrl: event.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch checked={editing.active} onCheckedChange={(value) => setEditing({ ...editing, active: value })} />
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
