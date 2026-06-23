import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/marquee")({
  component: AdminMarquee,
});

type Message = {
  id: string;
  text: string;
  link?: string;
  active: boolean;
};

const SEED: Message[] = [
  { id: "m1", text: "Livraison gratuite dès 200 DT — Tunisie entière", link: "/promotions", active: true },
  { id: "m2", text: "-20% sur les parfums femme avec le code FEMME20", link: "/femme", active: true },
  { id: "m3", text: "Nouvelle collection Maison disponible", link: "/maison", active: true },
  { id: "m4", text: "Paiement à la livraison disponible", active: false },
];

function AdminMarquee() {
  const [items, setItems] = useState<Message[]>(SEED);
  const [editing, setEditing] = useState<Message | null>(null);
  const [open, setOpen] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  const remove = (id: string) => setItems((s) => s.filter((m) => m.id !== id));
  const toggle = (id: string) =>
    setItems((s) => s.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));

  const openNew = () => {
    setEditing({ id: `m_${Date.now()}`, text: "", link: "", active: true });
    setOpen(true);
  };
  const openEdit = (m: Message) => {
    setEditing({ ...m });
    setOpen(true);
  };
  const save = () => {
    if (!editing || !editing.text.trim()) return;
    setItems((s) =>
      s.some((m) => m.id === editing.id)
        ? s.map((m) => (m.id === editing.id ? editing : m))
        : [...s, editing],
    );
    setOpen(false);
    setEditing(null);
  };

  return (
    <>
      <AdminHeader
        title="Banderole promotionnelle"
        subtitle={`${items.filter((i) => i.active).length} message(s) actif(s) sur ${items.length}`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau message</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:p-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Aperçu du défilement actuel (messages actifs uniquement) :
            </p>
            <div className="mt-2 overflow-hidden rounded-md bg-foreground py-2 text-background">
              <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap px-4 text-xs sm:text-sm">
                {items.filter((i) => i.active).map((m) => (
                  <span key={m.id}>• {m.text}</span>
                ))}
                {items.filter((i) => i.active).length === 0 && (
                  <span className="opacity-60">Aucun message actif</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {items.map((m, idx) => (
              <li key={m.id} className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
                <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                <div className="flex shrink-0 flex-col gap-0.5 sm:hidden">
                  <button
                    onClick={() => move(idx, -1)}
                    className="text-muted-foreground disabled:opacity-30"
                    disabled={idx === 0}
                    aria-label="Monter"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    className="text-muted-foreground disabled:opacity-30"
                    disabled={idx === items.length - 1}
                    aria-label="Descendre"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.text}</p>
                  {m.link && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      → {m.link}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggle(m.id)}
                  aria-label={m.active ? "Désactiver" : "Activer"}
                  className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted"
                >
                  {m.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <div className="hidden shrink-0 gap-1 sm:flex">
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
                    disabled={idx === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => remove(m.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">
                Aucun message. Cliquez sur « Ajouter » pour commencer.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing && items.some((m) => m.id === editing.id)
                ? "Modifier le message"
                : "Nouveau message"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="msg-text">Texte</Label>
                <Input
                  id="msg-text"
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  placeholder="Ex : Livraison offerte dès 200 DT"
                  maxLength={140}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msg-link">Lien (optionnel)</Label>
                <Input
                  id="msg-link"
                  value={editing.link ?? ""}
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  placeholder="/promotions"
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="msg-active" className="text-sm">
                  Actif
                </Label>
                <Switch
                  id="msg-active"
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
