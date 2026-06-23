import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Eye, EyeOff } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
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

type Banner = {
  id: string;
  page: PageKey;
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
};

const SEED: Banner[] = [
  {
    id: "b1",
    page: "home",
    image: "https://picsum.photos/seed/ban1/800/400",
    title: "Black Friday",
    subtitle: "Jusqu'à -50% sur une sélection",
    ctaLabel: "J'en profite",
    ctaUrl: "/promotions",
    active: true,
  },
  {
    id: "b2",
    page: "home",
    image: "https://picsum.photos/seed/ban2/800/400",
    title: "Coffrets cadeaux",
    subtitle: "Idées parfaites pour les fêtes",
    ctaLabel: "Voir les coffrets",
    ctaUrl: "/promotions",
    active: true,
  },
  {
    id: "b3",
    page: "femme",
    image: "https://picsum.photos/seed/ban3/800/400",
    title: "Édition Florale",
    subtitle: "Les nouveaux parfums féminins",
    ctaLabel: "Découvrir",
    ctaUrl: "/femme",
    active: true,
  },
  {
    id: "b4",
    page: "homme",
    image: "https://picsum.photos/seed/ban4/800/400",
    title: "Sport & Caractère",
    subtitle: "La nouvelle ligne homme",
    ctaLabel: "Voir",
    ctaUrl: "/homme",
    active: true,
  },
  {
    id: "b5",
    page: "enfant",
    image: "https://picsum.photos/seed/ban5/800/400",
    title: "Douceurs Enfant",
    subtitle: "Soins hypoallergéniques",
    ctaLabel: "Explorer",
    ctaUrl: "/enfant",
    active: true,
  },
  {
    id: "b6",
    page: "maison",
    image: "https://picsum.photos/seed/ban6/800/400",
    title: "Ambiance Cocooning",
    subtitle: "Bougies & diffuseurs",
    ctaLabel: "Découvrir",
    ctaUrl: "/maison",
    active: true,
  },
  {
    id: "b7",
    page: "bien-etre",
    image: "https://picsum.photos/seed/ban7/800/400",
    title: "Rituels Bien-être",
    subtitle: "Soins relaxants",
    ctaLabel: "Voir",
    ctaUrl: "/bien-etre",
    active: false,
  },
];

const empty = (page: PageKey): Banner => ({
  id: `b_${Date.now()}`,
  page,
  image: "",
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaUrl: "",
  active: true,
});

function AdminBanners() {
  const [items, setItems] = useState<Banner[]>(SEED);
  const [tab, setTab] = useState<PageKey | "all">("all");
  const [editing, setEditing] = useState<Banner | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((b) => b.page === tab)),
    [items, tab],
  );

  const remove = (id: string) => setItems((s) => s.filter((b) => b.id !== id));
  const toggle = (id: string) =>
    setItems((s) => s.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  const openNew = () => {
    setEditing(empty(tab === "all" ? "home" : tab));
    setOpen(true);
  };
  const openEdit = (b: Banner) => {
    setEditing({ ...b });
    setOpen(true);
  };
  const save = () => {
    if (!editing || !editing.title.trim()) return;
    setItems((s) =>
      s.some((b) => b.id === editing.id)
        ? s.map((b) => (b.id === editing.id ? editing : b))
        : [...s, editing],
    );
    setOpen(false);
    setEditing(null);
  };

  return (
    <>
      <AdminHeader
        title="Bannières promotionnelles"
        subtitle={`${items.length} bannière(s) — toutes pages confondues`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle bannière</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as PageKey | "all")}>
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Toutes ({items.length})</TabsTrigger>
            {PAGES.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label} ({items.filter((b) => b.page === p.value).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="relative aspect-[2/1] w-full bg-muted">
                {b.image && (
                  <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <h3 className="line-clamp-1 text-sm font-semibold">{b.title}</h3>
                  <p className="line-clamp-1 text-xs opacity-90">{b.subtitle}</p>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium capitalize text-foreground">
                  {PAGES.find((p) => p.value === b.page)?.label}
                </span>
                {!b.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                    Inactive
                  </span>
                )}
              </div>
              <CardContent className="flex items-center justify-between p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {b.ctaLabel} → {b.ctaUrl}
                </span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggle(b.id)}
                  >
                    {b.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(b)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Aucune bannière pour cette page.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing && items.some((b) => b.id === editing.id)
                ? "Modifier la bannière"
                : "Nouvelle bannière"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Page</Label>
                <Select
                  value={editing.page}
                  onValueChange={(v) => setEditing({ ...editing, page: v as PageKey })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={editing.image}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                    placeholder="URL de l'image"
                  />
                  <Button variant="outline" size="icon" className="shrink-0" aria-label="Téléverser">
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {editing.image && (
                  <img
                    src={editing.image}
                    alt=""
                    className="mt-2 aspect-[2/1] w-full rounded-md object-cover"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sous-titre</Label>
                <Textarea
                  rows={2}
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Libellé CTA</Label>
                  <Input
                    value={editing.ctaLabel}
                    onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL CTA</Label>
                  <Input
                    value={editing.ctaUrl}
                    onChange={(e) => setEditing({ ...editing, ctaUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
