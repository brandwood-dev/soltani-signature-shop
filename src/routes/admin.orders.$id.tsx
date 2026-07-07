import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrder, updateAdminOrderStatus, type AdminOrderStatus } from "@/lib/admin-orders-api";
import { formatDate, formatTND } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetails,
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Commande introuvable.{" "}
      <Link to="/admin/orders" className="text-primary underline">
        Retour à la liste
      </Link>
    </div>
  ),
  loader: async ({ params }) => {
    try {
      const order = await getAdminOrder(params.id);
      return { order };
    } catch {
      throw notFound();
    }
  },
});

function OrderDetails() {
  const { order } = Route.useLoaderData();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [status, setStatus] = useState<AdminOrderStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const timeline = [
    { key: "pending", label: "Commande reçue", icon: Clock, date: currentOrder.createdAt },
    { key: "processing", label: "En préparation", icon: Package, date: currentOrder.updatedAt },
    { key: "shipped", label: "Expédiée", icon: Truck, date: currentOrder.updatedAt },
    { key: "delivered", label: "Livrée", icon: CheckCircle2, date: currentOrder.updatedAt },
  ];
  const orderIndex = ["pending", "processing", "shipped", "delivered"].indexOf(currentOrder.status);
  const isCancelled = currentOrder.status === "cancelled";

  const saveStatus = async () => {
    try {
      setSaving(true);
      setError("");
      const next = await updateAdminOrderStatus(currentOrder.id, status);
      setCurrentOrder(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title={currentOrder.reference}
        subtitle={`Commande passée le ${formatDate(currentOrder.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-9">
              <Link to="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </Button>
            <Button size="sm" className="h-9">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Facture</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-3 sm:p-6">
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-3 sm:space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Statut</CardTitle>
                <StatusBadge status={currentOrder.status} />
              </CardHeader>
              <CardContent>
                {isCancelled ? (
                  <div className="flex items-center gap-2 rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                    <XCircle className="h-4 w-4" />
                    Cette commande a été annulée
                  </div>
                ) : (
                  <ol className="relative space-y-4">
                    {timeline.map((t, index) => {
                      const done = index <= orderIndex;
                      const active = index === orderIndex;
                      return (
                        <li key={t.key} className="flex items-start gap-3">
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <t.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>
                              {t.label}
                              {active && (
                                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  En cours
                                </span>
                              )}
                            </p>
                            {done && <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Select value={status} onValueChange={(value) => setStatus(value as AdminOrderStatus)}>
                    <SelectTrigger className="h-9 flex-1 sm:max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En préparation</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-9" disabled={saving || status === currentOrder.status} onClick={saveStatus}>
                    {saving ? "Mise à jour…" : "Mettre à jour"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Articles ({currentOrder.items})</CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="divide-y divide-border sm:hidden">
                  {currentOrder.lineItems.map((item) => (
                    <div key={item.id} className="flex gap-3 px-3 py-3">
                      <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-tight">{item.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.brand} · SKU {item.sku}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Qté : {item.qty}</span>
                          <span className="font-semibold tabular-nums">{formatTND(item.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Prix</TableHead>
                        <TableHead className="text-right">Qté</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrder.lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{item.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.brand} · {item.sku}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatTND(item.price)}</TableCell>
                          <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">{formatTND(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-4 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="tabular-nums">{formatTND(currentOrder.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="tabular-nums">
                    {currentOrder.shippingTotal === 0 ? "Offerte" : formatTND(currentOrder.shippingTotal)}
                  </span>
                </div>
                {currentOrder.discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remise</span>
                    <span className="tabular-nums">-{formatTND(currentOrder.discountTotal)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatTND(currentOrder.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">{currentOrder.customer}</p>
                  <p className="text-xs text-muted-foreground">Commande client réelle</p>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <a href={`mailto:${currentOrder.email}`} className="break-all text-primary hover:underline">
                    {currentOrder.email}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{currentOrder.phone || currentOrder.shippingAddress.phone || "Non renseigné"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                    <p className="text-muted-foreground">{currentOrder.shippingAddress.addressLine1}</p>
                    {currentOrder.shippingAddress.addressLine2 && (
                      <p className="text-muted-foreground">{currentOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {[
                        currentOrder.shippingAddress.postalCode,
                        currentOrder.shippingAddress.city,
                        currentOrder.shippingAddress.governorate,
                      ].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-muted-foreground">Tunisie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{currentOrder.paymentMethod === "card" ? "Carte bancaire" : "Espèces à la livraison"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Statut</span>
                  <span className="font-medium text-emerald-600">
                    {currentOrder.paymentStatus === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
