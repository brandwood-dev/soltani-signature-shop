import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, ArrowUp, ArrowDown, ImagePlus, Eye, EyeOff } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/hero")({
  component: AdminHero,
});

type Cta = { label: string; url: string };
type Slide = {
  id: string;
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: Cta;
  ctaSecondary: Cta;
  active: boolean;
};

const SEED: Slide[] = [
  {
    id: "s1",
    image: "https://picsum.photos/seed/hero1/1600/800",
    tagline: "Nouveauté 2026",
    title: "L'élégance au quotidien",
    subtitle: "Collection Femme — Printemps",
    description: "Des parfums et soins haut de gamme sélectionnés pour vous.",
    ctaPrimary: { label: "Découvrir", url: "/femme" },
    ctaSecondary: { label: "Voir les promos", url: "/promotions" },
    active: true,
  },
  {
    id: "s2",
    image: "https://picsum.photos/seed/hero2/1600/800",
    tagline: "Édition limitée",
    title: "L'art du parfum masculin",
    subtitle: "Collection Homme",
    description: "Des senteurs intemporelles, signées par les plus grandes maisons.",
    ctaPrimary: { label: "Acheter", url: "/homme" },
    ctaSecondary: { label: "En savoir plus", url: "/about" },
    active: true,
  },
  {
    id: "s3",
    image: "https://picsum.photos/seed/hero3/1600/800",
    tagline: "Maison & Lifestyle",
    title: "Sublimez votre intérieur",
    subtitle: "Bougies, diffuseurs & senteurs",
    description: "Pour une maison aux notes envoûtantes.",
    ctaPrimary: { label: "Explorer", url: "/maison" },
    ctaSecondary: { label: "Bien-être", url: "/bien-etre" },
    active: true,
  },
];

function AdminHero() {
  const [slides, setSlides] = useState<Slide[]>(SEED);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [open, setOpen] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...slides];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setSlides(next);
  };
  const toggle = (id: string) =>
    setSlides((s) => s.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  const openEdit = (s: Slide) => {
    setEditing({ ...s, ctaPrimary: { ...s.ctaPrimary }, ctaSecondary: { ...s.ctaSecondary } });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    setSlides((s) => s.map((x) => (x.id === editing.id ? editing : x)));
    setOpen(false);
    setEditing(null);
  };

  return (
    <>
      <AdminHeader
        title="Hero Section"
        subtitle={`${slides.length} slides — défilement de la page d'accueil`}
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          {slides.map((s, idx) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-muted">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">
                    {s.tagline}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-tight">
                    {s.title}
                  </h3>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground">
                  Slide {idx + 1}
                </span>
                {!s.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                    Masqué
                  </span>
                )}
              </div>
              <CardContent className="space-y-3 p-3 sm:p-4">
                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground">{s.subtitle}</p>
                  <p className="line-clamp-2 text-foreground/80">{s.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded bg-muted px-2 py-1">
                    CTA 1 : <span className="font-medium">{s.ctaPrimary.label}</span>
                  </span>
                  <span className="rounded bg-muted px-2 py-1">
                    CTA 2 : <span className="font-medium">{s.ctaSecondary.label}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => move(idx, 1)}
                      disabled={idx === slides.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggle(s.id)}
                    >
                      {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le slide</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Image de fond</Label>
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
                    className="mt-2 aspect-[16/9] w-full rounded-md object-cover"
                  />
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tagline</Label>
                  <Input
                    value={editing.tagline}
                    onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sous-titre</Label>
                  <Input
                    value={editing.subtitle}
                    onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Titre principal</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-md border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    CTA principal
                  </p>
                  <Input
                    placeholder="Libellé"
                    value={editing.ctaPrimary.label}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        ctaPrimary: { ...editing.ctaPrimary, label: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="URL (/femme)"
                    value={editing.ctaPrimary.url}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        ctaPrimary: { ...editing.ctaPrimary, url: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2 rounded-md border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    CTA secondaire
                  </p>
                  <Input
                    placeholder="Libellé"
                    value={editing.ctaSecondary.label}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        ctaSecondary: { ...editing.ctaSecondary, label: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={editing.ctaSecondary.url}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        ctaSecondary: { ...editing.ctaSecondary, url: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Slide actif</Label>
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
