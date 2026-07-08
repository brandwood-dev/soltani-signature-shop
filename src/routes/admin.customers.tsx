import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminCustomer,
  getAdminCustomers,
  updateAdminCustomerStatus,
  type AdminCustomerDetails,
  type AdminCustomerListItem,
} from "@/lib/admin-customers-api";
import { formatDate, formatTND } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AdminCustomers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<AdminCustomerDetails | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminCustomers({ query, page, pageSize });
      setCustomers(response.customers);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les clients.");
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [query, page, pageSize]);

  const openProfile = async (id: string) => {
    try {
      setError("");
      setProfile(await getAdminCustomer(id));
      setProfileOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le profil client.");
    }
  };

  const toggleBlocked = async (customer: AdminCustomerListItem) => {
    try {
      setError("");
      await updateAdminCustomerStatus(customer.id, customer.status === "blocked" ? "active" : "blocked");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier le statut client.");
    }
  };

  const viewOrders = (customer: AdminCustomerListItem) => {
    navigate({ to: "/admin/orders", search: { query: customer.email } });
  };

  return (
    <>
      <AdminHeader title="Clients" subtitle={`${total} clients`} />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Rechercher nom, email, téléphone…"
                className="h-9 pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="divide-y divide-border sm:hidden">
            {customers.map((c) => (
              <div key={c.id} className="flex gap-3 p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-muted text-xs">
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    {c.status === "blocked" && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                        Bloqué
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    {c.email}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    {c.phone || "—"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {c.orders} commande(s)
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatTND(c.spent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && customers.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun client.
              </div>
            )}
            {loading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Chargement des clients…
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                  <TableHead className="hidden lg:table-cell">Inscrit</TableHead>
                  <TableHead className="text-right">Commandes</TableHead>
                  <TableHead className="text-right">Total dépensé</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-muted text-xs">
                            {initials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{c.name}</p>
                            {c.status === "blocked" && (
                              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                                Bloqué
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {c.phone || "—"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.orders}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatTND(c.spent)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openProfile(c.id)}>Voir profil</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => viewOrders(c)}>Voir commandes</DropdownMenuItem>
                          <DropdownMenuItem
                            className={c.status === "blocked" ? "" : "text-destructive"}
                            onClick={() => toggleBlocked(c)}
                          >
                            {c.status === "blocked" ? "Débloquer" : "Bloquer"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      Aucun client.
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      Chargement des clients…
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

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{profile?.name ?? "Profil client"}</DialogTitle>
            <DialogDescription>
              Informations réelles du compte client et historique récent.
            </DialogDescription>
          </DialogHeader>
          {profile && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p className="font-medium">{profile.status === "blocked" ? "Bloqué" : "Actif"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inscrit le</p>
                  <p className="font-medium">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Commandes récentes</p>
                <div className="space-y-2">
                  {profile.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span>{order.reference}</span>
                      <span className="font-semibold tabular-nums">{formatTND(order.total)}</span>
                    </div>
                  ))}
                  {profile.recentOrders.length === 0 && (
                    <p className="rounded-md border px-3 py-2 text-muted-foreground">Aucune commande.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
