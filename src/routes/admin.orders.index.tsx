import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Eye, MoreHorizontal, Download } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadAdminOrdersExport,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderExportPeriod,
  type AdminOrderListItem,
  type AdminOrderStatus,
} from "@/lib/admin-orders-api";
import { downloadBlob } from "@/lib/api";
import { formatDate, formatTND } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/orders/")({
  validateSearch: (search: Record<string, unknown>) => ({
    query: typeof search.query === "string" ? search.query : "",
  }),
  component: AdminOrders,
});

const TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;
const TAB_LABELS: Record<string, string> = {
  all: "Toutes",
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédiées",
  delivered: "Livrées",
  cancelled: "Annulées",
};

const EXPORT_PERIODS: Array<{ value: AdminOrderExportPeriod; label: string }> = [
  { value: "today", label: "Aujourd’hui" },
  { value: "yesterday", label: "Hier" },
  { value: "last_7_days", label: "7 derniers jours" },
  { value: "last_14_days", label: "14 derniers jours" },
  { value: "last_30_days", label: "30 derniers jours" },
  { value: "this_week", label: "Cette semaine" },
  { value: "this_month", label: "Ce mois-ci" },
  { value: "this_year", label: "Cette année" },
  { value: "all", label: "Toutes" },
];

function AdminOrders() {
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.query);
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<AdminOrderExportPeriod>("today");
  const [exportStatus, setExportStatus] = useState<"all" | AdminOrderStatus>("all");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminOrders({
        query,
        status: tab,
        payment: payment as "all" | "card" | "cod",
        page,
        pageSize,
      });
      setOrders(response.orders);
      setCounts(response.statusCounts);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les commandes.");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [query, tab, payment, page, pageSize]);

  const setOrderStatus = async (id: string, status: AdminOrderStatus) => {
    try {
      setError("");
      await updateAdminOrderStatus(id, status);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  };

  const exportOrders = async () => {
    try {
      setExporting(true);
      setExportError("");
      const file = await downloadAdminOrdersExport({ period: exportPeriod, status: exportStatus });
      downloadBlob(file.blob, file.filename);
      setExportOpen(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export impossible.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Commandes"
        subtitle={`${total} commandes`}
        actions={
          <Button size="sm" variant="outline" className="h-9" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        {/* Tabs */}
        <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }}>
            <TabsList className="h-9">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {TAB_LABELS[t]}
                  <span className="ml-1.5 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] tabular-nums">
                    {counts[t] ?? 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Rechercher référence, client, email…"
                  className="h-9 pl-9"
                />
              </div>
              <Select value={payment} onValueChange={(v) => { setPayment(v); setPage(1); }}>
                <SelectTrigger className="h-9 sm:w-[180px]">
                  <SelectValue placeholder="Paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous paiements</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="cod">Espèces (livraison)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* List */}
        <Card className="overflow-hidden">
          {/* Mobile */}
          <div className="divide-y divide-border sm:hidden">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/admin/orders/$id"
                params={{ id: o.id }}
                className="block p-3 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.reference}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.customer}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatDate(o.createdAt)} · {o.items} art.
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatTND(o.total)}
                  </span>
                </div>
              </Link>
            ))}
            {!loading && orders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucune commande.
              </div>
            )}
            {loading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Chargement des commandes…
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Paiement</TableHead>
                  <TableHead className="hidden md:table-cell">Articles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: o.id }}
                        className="hover:underline"
                      >
                        {o.reference}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{o.customer}</p>
                        <p className="truncate text-xs text-muted-foreground">{o.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {o.paymentMethod === "card" ? "Carte" : "Espèces"}
                    </TableCell>
                    <TableCell className="hidden tabular-nums md:table-cell">
                      {o.items}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatTND(o.total)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/orders/$id" params={{ id: o.id }}>
                              <Eye className="h-4 w-4" /> Voir détails
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setOrderStatus(o.id, "shipped")}>Marquer expédiée</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setOrderStatus(o.id, "delivered")}>Marquer livrée</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setOrderStatus(o.id, "cancelled")}>
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      Aucune commande.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      Chargement des commandes…
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </Card>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les commandes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={exportPeriod} onValueChange={(value) => setExportPeriod(value as AdminOrderExportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={exportStatus} onValueChange={(value) => setExportStatus(value as "all" | AdminOrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TABS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {TAB_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {exportError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {exportError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExportOpen(false)} disabled={exporting}>
              Annuler
            </Button>
            <Button type="button" onClick={exportOrders} disabled={exporting}>
              {exporting ? "Export en cours…" : "Exporter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
