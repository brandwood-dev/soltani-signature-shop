import { createFileRoute } from "@tanstack/react-router";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <>
      <AdminHeader title="Paramètres" subtitle="Configuration de la boutique" />

      <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Boutique</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name">Nom de la boutique</Label>
              <Input id="shop-name" defaultValue="Soltani Signature" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop-email">Email de contact</Label>
              <Input id="shop-email" type="email" defaultValue="contact@soltani.tn" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="shop-desc">Description</Label>
              <Textarea id="shop-desc" rows={3} defaultValue="Boutique de luxe en Tunisie." />
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
                <Input id="ship-fee" type="number" defaultValue={8} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ship-free">Livraison offerte dès (DT)</Label>
                <Input id="ship-free" type="number" defaultValue={300} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Paiement à la livraison</p>
                <p className="text-xs text-muted-foreground">Autoriser le paiement en espèces</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Paiement par carte</p>
                <p className="text-xs text-muted-foreground">Activer le paiement en ligne</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Annuler</Button>
          <Button>Enregistrer</Button>
        </div>
      </div>
    </>
  );
}
