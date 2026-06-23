import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
import {
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  formatDate,
  formatTND,
} from "@/lib/admin/mock-data";

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
  loader: ({ params }) => {
    const order = MOCK_ORDERS.find((o) => o.id === params.id);
    if (!order) throw notFound();
    return { order };
  },
});

function OrderDetails() {
  const { order } = Route.useLoaderData();

  // Mock line items derived from the order
  const items = MOCK_PRODUCTS.slice(
    parseInt(order.id.split("_")[1], 10) % 10,
    (parseInt(order.id.split("_")[1], 10) % 10) + order.items
  ).map((p) => ({
    ...p,
    qty: 1 + ((p.id.charCodeAt(p.id.length - 1) % 3)),
  }));

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal > 500 ? 0 : 9;
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + shipping + tax;

  const timeline = [
    { key: "pending", label: "Commande reçue", icon: Clock, date: order.createdAt },
    { key: "processing", label: "En préparation", icon: Package, date: order.createdAt },
    { key: "shipped", label: "Expédiée", icon: Truck, date: order.createdAt },
    { key: "delivered", label: "Livrée", icon: CheckCircle2, date: order.createdAt },
  ];
  const order_index = ["pending", "processing", "shipped", "delivered"].indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <>
      <AdminHeader
        title={order.reference}
        subtitle={`Commande passée le ${formatDate(order.createdAt)}`}
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
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-3 sm:space-y-6 lg:col-span-2">
            {/* Status & Timeline */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Statut</CardTitle>
                <StatusBadge status={order.status} />
              </CardHeader>
              <CardContent>
                {isCancelled ? (
                  <div className="flex items-center gap-2 rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                    <XCircle className="h-4 w-4" />
                    Cette commande a été annulée
                  </div>
                ) : (
                  <ol className="relative space-y-4">
                    {timeline.map((t, i) => {
                      const done = i <= order_index;
                      const active = i === order_index;
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
                            <p
                              className={`text-sm ${
                                done ? "font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {t.label}
                              {active && (
                                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  En cours
                                </span>
                              )}
                            </p>
                            {done && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(t.date)}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Select defaultValue={order.status}>
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
                  <Button size="sm" className="h-9">
                    Mettre à jour
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Articles ({order.items})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                {/* Mobile */}
                <div className="divide-y divide-border sm:hidden">
                  {items.map((it) => (
                    <div key={it.id} className="flex gap-3 px-3 py-3">
                      <img
                        src={it.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-tight">
                          {it.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {it.brand} · SKU {it.sku}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Qté : {it.qty}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatTND(it.price * it.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop */}
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
                      {items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={it.image}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-md object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {it.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {it.brand} · {it.sku}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatTND(it.price)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {it.qty}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {formatTND(it.price * it.qty)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="space-y-2 p-4 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="tabular-nums">{formatTND(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="tabular-nums">
                    {shipping === 0 ? "Offerte" : formatTND(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">TVA (19%)</span>
                  <span className="tabular-nums">{formatTND(tax)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatTND(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side */}
          <div className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">Client depuis 2024</p>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`mailto:${order.email}`}
                    className="break-all text-primary hover:underline"
                  >
                    {order.email}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>+216 22 345 678</span>
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
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-muted-foreground">12 Rue de la Liberté</p>
                    <p className="text-muted-foreground">1002 Tunis Belvédère</p>
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
                  <span>
                    {order.paymentMethod === "card"
                      ? "Carte bancaire"
                      : "Espèces à la livraison"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Statut</span>
                  <span className="font-medium text-emerald-600">Payé</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
