import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye, MoreHorizontal, Download } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { MOCK_ORDERS, formatDate, formatTND } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/orders/")({
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

function AdminOrders() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: MOCK_ORDERS.length };
    for (const t of TABS) if (t !== "all") c[t] = MOCK_ORDERS.filter((o) => o.status === t).length;
    return c;
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (payment !== "all" && o.paymentMethod !== payment) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          o.reference.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, tab, payment]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <AdminHeader
        title="Commandes"
        subtitle={`${filtered.length} commandes`}
        actions={
          <Button size="sm" variant="outline" className="h-9">
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

        {/* List */}
        <Card className="overflow-hidden">
          {/* Mobile */}
          <div className="divide-y divide-border sm:hidden">
            {paged.map((o) => (
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
            {paged.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucune commande.
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
                {paged.map((o) => (
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
                          <DropdownMenuItem>Marquer expédiée</DropdownMenuItem>
                          <DropdownMenuItem>Marquer livrée</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      Aucune commande.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataPagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </Card>
      </div>
    </>
  );
}
