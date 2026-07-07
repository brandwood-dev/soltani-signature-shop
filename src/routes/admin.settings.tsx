import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_SHOP_SETTINGS,
  getAdminShopSettings,
  updateShopSettings,
  type ShopSettings,
  type ShopSettingsInput,
} from "@/lib/settings-api";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const SHOP_NAME_MAX = 80;
const EMAIL_MAX = 120;
const DESCRIPTION_MAX = 300;

function AdminSettings() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [initial, setInitial] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      const next = await getAdminShopSettings();
      setSettings(next);
      setInitial(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les paramètres.");
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<ShopSettings>) => {
    setSuccess("");
    setSettings((current) => ({ ...current, ...patch }));
  };

  const validate = () => {
    if (!settings.shopName.trim()) return "Le nom de la boutique est obligatoire.";
    if (settings.shopName.trim().length > SHOP_NAME_MAX) return `Le nom ne doit pas dépasser ${SHOP_NAME_MAX} caractères.`;
    if (!settings.contactEmail.trim() || settings.contactEmail.length > EMAIL_MAX) return "Email de contact invalide.";
    if (!settings.description.trim()) return "La description est obligatoire.";
    if (settings.description.trim().length > DESCRIPTION_MAX) return `La description ne doit pas dépasser ${DESCRIPTION_MAX} caractères.`;
    if (!Number.isFinite(settings.shippingFee) || settings.shippingFee <= 0) return "Les frais de livraison doivent être supérieurs à 0.";
    if (!Number.isFinite(settings.freeShippingThreshold) || settings.freeShippingThreshold <= 0) return "Le seuil de livraison offerte doit être supérieur à 0.";
    if (!settings.cashOnDeliveryEnabled && !settings.cardPaymentEnabled) return "Au moins un moyen de paiement doit rester activé.";
    return "";
  };

  const toInput = (): ShopSettingsInput => ({
    shopName: settings.shopName.trim(),
    contactEmail: settings.contactEmail.trim(),
    description: settings.description.trim(),
    shippingFee: Number(settings.shippingFee),
    freeShippingThreshold: Number(settings.freeShippingThreshold),
    freeShippingEnabled: settings.freeShippingEnabled,
    cashOnDeliveryEnabled: settings.cashOnDeliveryEnabled,
    cardPaymentEnabled: settings.cardPaymentEnabled,
  });

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const next = await updateShopSettings(toInput());
      setSettings(next);
      setInitial(next);
      setSuccess("Paramètres enregistrés.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader title="Paramètres" subtitle="Configuration de la boutique" />

      <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <Card className={loading ? "opacity-70" : ""}>
          <CardHeader>
            <CardTitle className="text-base">Boutique</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="shop-name">Nom de la boutique</Label>
                <span className="text-xs text-muted-foreground">{settings.shopName.length}/{SHOP_NAME_MAX}</span>
              </div>
              <Input id="shop-name" value={settings.shopName} maxLength={SHOP_NAME_MAX + 10} onChange={(event) => update({ shopName: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop-email">Email de contact</Label>
              <Input id="shop-email" type="email" value={settings.contactEmail} maxLength={EMAIL_MAX + 10} onChange={(event) => update({ contactEmail: event.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="shop-desc">Description</Label>
                <span className="text-xs text-muted-foreground">{settings.description.length}/{DESCRIPTION_MAX}</span>
              </div>
              <Textarea id="shop-desc" rows={3} value={settings.description} maxLength={DESCRIPTION_MAX + 20} onChange={(event) => update({ description: event.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ship-fee">Frais de livraison (DT)</Label>
                <Input id="ship-fee" type="number" min={0.001} step="0.001" value={settings.shippingFee} onChange={(event) => update({ shippingFee: Number(event.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ship-free">Livraison offerte dès (DT)</Label>
                <Input id="ship-free" type="number" min={0.001} step="0.001" value={settings.freeShippingThreshold} onChange={(event) => update({ freeShippingThreshold: Number(event.target.value) })} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Livraison gratuite</p>
                <p className="text-xs text-muted-foreground">Offre spéciale globale sur toutes les commandes</p>
              </div>
              <Switch checked={settings.freeShippingEnabled} onCheckedChange={(freeShippingEnabled) => update({ freeShippingEnabled })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Paiement à la livraison</p>
                <p className="text-xs text-muted-foreground">Autoriser le paiement en espèces</p>
              </div>
              <Switch checked={settings.cashOnDeliveryEnabled} onCheckedChange={(cashOnDeliveryEnabled) => update({ cashOnDeliveryEnabled })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Paiement par carte</p>
                <p className="text-xs text-muted-foreground">Activer le paiement en ligne</p>
              </div>
              <Switch checked={settings.cardPaymentEnabled} onCheckedChange={(cardPaymentEnabled) => update({ cardPaymentEnabled })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={() => { setSettings(initial); setError(""); setSuccess(""); }}>
            Annuler
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </>
  );
}
