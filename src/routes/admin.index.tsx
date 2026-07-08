import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import {
  DateRangeFilter,
  getDefaultPeriod,
  type DatePeriod,
} from "@/components/admin/DateRangeFilter";
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
  formatDate,
  formatTND,
} from "@/lib/admin/mock-data";
import {
  getAdminDashboard,
  type AdminDashboardResponse,
} from "@/lib/admin-dashboard-api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [period, setPeriod] = useState<DatePeriod>(() => getDefaultPeriod());
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const kpis = dashboard?.kpis;
  const series = dashboard?.series ?? [];
  const topProducts = dashboard?.topProducts ?? [];
  const recentOrders = dashboard?.recentOrders ?? [];
  const max = Math.max(...series.map((d) => d.value), 1);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const next = await getAdminDashboard(period);
        if (mounted) setDashboard(next);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord.");
          setDashboard(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [period]);

  const cards = [
    {
      label: "Chiffre d'affaires",
      value: formatTND(kpis?.revenue ?? 0),
      delta: kpis?.revenueDelta ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Commandes",
      value: String(kpis?.orders ?? 0),
      delta: kpis?.ordersDelta ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Nouveaux clients",
      value: String(kpis?.customers ?? 0),
      delta: kpis?.customersDelta ?? 0,
      icon: Users,
    },
    {
      label: "Panier moyen",
      value: formatTND(kpis?.averageBasket ?? 0),
      delta: kpis?.averageBasketDelta ?? 0,
      icon: Package,
    },

  ];

  return (
    <>
      <AdminHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre boutique"
        actions={
          <div className="flex items-center gap-2">
            <DateRangeFilter value={period} onChange={setPeriod} />
            <Button size="sm" variant="outline" className="h-9">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((k) => {
            const up = k.delta >= 0;
            return (
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
                      up ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {up ? "+" : ""}
                    {k.delta}%
                    <span className="text-muted-foreground">vs période précédente</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Revenue chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Revenu — {period.label}</CardTitle>
              <span className="text-xs text-muted-foreground">DT</span>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-1.5 overflow-x-auto sm:h-64 sm:gap-2">
                {series.map((d, i) => (
                  <div
                    key={i}
                    className="flex min-w-[28px] flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all hover:from-primary/40 hover:to-primary"
                        style={{ height: `${(d.value / max) * 100}%` }}
                        title={formatTND(d.value)}
                      />
                    </div>
                    <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                      {d.day}
                    </span>
                  </div>
                ))}
                {!loading && series.length === 0 && (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Aucune donnée de revenu sur cette période.
                  </div>
                )}
                {loading && (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Chargement du graphique…
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top produits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md bg-muted" />
                  )}
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
              {!loading && topProducts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun produit vendu sur cette période.
                </p>
              )}
              {loading && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Chargement des produits…
                </p>
              )}
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
                <Link
                  key={o.id}
                  to="/admin/orders/$id"
                  params={{ id: o.id }}
                  className="block rounded-lg border border-border bg-background p-3 hover:bg-muted/40"
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
                </Link>
              ))}
              {!loading && recentOrders.length === 0 && (
                <div className="rounded-lg border border-border bg-background p-3 text-center text-sm text-muted-foreground">
                  Aucune commande récente.
                </div>
              )}
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
                    <TableRow key={o.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link
                          to="/admin/orders/$id"
                          params={{ id: o.id }}
                          className="hover:underline"
                        >
                          {o.reference}
                        </Link>
                      </TableCell>
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
                  {!loading && recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        Aucune commande récente.
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        Chargement des commandes…
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
