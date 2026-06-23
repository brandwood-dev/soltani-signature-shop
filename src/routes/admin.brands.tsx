import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrands,
});

type Brand = {
  id: string;
  name: string;
  logo: string;
  url: string;
  active: boolean;
  order: number;
};

const SEED: Brand[] = [
  { id: "br1", name: "Chanel", logo: "https://picsum.photos/seed/brand1/200/100", url: "/brand/chanel", active: true, order: 1 },
  { id: "br2", name: "Dior", logo: "https://picsum.photos/seed/brand2/200/100", url: "/brand/dior", active: true, order: 2 },
  { id: "br3", name: "Guerlain", logo: "https://picsum.photos/seed/brand3/200/100", url: "/brand/guerlain", active: true, order: 3 },
  { id: "br4", name: "Lancôme", logo: "https://picsum.photos/seed/brand4/200/100", url: "/brand/lancome", active: true, order: 4 },
  { id: "br5", name: "YSL", logo: "https://picsum.photos/seed/brand5/200/100", url: "/brand/ysl", active: false, order: 5 },
  { id: "br6", name: "Hermès", logo: "https://picsum.photos/seed/brand6/200/100", url: "/brand/hermes", active: true, order: 6 },
];

const empty = (order: number): Brand => ({
  id: `br_${order}_${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  logo: "",
  url: "",
  active: true,
  order,
});

function AdminBrands() {
  const [items, setItems] = useState<Brand[]>(SEED);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.order - b.order)
        .filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const remove = (id: string) => setItems((s) => s.filter((b) => b.id !== id));
  const toggle = (id: string) =>
    setItems((s) => s.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));

  const move = (id: string, dir: -1 | 1) => {
    setItems((s) => {
      const arr = [...s].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((b) => b.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= arr.length) return s;
      const a = arr[idx];
      const b = arr[swap];
      const ao = a.order;
      a.order = b.order;
      b.order = ao;
      return arr;
    });
  };

  const openNew = () => {
    setEditing(empty(items.length + 1));
    setOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing({ ...b });
    setOpen(true);
  };
  const save = () => {
    if (!editing || !editing.name.trim()) return;
    setItems((s) =>
      s.some((b) => b.id === editing.id)
        ? s.map((b) => (b.id === editing.id ? editing : b))
        : [...s, editing],
    );
    setOpen(false);
    setEditing(null);
  };

  const onUpload = (file: File | null) => {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <>
      <AdminHeader
        title="Nos marques à la une"
        subtitle={`${items.length} logo(s) · ${items.filter((b) => b.active).length} actif(s)`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau logo</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une marque…"
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((b, i) => (
            <Card key={b.id} className={`overflow-hidden ${b.active ? "" : "opacity-60"}`}>
              <div className="relative grid aspect-[2/1] w-full place-items-center bg-muted">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="max-h-[80%] max-w-[80%] object-contain" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                  #{b.order}
                </span>
                {!b.active && (
                  <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                    Désactivé
                  </span>
                )}
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{b.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{b.url || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => move(b.id, -1)}
                      disabled={i === 0}
                      aria-label="Monter"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => move(b.id, 1)}
                      disabled={i === sorted.length - 1}
                      aria-label="Descendre"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggle(b.id)}
                      aria-label="Activer/Désactiver"
                    >
                      {b.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(b)}
                      aria-label="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(b.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sorted.length === 0 && (
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
            <DialogTitle>
              {editing && items.some((b) => b.id === editing.id)
                ? "Modifier le logo"
                : "Nouveau logo"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nom de la marque</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex: Chanel"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <div className="flex gap-2">
                  <Input
                    value={editing.logo}
                    onChange={(e) => setEditing({ ...editing, logo: e.target.value })}
                    placeholder="URL ou téléverser"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Téléverser"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {editing.logo && (
                  <div className="mt-2 grid aspect-[2/1] place-items-center rounded-md border border-border bg-muted">
                    <img
                      src={editing.logo}
                      alt=""
                      className="max-h-[80%] max-w-[80%] object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Lien (optionnel)</Label>
                <Input
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="/brand/chanel"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.order}
                    onChange={(e) =>
                      setEditing({ ...editing, order: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3">
                  <Label className="text-sm">Actif</Label>
                  <Switch
                    checked={editing.active}
                    onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                  />
                </div>
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
