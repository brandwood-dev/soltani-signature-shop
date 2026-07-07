import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Pencil } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HeroSlide, HeroSlideInput } from "@/lib/hero-api";
import {
  getAdminHeroSlides,
  reorderHeroSlides,
  toggleHeroSlide,
  updateHeroSlide,
} from "@/lib/hero-api";

export const Route = createFileRoute("/admin/hero")({
  component: AdminHero,
});

const LIMITS = {
  tagline: 60,
  subtitle: 80,
  title: 70,
  description: 150,
  ctaText: 25,
};

function AdminHero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSlides = useMemo(() => slides.filter((slide) => slide.active), [slides]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      setSlides(await getAdminHeroSlides());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les slides.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (slide: HeroSlide) => {
    setEditing({
      ...slide,
      ctaPrimary: { ...slide.ctaPrimary },
      ctaSecondary: { ...slide.ctaSecondary },
    });
    setOpen(true);
  };

  const readImageFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Image invalide. Formats acceptés : jpg, jpeg, png, webp.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditing((current) =>
        current && typeof reader.result === "string" ? { ...current, image: reader.result } : current,
      );
    };
    reader.readAsDataURL(file);
  };

  const validate = (slide: HeroSlide) => {
    const fields: Array<[string, string, number]> = [
      ["Image de fond", slide.image, 500_000],
      ["Tagline", slide.tagline, LIMITS.tagline],
      ["Sous-titre", slide.subtitle, LIMITS.subtitle],
      ["Titre principal", slide.title, LIMITS.title],
      ["Description", slide.description, LIMITS.description],
      ["CTA principal - texte", slide.ctaPrimary.text, LIMITS.ctaText],
      ["CTA principal - lien", slide.ctaPrimary.link, 255],
      ["CTA secondaire - texte", slide.ctaSecondary.text, LIMITS.ctaText],
      ["CTA secondaire - lien", slide.ctaSecondary.link, 255],
    ];

    for (const [label, value, max] of fields) {
      if (!value.trim()) return `${label} est obligatoire.`;
      if (value.trim().length > max) return `${label} ne doit pas dépasser ${max} caractères.`;
    }

    if (!slide.active && activeSlides.length === 1 && activeSlides[0].id === slide.id) {
      return "Au moins un slide doit rester actif.";
    }

    return "";
  };

  const save = async () => {
    if (!editing) return;

    const validationError = validate(editing);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: HeroSlideInput = {
      image: editing.image.trim(),
      tagline: editing.tagline.trim(),
      subtitle: editing.subtitle.trim(),
      title: editing.title.trim(),
      description: editing.description.trim(),
      ctaPrimary: {
        text: editing.ctaPrimary.text.trim(),
        link: editing.ctaPrimary.link.trim(),
      },
      ctaSecondary: {
        text: editing.ctaSecondary.text.trim(),
        link: editing.ctaSecondary.link.trim(),
      },
      active: editing.active,
    };

    try {
      setSaving(true);
      setError("");
      await updateHeroSlide(editing.id, payload);
      setOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (slide: HeroSlide) => {
    if (slide.active && activeSlides.length === 1) {
      setError("Au moins un slide doit rester actif.");
      return;
    }

    try {
      setError("");
      await toggleHeroSlide(slide.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement de statut impossible.");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next.map((slide, sortOrder) => ({ ...slide, sortOrder })));

    try {
      setError("");
      setSlides(await reorderHeroSlides(next.map((slide) => slide.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réorganisation impossible.");
      await refresh();
    }
  };

  const updateEditing = (patch: Partial<HeroSlide>) => {
    setEditing((current) => (current ? { ...current, ...patch } : current));
  };

  return (
    <>
      <AdminHeader
        title="Hero Section"
        subtitle={`${activeSlides.length} slide(s) actif(s) sur ${slides.length} — page d'accueil`}
      />

      <div className="flex-1 space-y-4 p-3 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          {loading && (
            <Card className="lg:col-span-3">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Chargement des slides…
              </CardContent>
            </Card>
          )}

          {!loading &&
            slides.map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="relative aspect-[16/9] w-full bg-muted">
                  <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">
                      {slide.tagline}
                    </p>
                    <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-tight">
                      {slide.title}
                    </h3>
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground">
                    Slide {index + 1}
                  </span>
                  {!slide.active && (
                    <span className="absolute right-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                      Masqué
                    </span>
                  )}
                </div>

                <CardContent className="space-y-3 p-3 sm:p-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground">{slide.subtitle}</p>
                    <p className="line-clamp-2 text-foreground/80">{slide.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded bg-muted px-2 py-1">
                      CTA 1 : <span className="font-medium">{slide.ctaPrimary.text}</span>
                    </span>
                    <span className="rounded bg-muted px-2 py-1">
                      CTA 2 : <span className="font-medium">{slide.ctaSecondary.text}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 1)} disabled={index === slides.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(slide)} aria-label={slide.active ? "Désactiver" : "Activer"}>
                        {slide.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openEdit(slide)}>
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

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Image de fond</Label>
                <div className="flex gap-2">
                  <Input
                    value={editing.image}
                    onChange={(event) => updateEditing({ image: event.target.value })}
                    placeholder="URL de l'image ou upload direct"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) readImageFile(file);
                    }}
                  />
                  <Button variant="outline" size="icon" className="shrink-0" aria-label="Téléverser" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                {editing.image && <img src={editing.image} alt="" className="mt-2 aspect-[16/9] w-full rounded-md object-cover" />}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <LimitedInput label="Tagline" value={editing.tagline} max={LIMITS.tagline} onChange={(tagline) => updateEditing({ tagline })} />
                <LimitedInput label="Sous-titre" value={editing.subtitle} max={LIMITS.subtitle} onChange={(subtitle) => updateEditing({ subtitle })} />
              </div>

              <LimitedInput label="Titre principal" value={editing.title} max={LIMITS.title} onChange={(title) => updateEditing({ title })} />

              <div className="space-y-1.5">
                <FieldLabel label="Description" value={editing.description} max={LIMITS.description} />
                <Textarea rows={2} value={editing.description} onChange={(event) => updateEditing({ description: event.target.value })} maxLength={LIMITS.description + 20} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-md border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CTA principal</p>
                  <LimitedInput label="Texte" value={editing.ctaPrimary.text} max={LIMITS.ctaText} onChange={(text) => setEditing({ ...editing, ctaPrimary: { ...editing.ctaPrimary, text } })} />
                  <Input placeholder="Lien (/femme)" value={editing.ctaPrimary.link} onChange={(event) => setEditing({ ...editing, ctaPrimary: { ...editing.ctaPrimary, link: event.target.value } })} />
                </div>
                <div className="space-y-2 rounded-md border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CTA secondaire</p>
                  <LimitedInput label="Texte" value={editing.ctaSecondary.text} max={LIMITS.ctaText} onChange={(text) => setEditing({ ...editing, ctaSecondary: { ...editing.ctaSecondary, text } })} />
                  <Input placeholder="Lien (/promotions)" value={editing.ctaSecondary.link} onChange={(event) => setEditing({ ...editing, ctaSecondary: { ...editing.ctaSecondary, link: event.target.value } })} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label className="text-sm">Slide actif</Label>
                <Switch checked={editing.active} onCheckedChange={(active) => updateEditing({ active })} />
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

function FieldLabel({ label, value, max }: { label: string; value: string; max: number }) {
  const tooLong = value.length > max;
  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{label}</Label>
      <span className={`text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>
        {value.length}/{max}
      </span>
    </div>
  );
}

function LimitedInput({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} value={value} max={max} />
      <Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={max + 10} />
      {value.length > max && (
        <p className="text-xs text-destructive">{label} ne doit pas dépasser {max} caractères.</p>
      )}
    </div>
  );
}
