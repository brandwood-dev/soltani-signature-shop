import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KPIS,
  MOCK_ORDERS,
  REVENUE_SERIES,
  TOP_PRODUCTS,
  formatDate,
  formatTND,
} from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const kpiCards = [
  {
    label: "Revenu du mois",
    value: formatTND(KPIS.revenueMonth),
    delta: "+12.4%",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Commandes (mois)",
    value: KPIS.ordersMonth.toString(),
    delta: "+8.1%",
    up: true,
    icon: ShoppingBag,
  },
  {
    label: "Nouveaux clients",
    value: KPIS.newCustomers.toString(),
    delta: "+3.2%",
    up: true,
    icon: Users,
  },
  {
    label: "Panier moyen",
    value: formatTND(KPIS.averageBasket),
    delta: "-1.4%",
    up: false,
    icon: Package,
  },
];

function AdminDashboard() {
  const max = Math.max(...REVENUE_SERIES.map((d) => d.value));
  const recentOrders = MOCK_ORDERS.slice(0, 6);

  return (
    <>
      <AdminHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre boutique"
        actions={
          <Button size="sm" variant="outline" className="h-9">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpiCards.map((k) => (
            <Card key={k.label} className="overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </span>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                    <k.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  {k.value}
                </div>
                <div
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    k.up ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {k.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {k.delta}
                  <span className="text-muted-foreground">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Revenue chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Revenu — 7 derniers jours</CardTitle>
              <span className="text-xs text-muted-foreground">DT</span>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-2 sm:h-64 sm:gap-4">
                {REVENUE_SERIES.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all hover:from-primary/40 hover:to-primary"
                        style={{ height: `${(d.value / max) * 100}%` }}
                        title={formatTND(d.value)}
                      />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top produits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TOP_PRODUCTS.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">{p.sold}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      vendus
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Commandes récentes</CardTitle>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {/* Mobile cards */}
            <div className="space-y-2 px-3 sm:hidden">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.reference}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.customer}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                    <span className="font-semibold tabular-nums">{formatTND(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.reference}</TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatTND(o.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
