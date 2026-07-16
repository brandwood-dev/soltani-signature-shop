import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PriceRangeSlider } from "@/components/site/PriceRangeSlider";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import {
  getCatalogProductsPage,
  type CatalogProductsPage,
  type CatalogProductsQuery,
} from "@/lib/catalog-api";
import { getCatalogCategoryAttributes, type CategoryAttribute } from "@/lib/catalog-attributes-api";

const PAGE_SIZE = 24;

type SubcategoryFilter = {
  slug: string;
  name: string;
};

type Props = {
  categorySlug?: string;
  query?: string;
  section?: string;
  featured?: boolean;
  bestSeller?: boolean;
  promotion?: boolean;
  emptyMessage: string;
  emptyCtaLabel?: string;
  emptyCtaTo?: string;
  countLabel?: string;
  defaultSort?: string;
  subcategories?: SubcategoryFilter[];
  showDiscountFilter?: boolean;
};

type State = {
  brands: string[];
  subcategory: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount: number;
  sort: string;
  page: number;
  attributes: Record<string, string[]>;
};

const DISCOUNT_TIERS = [
  { label: "10% et +", min: 10 },
  { label: "20% et +", min: 20 },
  { label: "30% et +", min: 30 },
];

const initialState = (defaultSort: string): State => {
  if (typeof window === "undefined") {
    return { brands: [], subcategory: "all", minDiscount: 0, sort: defaultSort, page: 1, attributes: {} };
  }

  const params = new URLSearchParams(window.location.search);
  const attributes: Record<string, string[]> = {};
  params.forEach((value, key) => {
    if (!key.startsWith("attr_")) return;
    const attrKey = key.slice(5);
    const values = value.split(",").map((item) => item.trim()).filter(Boolean);
    if (attrKey && values.length) attributes[attrKey] = values;
  });

  return {
    brands: splitParam(params.get("brand")),
    subcategory: params.get("sub") || "all",
    minPrice: numberParam(params.get("minPrice")),
    maxPrice: numberParam(params.get("maxPrice")),
    minDiscount: numberParam(params.get("discount")) ?? 0,
    sort: params.get("sort") || defaultSort,
    page: numberParam(params.get("page")) ?? 1,
    attributes,
  };
};

export function FilterableProductListing({
  categorySlug,
  query,
  section,
  featured,
  bestSeller,
  promotion,
  emptyMessage,
  emptyCtaLabel = "Découvrir les produits",
  emptyCtaTo = "/",
  countLabel = "produit",
  defaultSort = "recommended",
  subcategories = [],
  showDiscountFilter = false,
}: Props) {
  const [state, setState] = useState<State>(() => initialState(defaultSort));
  const [openFilters, setOpenFilters] = useState(false);
  const [result, setResult] = useState<CatalogProductsPage | null>(null);
  const [dynamicFacets, setDynamicFacets] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCategorySlug = state.subcategory !== "all" ? state.subcategory : categorySlug;

  useEffect(() => {
    let active = true;
    if (!activeCategorySlug) {
      setDynamicFacets([]);
      return () => {
        active = false;
      };
    }

    getCatalogCategoryAttributes(activeCategorySlug)
      .then((items) => {
        if (active) setDynamicFacets(items.filter((item) => item.filterable));
      })
      .catch(() => {
        if (active) setDynamicFacets([]);
      });

    return () => {
      active = false;
    };
  }, [activeCategorySlug]);

  const queryParams = useMemo<CatalogProductsQuery>(
    () => ({
      category: activeCategorySlug ?? categorySlug,
      query,
      section,
      featured,
      bestSeller,
      promotion,
      brands: state.brands,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      minDiscount: showDiscountFilter && state.minDiscount > 0 ? state.minDiscount : undefined,
      sort: state.sort,
      page: state.page,
      pageSize: PAGE_SIZE,
      attributes: state.attributes,
    }),
    [activeCategorySlug, bestSeller, categorySlug, featured, promotion, query, section, showDiscountFilter, state],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getCatalogProductsPage(queryParams)
      .then((page) => {
        if (active) setResult(page);
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger les produits. Réessayez dans quelques instants.");
          setResult(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (state.brands.length) params.set("brand", state.brands.join(","));
    if (state.subcategory !== "all") params.set("sub", state.subcategory);
    if (Number.isFinite(state.minPrice)) params.set("minPrice", String(state.minPrice));
    if (Number.isFinite(state.maxPrice)) params.set("maxPrice", String(state.maxPrice));
    if (state.minDiscount > 0) params.set("discount", String(state.minDiscount));
    if (state.sort !== defaultSort) params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    Object.entries(state.attributes).forEach(([key, values]) => {
      if (values.length) params.set(`attr_${key}`, values.join(","));
    });
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [defaultSort, state]);

  const products = result?.products ?? [];
  const pagination = result?.pagination ?? { page: state.page, pageSize: PAGE_SIZE, total: 0, totalPages: 1 };
  const priceBounds = result?.facets.price ?? { min: 0, max: 0 };
  const selectedPriceRange: [number, number] = [
    state.minPrice ?? priceBounds.min,
    state.maxPrice ?? priceBounds.max,
  ];
  const brandOptions = result?.facets.brands ?? [];

  const setPartial = (partial: Partial<State>, resetPage = true) => {
    setState((current) => ({ ...current, ...partial, page: resetPage ? 1 : partial.page ?? current.page }));
  };

  const toggleBrand = (slug: string) => {
    setPartial({
      brands: state.brands.includes(slug)
        ? state.brands.filter((item) => item !== slug)
        : [...state.brands, slug],
    });
  };

  const toggleAttribute = (key: string, value: string) => {
    const current = state.attributes[key] ?? [];
    const nextValues = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPartial({
      attributes: {
        ...state.attributes,
        [key]: nextValues,
      },
    });
  };

  const resetFilters = () => {
    setState({ brands: [], subcategory: "all", minDiscount: 0, sort: defaultSort, page: 1, attributes: {} });
  };

  const activeCount =
    state.brands.length +
    Object.values(state.attributes).reduce((total, values) => total + values.length, 0) +
    (state.subcategory !== "all" ? 1 : 0) +
    (state.minDiscount > 0 ? 1 : 0) +
    (Number.isFinite(state.minPrice) || Number.isFinite(state.maxPrice) ? 1 : 0);

  const renderFilters = (scope: string, isMobile = false) => (
    <div className="space-y-8">
      {subcategories.length > 0 && (
        <FilterBlock title="Sous-catégorie">
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={`${scope}-sub`}
                checked={state.subcategory === "all"}
                onChange={() => setPartial({ subcategory: "all", attributes: {} })}
                className="accent-gold"
              />
              <span className="text-sm text-foreground/80">Toutes</span>
            </label>
            {subcategories.map((item) => (
              <label key={item.slug} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`${scope}-sub`}
                  checked={state.subcategory === item.slug}
                  onChange={() => setPartial({ subcategory: item.slug, attributes: {} })}
                  className="accent-gold"
                />
                <span className="text-sm text-foreground/80">{item.name}</span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      <FilterBlock title="Prix">
        <PriceRangeSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={selectedPriceRange}
          onChange={([minPrice, maxPrice]) => setPartial({ minPrice, maxPrice })}
        />
      </FilterBlock>

      {brandOptions.length > 0 && (
        <FilterBlock title="Marque">
          <div className="space-y-2.5">
            {brandOptions.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={state.brands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 accent-gold border-border"
                />
                <span className="text-sm text-foreground/80 group-hover:text-gold transition">{brand.name}</span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      {showDiscountFilter && (
        <FilterBlock title="Réduction">
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={`${scope}-discount`}
                checked={state.minDiscount === 0}
                onChange={() => setPartial({ minDiscount: 0 })}
                className="accent-gold"
              />
              <span className="text-sm text-foreground/80">Toutes</span>
            </label>
            {DISCOUNT_TIERS.map((item) => (
              <label key={item.min} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`${scope}-discount`}
                  checked={state.minDiscount === item.min}
                  onChange={() => setPartial({ minDiscount: item.min })}
                  className="accent-gold"
                />
                <span className="text-sm text-foreground/80">−{item.label}</span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      {dynamicFacets.map((association) => {
        const definition = association.attributeDefinition;
        if (!definition.options.length) return null;
        return (
          <FilterBlock key={definition.key} title={definition.label}>
            <div className="space-y-2.5">
              {definition.options.map((option) => {
                const checked = (state.attributes[definition.key] ?? []).includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttribute(definition.key, option.value)}
                      className="h-4 w-4 accent-gold border-border"
                    />
                    <span className="text-sm text-foreground/80 group-hover:text-gold transition">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </FilterBlock>
        );
      })}

      {!isMobile && activeCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full h-10 text-[11px] uppercase tracking-[0.25em] border border-gold/40 text-gold hover:bg-gold hover:text-ink transition rounded-sm"
        >
          Réinitialiser ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="container-luxe pb-24 grid lg:grid-cols-[260px_1fr] gap-10">
      <aside className="hidden lg:block">{renderFilters("desktop")}</aside>

      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border gap-3">
          <button
            onClick={() => setOpenFilters(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 h-10 border border-border rounded-sm text-sm"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtres{" "}
            {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
          </button>
          <p className="text-sm text-muted-foreground hidden lg:block">
            {pagination.total} {countLabel}{pagination.total > 1 ? "s" : ""}
          </p>
          <select
            value={state.sort}
            onChange={(event) => setPartial({ sort: event.target.value })}
            className="h-10 px-3 bg-secondary/60 border border-border text-sm rounded-sm"
          >
            <option value="recommended">Recommandés</option>
            <option value="newest">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center py-20 text-muted-foreground">Chargement des produits...</p>
        ) : error ? (
          <p className="text-center py-20 text-muted-foreground">{error}</p>
        ) : products.length === 0 && activeCount === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-5">{emptyMessage}</p>
            <a
              href={emptyCtaTo}
              className="inline-flex h-11 items-center justify-center rounded-sm bg-gold px-5 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition hover:bg-ink hover:text-gold"
            >
              {emptyCtaLabel}
            </a>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">Aucun produit ne correspond à vos filtres.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.slug} p={product} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={(page) => {
                  setPartial({ page }, false);
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </>
        )}
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpenFilters(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-hidden bg-background">
            <div className="shrink-0 border-b border-border bg-background px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Filtres</h3>
                <button onClick={() => setOpenFilters(false)} aria-label="Fermer">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
              {renderFilters("mobile", true)}
            </div>
            <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeCount === 0}
                  className="h-11 rounded-sm border border-gold/40 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => setOpenFilters(false)}
                  className="h-11 rounded-sm bg-gold text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-ink hover:text-gold"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pb-6 border-b border-border">
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-4">{title}</h4>
      {children}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-10 px-4 border border-border rounded-sm text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:border-gold hover:text-gold transition"
      >
        Préc.
      </button>
      {pages.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={`h-10 min-w-10 px-3 border rounded-sm text-sm transition ${
            item === page
              ? "border-gold text-gold"
              : "border-border text-foreground/70 hover:border-gold hover:text-gold"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-10 px-4 border border-border rounded-sm text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:border-gold hover:text-gold transition"
      >
        Suiv.
      </button>
    </nav>
  );
}

function splitParam(value: string | null) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function numberParam(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
