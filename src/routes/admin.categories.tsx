import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
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

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Sub = { id: string; name: string; slug: string; active: boolean };
type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  subs: Sub[];
};

const SEED: Category[] = [
  {
    id: "c1",
    name: "Femme",
    slug: "femme",
    active: true,
    subs: [
      { id: "s11", name: "Parfums", slug: "parfums", active: true },
      { id: "s12", name: "Soins", slug: "soins", active: true },
      { id: "s13", name: "Maquillage", slug: "maquillage", active: true },
    ],
  },
  {
    id: "c2",
    name: "Homme",
    slug: "homme",
    active: true,
    subs: [
      { id: "s21", name: "Parfums", slug: "parfums", active: true },
      { id: "s22", name: "Soins", slug: "soins", active: true },
    ],
  },
  {
    id: "c3",
    name: "Enfant",
    slug: "enfant",
    active: true,
    subs: [{ id: "s31", name: "Soins doux", slug: "soins-doux", active: true }],
  },
  {
    id: "c4",
    name: "Maison",
    slug: "maison",
    active: true,
    subs: [
      { id: "s41", name: "Bougies", slug: "bougies", active: true },
      { id: "s42", name: "Diffuseurs", slug: "diffuseurs", active: true },
    ],
  },
  {
    id: "c5",
    name: "Bien-être",
    slug: "bien-etre",
    active: false,
    subs: [],
  },
];

type CatForm = { id: string; name: string; slug: string; active: boolean };
type SubForm = { catId: string; sub: Sub };

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminCategories() {
  const [cats, setCats] = useState<Category[]>(SEED);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["c1"]));

  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState<CatForm | null>(null);

  const [subOpen, setSubOpen] = useState(false);
  const [subForm, setSubForm] = useState<SubForm | null>(null);

  const toggleExpand = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const moveCat = (idx: number, dir: -1 | 1) => {
    const next = [...cats];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setCats(next);
  };

  const moveSub = (catId: string, idx: number, dir: -1 | 1) => {
    setCats((s) =>
      s.map((c) => {
        if (c.id !== catId) return c;
        const subs = [...c.subs];
        const t = idx + dir;
        if (t < 0 || t >= subs.length) return c;
        [subs[idx], subs[t]] = [subs[t], subs[idx]];
        return { ...c, subs };
      }),
    );
  };

  const removeCat = (id: string) => setCats((s) => s.filter((c) => c.id !== id));
  const toggleCat = (id: string) =>
    setCats((s) => s.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));

  const removeSub = (catId: string, subId: string) =>
    setCats((s) =>
      s.map((c) =>
        c.id === catId ? { ...c, subs: c.subs.filter((x) => x.id !== subId) } : c,
      ),
    );
  const toggleSub = (catId: string, subId: string) =>
    setCats((s) =>
      s.map((c) =>
        c.id === catId
          ? {
              ...c,
              subs: c.subs.map((x) => (x.id === subId ? { ...x, active: !x.active } : x)),
            }
          : c,
      ),
    );

  const openNewCat = () => {
    setCatForm({ id: `c_${Date.now()}`, name: "", slug: "", active: true });
    setCatOpen(true);
  };
  const openEditCat = (c: Category) => {
    setCatForm({ id: c.id, name: c.name, slug: c.slug, active: c.active });
    setCatOpen(true);
  };
  const saveCat = () => {
    if (!catForm || !catForm.name.trim()) return;
    const slug = catForm.slug.trim() || slugify(catForm.name);
    setCats((s) =>
      s.some((c) => c.id === catForm.id)
        ? s.map((c) => (c.id === catForm.id ? { ...c, ...catForm, slug } : c))
        : [...s, { ...catForm, slug, subs: [] }],
    );
    setCatOpen(false);
    setCatForm(null);
  };

  const openNewSub = (catId: string) => {
    setSubForm({
      catId,
      sub: { id: `s_${Date.now()}`, name: "", slug: "", active: true },
    });
    setSubOpen(true);
  };
  const openEditSub = (catId: string, sub: Sub) => {
    setSubForm({ catId, sub: { ...sub } });
    setSubOpen(true);
  };
  const saveSub = () => {
    if (!subForm || !subForm.sub.name.trim()) return;
    const sub = {
      ...subForm.sub,
      slug: subForm.sub.slug.trim() || slugify(subForm.sub.name),
    };
    setCats((s) =>
      s.map((c) => {
        if (c.id !== subForm.catId) return c;
        const exists = c.subs.some((x) => x.id === sub.id);
        return {
          ...c,
          subs: exists ? c.subs.map((x) => (x.id === sub.id ? sub : x)) : [...c.subs, sub],
        };
      }),
    );
    setSubOpen(false);
    setSubForm(null);
  };

  return (
    <>
      <AdminHeader
        title="Catégories"
        subtitle={`${cats.length} catégories — ${cats.reduce((n, c) => n + c.subs.length, 0)} sous-catégories`}
        actions={
          <Button size="sm" className="h-9" onClick={openNewCat}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle catégorie</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:p-6">
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {cats.map((c, idx) => {
              const isOpen = expanded.has(c.id);
              return (
                <li key={c.id}>
                  <div className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="shrink-0 rounded p-1 hover:bg-muted"
                      aria-label="Déplier"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        {!c.active && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        /{c.slug} · {c.subs.length} sous-catégorie
                        {c.subs.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="hidden shrink-0 gap-1 sm:flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCat(idx, -1)}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCat(idx, 1)}
                        disabled={idx === cats.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => toggleCat(c.id)}
                    >
                      {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => openEditCat(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => removeCat(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border bg-muted/30 px-3 pb-3 sm:px-6">
                      <ul className="divide-y divide-border">
                        {c.subs.map((sub, sidx) => (
                          <li
                            key={sub.id}
                            className="flex items-center gap-2 py-2 pl-6 sm:gap-3"
                          >
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
                                /{c.slug}/{sub.slug}
                              </p>
                            </div>
                            <div className="hidden gap-1 sm:flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveSub(c.id, sidx, -1)}
                                disabled={sidx === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveSub(c.id, sidx, 1)}
                                disabled={sidx === c.subs.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleSub(c.id, sub.id)}
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
                              onClick={() => openEditSub(c.id, sub)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeSub(c.id, sub.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-6 mt-2 h-8"
                        onClick={() => openNewSub(c.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Sous-catégorie
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {catForm && cats.some((c) => c.id === catForm.id)
                ? "Modifier la catégorie"
                : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>
          {catForm && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm({
                      ...catForm,
                      name: e.target.value,
                      slug: catForm.slug || slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  placeholder="auto-généré"
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={catForm.active}
                  onCheckedChange={(v) => setCatForm({ ...catForm, active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveCat}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sous-catégorie</DialogTitle>
          </DialogHeader>
          {subForm && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input
                  value={subForm.sub.name}
                  onChange={(e) =>
                    setSubForm({
                      ...subForm,
                      sub: {
                        ...subForm.sub,
                        name: e.target.value,
                        slug: subForm.sub.slug || slugify(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={subForm.sub.slug}
                  onChange={(e) =>
                    setSubForm({ ...subForm, sub: { ...subForm.sub, slug: e.target.value } })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={subForm.sub.active}
                  onCheckedChange={(v) =>
                    setSubForm({ ...subForm, sub: { ...subForm.sub, active: v } })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveSub}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
