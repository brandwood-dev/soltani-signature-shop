import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataPagination } from "@/components/admin/DataPagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAdminProduct,
  getAdminProducts,
  type AdminProduct,
  type AdminProductBooleanFilter,
  type AdminProductSection,
  type AdminProductStatus,
  type AdminProductStockStatus,
} from "@/lib/admin-products-api";
import { flattenAdminCategoryOptions } from "@/lib/admin-product-filters";
import { getAdminCategories, type ApiCategory } from "@/lib/categories-api";
import { formatTND } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProducts,
});

function AdminProducts() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [section, setSection] = useState<"all" | AdminProductSection>("all");
  const [brand, setBrand] = useState("");
  const deferredBrand = useDeferredValue(brand);
  const [stockStatus, setStockStatus] = useState<AdminProductStockStatus>("all");
  const [promotion, setPromotion] = useState<AdminProductBooleanFilter>("all");
  const [featured, setFeatured] = useState<AdminProductBooleanFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [adminCategories, setAdminCategories] = useState<ApiCategory[]>([]);

  const categoryOptions = useMemo(
    () => flattenAdminCategoryOptions(adminCategories),
    [adminCategories],
  );

  const loadCategories = useCallback(async () => {
    try {
      setCategoryError("");
      setAdminCategories(await getAdminCategories());
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : "Impossible de charger les catégories.",
      );
    }
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminProducts({
        query: deferredQuery,
        status: status as "all" | AdminProductStatus,
        category,
        section: section === "all" ? undefined : section,
        brand: deferredBrand,
        stockStatus,
        promotion,
        featured,
        page,
        pageSize,
      });
      setProducts(response.products);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les produits.");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [deferredQuery, status, category, section, deferredBrand, stockStatus, promotion, featured, page, pageSize]);

  useEffect(() => {
    void loadCategories();
    const onWindowFocus = () => void loadCategories();
    window.addEventListener("focus", onWindowFocus);
    return () => window.removeEventListener("focus", onWindowFocus);
  }, [loadCategories]);

  const paged = products;
  const allChecked = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const productImage = (product: AdminProduct) => product.images[0]?.url || "/placeholder.svg";
  const advancedFilterCount = [
    section !== "all",
    Boolean(brand.trim()),
    stockStatus !== "all",
    promotion !== "all",
    featured !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setSection("all");
    setBrand("");
    setStockStatus("all");
    setPromotion("all");
    setFeatured("all");
    setPage(1);
  };

  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) paged.forEach((p) => next.delete(p.id));
    else paged.forEach((p) => next.add(p.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm("Supprimer ce produit ? Il sera archivé s'il est lié à une commande.")) return;
    try {
      setError("");
      await deleteAdminProduct(id);
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer le produit.");
    }
  };

  return (
    <>
      <AdminHeader
        title="Produits"
        subtitle={`${total} produits au catalogue`}
        actions={
          <Button asChild size="sm" className="h-9">
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouveau produit</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>
          </Button>
        }
      />

      <div className="flex-1 space-y-3 p-3 sm:space-y-4 sm:p-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Rechercher nom, SKU, marque…"
                  className="h-9 pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 sm:w-[140px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 sm:w-[160px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={!option.isActive ? "text-muted-foreground" : undefined}>
                          {option.label}
                          {!option.isActive ? " · inactive" : ""}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                <Filter className="h-4 w-4" />
                Plus de filtres{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}
              </Button>
            </div>
            {filtersOpen && (
              <div className="mt-3 space-y-3 rounded-md border bg-muted/20 p-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Section</label>
                    <Select
                      value={section}
                      onValueChange={(value) => {
                        setSection(value as "all" | AdminProductSection);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Toutes les sections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les sections</SelectItem>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="enfant">Enfant</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="bien-etre">Bien-être</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Stock</label>
                    <Select
                      value={stockStatus}
                      onValueChange={(value) => {
                        setStockStatus(value as AdminProductStockStatus);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Tous les stocks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les stocks</SelectItem>
                        <SelectItem value="available">En stock</SelectItem>
                        <SelectItem value="out">En rupture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Promotion</label>
                    <Select
                      value={promotion}
                      onValueChange={(value) => {
                        setPromotion(value as AdminProductBooleanFilter);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Toutes les promotions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les promotions</SelectItem>
                        <SelectItem value="yes">En promotion</SelectItem>
                        <SelectItem value="no">Sans promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Mise en avant</label>
                    <Select
                      value={featured}
                      onValueChange={(value) => {
                        setFeatured(value as AdminProductBooleanFilter);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Tous les produits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les produits</SelectItem>
                        <SelectItem value="yes">Mis en avant</SelectItem>
                        <SelectItem value="no">Non mis en avant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <label htmlFor="admin-product-brand" className="text-xs font-medium text-muted-foreground">
                      Marque
                    </label>
                    <Input
                      id="admin-product-brand"
                      value={brand}
                      onChange={(event) => {
                        setBrand(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Filtrer par marque…"
                      className="h-9"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-9" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => void loadCategories()}>
                    <RefreshCw className="h-4 w-4" />
                    Actualiser les catégories
                  </Button>
                </div>
                {categoryError && <p className="text-xs text-destructive">{categoryError}</p>}
              </div>
            )}
            {selected.size > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 text-xs">
                <span>{selected.size} sélectionné(s)</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-destructive"
                  onClick={() => selected.forEach((id) => void removeProduct(id))}
                >
                  Supprimer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          {error && (
            <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {loading && (
            <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
              Chargement des produits…
            </div>
          )}

          <div className="divide-y divide-border sm:hidden">
            {paged.map((p) => (
              <div key={p.id} className="flex gap-3 p-3">
                <img
                  src={productImage(p)}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg";
                  }}
                  className="h-16 w-16 shrink-0 rounded-md bg-muted object-contain object-center p-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-tight">{p.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/admin/products/$id/edit" params={{ id: p.id }}>
                            <Pencil className="h-4 w-4" /> Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => removeProduct(p.id)}>
                          <Trash2 className="h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {p.brand} · {p.sku}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge status={p.status} />
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatTND(p.price)}</p>
                      <p className="text-[10px] text-muted-foreground">Stock : {p.stockQuantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && paged.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Aucun produit trouvé.</div>
            )}
          </div>

          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                  <TableHead className="hidden lg:table-cell">SKU</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={productImage(p)}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.src = "/placeholder.svg";
                          }}
                          className="h-10 w-10 shrink-0 rounded-md bg-muted object-contain object-center p-1"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {p.subcategoryName ?? p.categoryName}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                      {p.sku}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatTND(p.price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={
                          p.stockQuantity < 5
                            ? "text-rose-600"
                            : p.stockQuantity < 15
                              ? "text-amber-600"
                              : ""
                        }
                      >
                        {p.stockQuantity}
                      </span>
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
                            <Link to="/admin/products/$id/edit" params={{ id: p.id }}>
                              <Pencil className="h-4 w-4" /> Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => removeProduct(p.id)}>
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      Aucun produit trouvé.
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
    </>
  );
}
