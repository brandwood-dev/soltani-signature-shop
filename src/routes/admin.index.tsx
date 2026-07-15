import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";


import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  DateRangeFilter,
  getDefaultPeriod,
  type DatePeriod,
} from "@/components/admin/DateRangeFilter";
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
  getAdminDashboardKpis,
  getAdminDashboardRecentOrders,
  getAdminDashboardRevenueSeries,
  getAdminDashboardStockSummary,
  getAdminDashboardTopProducts,
} from "@/lib/admin-dashboard-api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [period, setPeriod] = useState<DatePeriod>(() => getDefaultPeriod());
  const periodKey = `${period.from.toISOString()}:${period.to.toISOString()}`;

  const kpisQuery = useQuery({
    queryKey: ["admin-dashboard", "kpis", periodKey],
    queryFn: () => getAdminDashboardKpis(period),
    staleTime: 30_000,
  });
  const stockQuery = useQuery({
    queryKey: ["admin-dashboard", "stock"],
    queryFn: getAdminDashboardStockSummary,
    staleTime: 45_000,
  });
  const revenueQuery = useQuery({
    queryKey: ["admin-dashboard", "revenue", periodKey],
    queryFn: () => getAdminDashboardRevenueSeries(period),
    staleTime: 60_000,
  });
  const topProductsQuery = useQuery({
    queryKey: ["admin-dashboard", "top-products", periodKey],
    queryFn: () => getAdminDashboardTopProducts(period),
    staleTime: 180_000,
  });
  const recentOrdersQuery = useQuery({
    queryKey: ["admin-dashboard", "recent-orders"],
    queryFn: getAdminDashboardRecentOrders,
    staleTime: 30_000,
  });

  const kpis = kpisQuery.data?.kpis
    ? {
        ...kpisQuery.data.kpis,
        products: stockQuery.data?.products ?? 0,
        lowStock: stockQuery.data?.lowStock ?? 0,
      }
    : undefined;
  const series = revenueQuery.data?.series ?? [];
  const topProducts = topProductsQuery.data?.topProducts ?? [];
  const recentOrders = recentOrdersQuery.data?.recentOrders ?? [];
  const kpisLoading = kpisQuery.isLoading || stockQuery.isLoading;
  const revenueLoading = revenueQuery.isLoading;
  const topProductsLoading = topProductsQuery.isLoading;
  const recentOrdersLoading = recentOrdersQuery.isLoading;
  const error = [kpisQuery.error, stockQuery.error, revenueQuery.error, topProductsQuery.error, recentOrdersQuery.error]
    .find(Boolean);
  const errorMessage = error instanceof Error ? error.message : "";
  const hasRevenueSeries = series.some((point) => point.value > 0);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartContainerWidth, setChartContainerWidth] = useState(0);
  const [activeChartPoint, setActiveChartPoint] = useState<{
    date: string;
    day: string;
    value: number;
    x: number;
    y: number;
    fullDate: string;
  } | null>(null);
  const chartWidth = Math.max(320, chartContainerWidth || 720);
  const chartHeight = 220;
  const chartPadding = { top: 16, right: 18, bottom: 36, left: 58 };
  const chartMax = Math.max(...series.map((point) => point.value), 1);
  const chartBottom = chartHeight - chartPadding.bottom;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const maxXAxisLabels = Math.max(2, Math.floor(plotWidth / 86));
  const labelStep = Math.max(1, Math.ceil(series.length / maxXAxisLabels));
  const chartPoints = useMemo(() => series.map((point, index) => {
    const x =
      chartPadding.left +
      (series.length <= 1 ? plotWidth / 2 : (index / (series.length - 1)) * plotWidth);
    const y = chartPadding.top + (1 - point.value / chartMax) * plotHeight;
    const fullDate = new Date(point.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return { ...point, x, y, fullDate };
  }), [chartMax, plotHeight, plotWidth, series]);
  const shouldShowXAxisLabel = (index: number) =>
    index === 0 || index === chartPoints.length - 1 || index % labelStep === 0;
  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = chartPoints.length
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartBottom} L ${chartPoints[0].x} ${chartBottom} Z`
    : "";
  const tooltipWidth = 150;
  const tooltipHeight = 52;
  const tooltipX = activeChartPoint
    ? Math.min(Math.max(activeChartPoint.x - tooltipWidth / 2, chartPadding.left), chartWidth - tooltipWidth - chartPadding.right)
    : 0;
  const tooltipY = activeChartPoint
    ? Math.max(chartPadding.top, activeChartPoint.y - tooltipHeight - 10)
    : 0;

  useEffect(() => {
    if (typeof performance === "undefined") return;
    const marker = "admin-dashboard-render-visible";
    performance.mark(marker);
    try {
      performance.measure("admin-dashboard-route-visible", marker);
    } catch {
      // Ignore unsupported Performance API cases without affecting the admin UI.
    }
  }, []);

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setChartContainerWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const cards = [
    {
      label: "Chiffre d'affaires",
      value: kpisLoading ? "..." : formatTND(kpis?.revenue ?? 0),
      delta: kpis?.revenueDelta ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Commandes",
      value: kpisLoading ? "..." : String(kpis?.orders ?? 0),
      delta: kpis?.ordersDelta ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Nouveaux clients",
      value: kpisLoading ? "..." : String(kpis?.customers ?? 0),
      delta: kpis?.customersDelta ?? 0,
      icon: Users,
    },
    {
      label: "Panier moyen",
      value: kpisLoading ? "..." : formatTND(kpis?.averageBasket ?? 0),
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
          </div>
        }
      />

      <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
        {errorMessage && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
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
                    <span className="text-muted-foreground">vs periode precedente</span>
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
              <CardTitle className="text-base">Revenu - {period.label}</CardTitle>
              <span className="text-xs text-muted-foreground">DT</span>
            </CardHeader>
            <CardContent>
              <div ref={chartContainerRef} className="min-h-[220px] w-full overflow-hidden">
                {revenueLoading ? (
                  <div className="flex h-[220px] w-full items-center justify-center rounded-md bg-muted/30 text-sm text-muted-foreground">
                    Chargement du graphique...
                  </div>
                ) : revenueQuery.isError ? (
                  <div className="flex h-[220px] w-full items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 px-4 text-center text-sm text-destructive">
                    Impossible de charger les donnees du graphique.
                  </div>
                ) : !series.length || !hasRevenueSeries ? (
                  <div className="flex h-[220px] w-full flex-col items-center justify-center rounded-md bg-muted/30 px-4 text-center">
                    <p className="text-sm font-medium text-foreground">Aucun revenu livré sur cette période.</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Le graphique se remplira dès qu'une commande livrée existe dans la plage sélectionnée.
                    </p>
                  </div>
                ) : (
                  <svg
                    width="100%"
                    height={chartHeight}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    role="img"
                    aria-label={`Chiffre d'affaires livre pour ${period.label}`}
                    className="block w-full"
                    onMouseLeave={() => setActiveChartPoint(null)}
                  >
                    <defs>
                      <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                      const y = chartPadding.top + tick * (chartBottom - chartPadding.top);
                      const value = Math.round(chartMax * (1 - tick));
                      return (
                        <g key={tick}>
                          <line
                            x1={chartPadding.left}
                            x2={chartWidth - chartPadding.right}
                            y1={y}
                            y2={y}
                            stroke="hsl(var(--border))"
                            strokeDasharray={tick === 1 ? "0" : "4 4"}
                            strokeOpacity="0.7"
                          />
                          <text
                            x={chartPadding.left - 10}
                            y={y + 4}
                            textAnchor="end"
                            className="fill-muted-foreground text-[10px]"
                          >
                            {formatTND(value)}
                          </text>
                        </g>
                      );
                    })}
                    <path d={areaPath} fill="url(#revenue-area)" />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                    />
                    {chartPoints.map((point, index) => (
                      <rect
                        key={`hit-${point.date}`}
                        x={Math.max(chartPadding.left, point.x - Math.max(8, plotWidth / Math.max(chartPoints.length, 1) / 2))}
                        y={chartPadding.top}
                        width={Math.max(12, plotWidth / Math.max(chartPoints.length - 1, 1))}
                        height={chartBottom - chartPadding.top}
                        fill="transparent"
                        onMouseEnter={() => setActiveChartPoint(point)}
                        onFocus={() => setActiveChartPoint(point)}
                        onClick={() => setActiveChartPoint(point)}
                        tabIndex={0}
                        aria-label={`${point.fullDate}: ${formatTND(point.value)}`}
                      />
                    ))}
                    {chartPoints.map((point, index) => (
                      <g key={point.date} pointerEvents="none">
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={point.value > 0 || shouldShowXAxisLabel(index) ? "3.5" : "2"}
                          className="fill-background stroke-primary"
                          strokeWidth="2.5"
                        >
                          <title>{`${point.fullDate} - ${formatTND(point.value)}`}</title>
                        </circle>
                        {shouldShowXAxisLabel(index) && (
                          <text
                            x={point.x}
                            y={chartHeight - 10}
                            textAnchor={index === 0 ? "start" : index === chartPoints.length - 1 ? "end" : "middle"}
                            className="fill-muted-foreground text-[10px] font-medium"
                          >
                            {point.day}
                          </text>
                        )}
                      </g>
                    ))}
                    {activeChartPoint && (
                      <g pointerEvents="none">
                        <line
                          x1={activeChartPoint.x}
                          x2={activeChartPoint.x}
                          y1={chartPadding.top}
                          y2={chartBottom}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="3 3"
                          strokeOpacity="0.35"
                        />
                        <rect
                          x={tooltipX}
                          y={tooltipY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          rx="8"
                          className="fill-popover stroke-border"
                        />
                        <text x={tooltipX + 10} y={tooltipY + 20} className="fill-muted-foreground text-[10px] capitalize">
                          {activeChartPoint.fullDate}
                        </text>
                        <text x={tooltipX + 10} y={tooltipY + 40} className="fill-foreground text-[12px] font-semibold">
                          {formatTND(activeChartPoint.value)}
                        </text>
                      </g>
                    )}
                  </svg>
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
              {!topProductsLoading && topProducts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun produit vendu sur cette periode.
                </p>
              )}
              {topProductsLoading && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Chargement des produits...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Commandes recentes</CardTitle>
            <Link
              to="/admin/orders"
              search={{ query: "" }}
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
              {!recentOrdersLoading && recentOrders.length === 0 && (
                <div className="rounded-lg border border-border bg-background p-3 text-center text-sm text-muted-foreground">
                  Aucune commande recente.
                </div>
              )}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
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
                  {!recentOrdersLoading && recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        Aucune commande recente.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentOrdersLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        Chargement des commandes...
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


