import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";

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
import type { MarqueeMessage } from "@/lib/marquee-api";
import {
  createMarqueeMessage,
  deleteMarqueeMessage,
  getAdminMarqueeMessages,
  reorderMarqueeMessages,
  toggleMarqueeMessage,
  updateMarqueeMessage,
} from "@/lib/marquee-api";

const MAX_TEXT_LENGTH = 55;

type FormState = {
  id?: string;
  text: string;
  link: string;
  active: boolean;
};

export const Route = createFileRoute("/admin/marquee")({
  component: AdminMarquee,
});

function AdminMarquee() {
  const [items, setItems] = useState<MarqueeMessage[]>([]);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeItems = useMemo(() => items.filter((item) => item.active), [items]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      setItems(await getAdminMarqueeMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ text: "", link: "", active: true });
    setOpen(true);
  };

  const openEdit = (message: MarqueeMessage) => {
    setEditing({
      id: message.id,
      text: message.text,
      link: message.link ?? "",
      active: message.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.text.trim()) {
      setError("Le texte est obligatoire.");
      return;
    }
    if (editing.text.trim().length > MAX_TEXT_LENGTH) {
      setError(`Le texte ne doit pas dépasser ${MAX_TEXT_LENGTH} caractères.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        text: editing.text.trim(),
        link: editing.link.trim() || undefined,
        active: editing.active,
      };

      if (editing.id) {
        await updateMarqueeMessage(editing.id, payload);
      } else {
        await createMarqueeMessage(payload);
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

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      setError("");
      await deleteMarqueeMessage(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const toggle = async (id: string) => {
    try {
      setError("");
      await toggleMarqueeMessage(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changement de statut impossible.");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((item, sortOrder) => ({ ...item, sortOrder })));

    try {
      setError("");
      setItems(await reorderMarqueeMessages(next.map((item) => item.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réorganisation impossible.");
      await refresh();
    }
  };

  const textLength = editing?.text.length ?? 0;
  const textTooLong = textLength > MAX_TEXT_LENGTH;

  return (
    <>
      <AdminHeader
        title="Banderole promotionnelle"
        subtitle={`${activeItems.length} message(s) actif(s) sur ${items.length}`}
        actions={
          <Button size="sm" className="h-9" onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau message</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-4 p-3 sm:p-6">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">Aperçu du défilement actuel (messages actifs uniquement) :</p>
            <div className="mt-2 overflow-hidden rounded-md bg-foreground py-2 text-background">
              <div className="flex animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap px-4 text-xs sm:text-sm">
                {activeItems.length > 0 ? activeItems.concat(activeItems).map((item, index) => <span key={`${item.id}-${index}`}>• {item.text}</span>) : <span className="opacity-60">Aucun message actif</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_180px_110px_90px_180px] gap-3 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
            <span>Texte</span>
            <span>Lien</span>
            <span>Statut</span>
            <span>Ordre</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-border">
            {loading && <li className="p-8 text-center text-sm text-muted-foreground">Chargement des messages…</li>}
            {!loading && items.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">Aucun message. Cliquez sur « Nouveau message » pour commencer.</li>}
            {items.map((message, index) => (
              <li key={message.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_110px_90px_180px] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{message.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground lg:hidden">Ordre #{message.sortOrder + 1}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{message.link || "—"}</p>
                <span className={`w-fit rounded-full px-2 py-1 text-xs ${message.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {message.active ? "Actif" : "Inactif"}
                </span>
                <div className="hidden text-sm text-muted-foreground lg:block">#{message.sortOrder + 1}</div>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(message.id)} aria-label={message.active ? "Désactiver" : "Activer"}>
                    {message.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(message)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(message.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le message" : "Nouveau message"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="msg-text">Texte</Label>
                  <span className={`text-xs ${textTooLong ? "text-destructive" : "text-muted-foreground"}`}>
                    {textLength}/{MAX_TEXT_LENGTH}
                  </span>
                </div>
                <Input id="msg-text" value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} placeholder="Ex : Livraison offerte dès 200 DT" maxLength={MAX_TEXT_LENGTH + 10} />
                {textTooLong && <p className="text-xs text-destructive">Le texte ne doit pas dépasser {MAX_TEXT_LENGTH} caractères.</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="msg-link">Lien (optionnel)</Label>
                <Input id="msg-link" value={editing.link} onChange={(event) => setEditing({ ...editing, link: event.target.value })} placeholder="/promotions" />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="msg-active" className="text-sm">Actif</Label>
                <Switch id="msg-active" checked={editing.active} onCheckedChange={(active) => setEditing({ ...editing, active })} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving || !editing?.text.trim() || textTooLong}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
