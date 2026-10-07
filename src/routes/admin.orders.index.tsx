import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useState } from "react";
import { Search, Eye, MoreHorizontal, Download, ChevronDown } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  bulkUpdateAdminOrderStatus,
  getAdminOrders,
  getAdminOrdersStatusSummary,
  updateAdminOrderStatus,
  type AdminOrderExportFormat,
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

const QUICK_STATUS_OPTIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const BULK_STATUS_OPTIONS: AdminOrderStatus[] = ["processing", "shipped", "delivered", "cancelled"];

const EXPORT_PERIODS: Array<{ value: AdminOrderExportPeriod; label: string }> = [
  { value: "today", label: "Aujourd’hui" },
  { value: "yesterday", label: "Hier" },
  { value: "last_7_days", label: "7 derniers jours" },
  { value: "last_14_days", label: "14 derniers jours" },
  { value: "last_30_days", label: "30 derniers jours" },
  { value: "this_week", label: "Cette semaine" },
  { value: "this_month", label: "Ce mois-ci" },
  { value: "this_year", label: "Cette année" },
  { value: "custom", label: "Période personnalisée" },
  { value: "all", label: "Toutes" },
];

const EXPORT_FORMATS: Array<{ value: AdminOrderExportFormat; label: string }> = [
  { value: "pdf", label: "PDF charté" },
  { value: "xls", label: "Tableau XLS" },
];

const EXPORT_STATUS_OPTIONS: AdminOrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.query);
  const deferredQuery = useDeferredValue(query);
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
  const [exportStatuses, setExportStatuses] = useState<AdminOrderStatus[]>([]);
  const [exportFormat, setExportFormat] = useState<AdminOrderExportFormat>("pdf");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<AdminOrderStatus>("processing");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const paymentFilter = payment as "all" | "card" | "cod";
      const [response, summary] = await Promise.all([
        getAdminOrders({
          query: deferredQuery,
          status: tab,
          payment: paymentFilter,
          page,
          pageSize,
        }),
        getAdminOrdersStatusSummary({
          query: deferredQuery,
          payment: paymentFilter,
        }),
      ]);
      setOrders(response.orders);
      setCounts(summary.statusCounts);
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
  }, [deferredQuery, tab, payment, page, pageSize]);

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [deferredQuery, tab, payment, page, pageSize]);

  const selectedOrders = orders.filter((order) => selectedOrderIds.includes(order.id));
  const selectedOrderIdSet = new Set(selectedOrderIds);
  const allVisibleSelected =
    orders.length > 0 && orders.every((order) => selectedOrderIdSet.has(order.id));
  const someVisibleSelected = orders.some((order) => selectedOrderIdSet.has(order.id));
  const bulkStatusOptions =
    selectedOrders.length === 0
      ? []
      : BULK_STATUS_OPTIONS.filter((status) =>
          selectedOrders.every(
            (order) =>
              order.status !== status && QUICK_STATUS_OPTIONS[order.status].includes(status),
          ),
        );

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  };

  const toggleAllVisibleOrders = () => {
    setSelectedOrderIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !orders.some((order) => order.id === id))
        : [...new Set([...current, ...orders.map((order) => order.id)])],
    );
  };

  const openBulkStatusDialog = () => {
    if (bulkStatusOptions.length === 0) return;
    setBulkTargetStatus((current) =>
      bulkStatusOptions.includes(current) ? current : bulkStatusOptions[0],
    );
    setBulkDialogOpen(true);
  };

  const applyBulkStatus = async () => {
    if (!selectedOrderIds.length || !bulkStatusOptions.includes(bulkTargetStatus)) return;

    try {
      setBulkUpdating(true);
      setError("");
      const result = await bulkUpdateAdminOrderStatus(selectedOrderIds, bulkTargetStatus);
      setBulkDialogOpen(false);
      setSelectedOrderIds([]);
      await refresh();
      if (result.failed > 0) {
        const failedReferences = result.results
          .filter((item) => !item.updated)
          .map((item) => item.reference ?? item.id)
          .join(", ");
        setError(`${result.updated} commande(s) mise(s) à jour. Échec pour : ${failedReferences}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour groupée impossible.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const setOrderStatus = async (id: string, status: AdminOrderStatus) => {
    const previousOrders = orders;
    const previousTotal = total;
    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder || currentOrder.status === status) return;

    const shouldRemainVisible = tab === "all" || tab === status;
    setOrders((current) =>
      current
        .map((order) => (order.id === id ? { ...order, status } : order))
        .filter((order) => order.id !== id || shouldRemainVisible),
    );
    if (!shouldRemainVisible) {
      setTotal((current) => Math.max(0, current - 1));
    }
    setCounts((current) => ({
      ...current,
      [currentOrder.status]: Math.max(0, (current[currentOrder.status] ?? 0) - 1),
      [status]: (current[status] ?? 0) + 1,
    }));
    try {
      setError("");
      await updateAdminOrderStatus(id, status);
    } catch (err) {
      setOrders(previousOrders);
      setTotal(previousTotal);
      setCounts((current) => ({
        ...current,
        [currentOrder.status]: (current[currentOrder.status] ?? 0) + 1,
        [status]: Math.max(0, (current[status] ?? 0) - 1),
      }));
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  };

  const exportOrders = async () => {
    if (exportPeriod === "custom") {
      if (!exportFrom || !exportTo) {
        setExportError("Sélectionnez une date de début et une date de fin.");
        return;
      }
      if (exportFrom > exportTo) {
        setExportError("La date de début doit précéder la date de fin.");
        return;
      }
    }

    try {
      setExporting(true);
      setExportError("");
      const file = await downloadAdminOrdersExport({
        period: exportPeriod,
        status: exportStatuses,
        format: exportFormat,
        ...(exportPeriod === "custom" ? { from: exportFrom, to: exportTo } : {}),
      });
      downloadBlob(file.blob, file.filename);
      setExportOpen(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export impossible.");
    } finally {
      setExporting(false);
    }
  };

  const exportStatusLabel =
    exportStatuses.length === 0
      ? "Tous les statuts"
      : exportStatuses.length === 1
        ? TAB_LABELS[exportStatuses[0]]
        : `${exportStatuses.length} statuts sélectionnés`;

  const toggleExportStatus = (status: AdminOrderStatus) => {
    setExportStatuses((current) =>
      current.includes(status)
        ? current.filter((selected) => selected !== status)
        : [...current, status],
    );
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
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as typeof tab);
              setPage(1);
            }}
          >
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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Rechercher référence, client, email…"
                  className="h-9 pl-9"
                />
              </div>
              <Select
                value={payment}
                onValueChange={(v) => {
                  setPayment(v);
                  setPage(1);
                }}
              >
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

        {selectedOrderIds.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div>
                <p className="text-sm font-semibold">
                  {selectedOrderIds.length} commande(s) sélectionnée(s)
                </p>
                <p className="text-xs text-muted-foreground">
                  La sélection concerne uniquement la page actuelle.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {bulkStatusOptions.length > 0 ? (
                  <>
                    <Select
                      value={bulkTargetStatus}
                      onValueChange={(value) => setBulkTargetStatus(value as AdminOrderStatus)}
                    >
                      <SelectTrigger className="h-9 w-full sm:w-[190px]">
                        <SelectValue placeholder="Nouveau statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {TAB_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={openBulkStatusDialog} disabled={bulkUpdating}>
                      Modifier le statut
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Aucune transition commune disponible.
                  </p>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedOrderIds([])}
                  disabled={bulkUpdating}
                >
                  Désélectionner
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <Card className="overflow-hidden">
          {/* Mobile */}
          <div className="divide-y divide-border sm:hidden">
            {orders.length > 0 && (
              <div className="flex items-center gap-3 bg-muted/30 px-3 py-2 text-sm">
                <Checkbox
                  checked={
                    allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAllVisibleOrders}
                  aria-label="Sélectionner les commandes de la page"
                />
                <span>Sélectionner la page</span>
              </div>
            )}
            {orders.map((o) => (
              <div key={o.id} className="flex items-start gap-3 p-3 hover:bg-muted/40">
                <Checkbox
                  checked={selectedOrderIdSet.has(o.id)}
                  onCheckedChange={() => toggleOrderSelection(o.id)}
                  aria-label={`Sélectionner la commande ${o.reference}`}
                  className="mt-1"
                />
                <Link to="/admin/orders/$id" params={{ id: o.id }} className="min-w-0 flex-1">
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
                    <span className="text-sm font-semibold tabular-nums">{formatTND(o.total)}</span>
                  </div>
                </Link>
              </div>
            ))}
            {!loading && orders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Aucune commande.</div>
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
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false
                      }
                      onCheckedChange={toggleAllVisibleOrders}
                      aria-label="Sélectionner les commandes de la page"
                    />
                  </TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={selectedOrderIdSet.has(o.id)}
                        onCheckedChange={() => toggleOrderSelection(o.id)}
                        aria-label={`Sélectionner la commande ${o.reference}`}
                      />
                    </TableCell>
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
                        <p className="truncate text-xs text-muted-foreground">
                          {o.email ?? "Email non fourni"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-xs lg:table-cell">
                      {o.paymentMethod === "card" ? "Carte" : "Espèces"}
                    </TableCell>
                    <TableCell className="hidden tabular-nums md:table-cell">{o.items}</TableCell>
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
                          {QUICK_STATUS_OPTIONS[o.status].includes("processing") && (
                            <DropdownMenuItem onClick={() => setOrderStatus(o.id, "processing")}>
                              Marquer en préparation
                            </DropdownMenuItem>
                          )}
                          {QUICK_STATUS_OPTIONS[o.status].includes("shipped") && (
                            <DropdownMenuItem onClick={() => setOrderStatus(o.id, "shipped")}>
                              Marquer expédiée
                            </DropdownMenuItem>
                          )}
                          {QUICK_STATUS_OPTIONS[o.status].includes("delivered") && (
                            <DropdownMenuItem onClick={() => setOrderStatus(o.id, "delivered")}>
                              Marquer livrée
                            </DropdownMenuItem>
                          )}
                          {QUICK_STATUS_OPTIONS[o.status].includes("cancelled") && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setOrderStatus(o.id, "cancelled")}
                            >
                              Annuler
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Aucune commande.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
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
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
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
              <Select
                value={exportPeriod}
                onValueChange={(value) => setExportPeriod(value as AdminOrderExportPeriod)}
              >
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
            {exportPeriod === "custom" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="export-from" className="text-sm font-medium">
                    Du
                  </label>
                  <Input
                    id="export-from"
                    type="date"
                    value={exportFrom}
                    onChange={(event) => setExportFrom(event.target.value)}
                    max={exportTo || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="export-to" className="text-sm font-medium">
                    Au
                  </label>
                  <Input
                    id="export-to"
                    type="date"
                    value={exportTo}
                    onChange={(event) => setExportTo(event.target.value)}
                    min={exportFrom || undefined}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between font-normal"
                  >
                    <span className="truncate">{exportStatusLabel}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-2"
                  align="start"
                >
                  <div className="space-y-1">
                    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
                      <Checkbox
                        checked={exportStatuses.length === 0}
                        onCheckedChange={() => setExportStatuses([])}
                      />
                      <span>Tous les statuts</span>
                    </label>
                    <div className="my-1 border-t" />
                    {EXPORT_STATUS_OPTIONS.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={exportStatuses.includes(status)}
                          onCheckedChange={() => toggleExportStatus(status)}
                        />
                        <span>{TAB_LABELS[status]}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as AdminOrderExportFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              La date de fin est incluse. L’export est limité à 366 jours pour préserver les
              performances.
            </p>
            {exportError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {exportError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportOpen(false)}
              disabled={exporting}
            >
              Annuler
            </Button>
            <Button type="button" onClick={exportOrders} disabled={exporting}>
              {exporting ? "Export en cours…" : "Exporter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkDialogOpen}
        onOpenChange={(open) => !bulkUpdating && setBulkDialogOpen(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la mise à jour groupée</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Vous allez passer <strong>{selectedOrderIds.length} commande(s)</strong> au statut
              <strong> {TAB_LABELS[bulkTargetStatus]}</strong>.
            </p>
            {bulkTargetStatus === "cancelled" && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                L’annulation restaure automatiquement le stock des articles concernés.
              </p>
            )}
            {bulkTargetStatus === "delivered" && (
              <p className="rounded-md border border-amber-300/50 bg-amber-50 p-3 text-amber-900">
                Vérifiez que toutes les commandes ont bien été livrées avant de confirmer.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              disabled={bulkUpdating}
            >
              Annuler
            </Button>
            <Button type="button" onClick={applyBulkStatus} disabled={bulkUpdating}>
              {bulkUpdating ? "Mise à jour…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
