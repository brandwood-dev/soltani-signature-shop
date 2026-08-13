import type { Product } from "@/components/site/ProductCard";
import { apiFetch, publicApiFetch } from "@/lib/api";

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  basePrice: string | number;
  compareAtPrice?: string | number | null;
  priceRange?: { min: string | number; max: string | number };
  variantMode?: string;
  isFeatured?: boolean;
  section?: string;
  tags?: string[];
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  images: Array<{ url: string; alt?: string | null }>;
  variantAxes?: Array<{
    id: string;
    key: string;
    label: string;
    displayType: string;
    sortOrder?: number;
    values: Array<{
      id: string;
      value: string;
      label: string;
      code?: string | null;
      colorHex?: string | null;
      imageUrl?: string | null;
      sortOrder?: number;
    }>;
  }>;
  variants: Array<{
    id: string;
    sku?: string;
    label?: string | null;
    reference?: string | null;
    colorHex?: string | null;
    imageUrl?: string | null;
    price: string | number;
    compareAtPrice?: string | number | null;
    stockQuantity: number;
    isActive: boolean;
    isDefault?: boolean;
    sortOrder?: number;
    selections?: Array<{
      optionValue?: {
        id: string;
        value: string;
        label: string;
        code?: string | null;
        colorHex?: string | null;
        imageUrl?: string | null;
        axis: { id: string; key: string; label: string };
      };
      axisId?: string;
      axisKey?: string;
      axisLabel?: string;
      valueId?: string;
      value?: string;
      label?: string;
      code?: string | null;
      colorHex?: string | null;
      imageUrl?: string | null;
    }>;
  }>;
  attributes?: Array<{ key: string; value: string }>;
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
};

type ApiBrandFacet = { name: string; slug: string };

type ApiCatalogProductsPage = {
  products: ApiProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  facets: {
    price: { min: string | number; max: string | number };
    brands: ApiBrandFacet[];
  };
};

export type CreateCodOrderInput = {
  customerEmail: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
  paymentMethod: "CASH_ON_DELIVERY";
  items: Array<{ variantId: string; quantity: number }>;
};

export type CreatedOrder = {
  id: string;
  reference: string;
  customerEmail: string;
  subtotal: string | number;
  shippingTotal: string | number;
  discountTotal: string | number;
  total: string | number;
  paymentMethod: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
  }>;
};

export type ProductReview = {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewsResponse = {
  reviews: ProductReview[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    averageRating: number;
  };
};

export type MyProductReviewResponse = {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type ProductReviewInput = {
  rating: number;
  title?: string;
  content: string;
};

const numberValue = (value: string | number | null | undefined) => Number(value ?? 0);
const PROMOTION_TAG = "__promotion";
const BEST_SELLER_TAG = "__best_seller";
const DISCOUNT_TAG_PREFIX = "__discount:";

export function mapApiProduct(product: ApiProduct): Product {
  const variantAxes = (product.variantAxes ?? [])
    .map((axis, axisIndex) => ({
      id: axis.id,
      key: axis.key,
      label: axis.label,
      displayType: (["swatch", "button", "select"].includes(axis.displayType.toLowerCase())
        ? axis.displayType.toLowerCase()
        : "button") as "swatch" | "button" | "select",
      sortOrder: axis.sortOrder ?? axisIndex,
      values: axis.values.map((value, valueIndex) => ({
        id: value.id,
        value: value.value,
        label: value.label,
        code: value.code ?? undefined,
        colorHex: value.colorHex ?? undefined,
        imageUrl: value.imageUrl ?? undefined,
        sortOrder: value.sortOrder ?? valueIndex,
      })),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const variants = product.variants
    .filter((item) => item.isActive)
    .map((item, index) => ({
      id: item.id,
      sku: item.sku ?? "",
      label: item.label ?? "Standard",
      reference: item.reference ?? undefined,
      colorHex: item.colorHex ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      price: numberValue(item.price),
      compareAtPrice: item.compareAtPrice ? numberValue(item.compareAtPrice) : undefined,
      stockQuantity: item.stockQuantity,
      isActive: item.isActive,
      isDefault: Boolean(item.isDefault),
      sortOrder: item.sortOrder ?? index,
      selections: (item.selections ?? []).map((selection) => {
        const option = selection.optionValue;
        return {
          axisId: option?.axis.id ?? selection.axisId ?? "",
          axisKey: option?.axis.key ?? selection.axisKey ?? "",
          axisLabel: option?.axis.label ?? selection.axisLabel ?? "",
          valueId: option?.id ?? selection.valueId ?? "",
          value: option?.value ?? selection.value ?? "",
          label: option?.label ?? selection.label ?? "",
          code: option?.code ?? selection.code ?? undefined,
          colorHex: option?.colorHex ?? selection.colorHex ?? undefined,
          imageUrl: option?.imageUrl ?? selection.imageUrl ?? undefined,
        };
      }),
    }))
    .sort(
      (left, right) =>
        Number(right.isDefault) - Number(left.isDefault) || left.sortOrder - right.sortOrder,
    );
  const variant = variants.find((item) => item.isDefault) ?? variants[0];
  const variantPrices = variants.map((item) => item.price);
  const priceMin = product.priceRange
    ? numberValue(product.priceRange.min)
    : variantPrices.length
      ? Math.min(...variantPrices)
      : numberValue(product.basePrice);
  const priceMax = product.priceRange
    ? numberValue(product.priceRange.max)
    : variantPrices.length
      ? Math.max(...variantPrices)
      : numberValue(product.basePrice);
  const cheapestVariant = variants.reduce<(typeof variants)[number] | undefined>(
    (cheapest, item) => (!cheapest || item.price < cheapest.price ? item : cheapest),
    undefined,
  );
  const tags = product.tags ?? [];
  const isPromotion = tags.some((tag) => tag.toLowerCase() === PROMOTION_TAG);
  const discountTag = tags.find((tag) => tag.toLowerCase().startsWith(DISCOUNT_TAG_PREFIX));
  const discountPercentage = Number(discountTag?.slice(DISCOUNT_TAG_PREFIX.length) ?? 0);
  const isFeatured = Boolean(product.isFeatured);
  const isBestSeller = tags.some((tag) => tag.toLowerCase() === BEST_SELLER_TAG);
  const attributes = product.attributes?.reduce<Record<string, string[]>>((acc, item) => {
    acc[item.key] = [...(acc[item.key] ?? []), item.value];
    return acc;
  }, {});

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    category: product.category.slug,
    categoryName: product.category.name,
    section: product.section,
    price: priceMin,
    priceMin,
    priceMax,
    oldPrice:
      cheapestVariant?.compareAtPrice ??
      (product.compareAtPrice ? numberValue(product.compareAtPrice) : undefined),
    image: product.images[0]?.url ?? "/placeholder.svg",
    badge: isBestSeller ? "Best Seller" : isPromotion ? "Promo" : undefined,
    isPromotion,
    discountPercentage:
      isPromotion && Number.isFinite(discountPercentage) && discountPercentage > 0
        ? discountPercentage
        : undefined,
    isBestSeller,
    isFeatured,
    variantMode: (["color", "options"].includes(product.variantMode?.toLowerCase() ?? "")
      ? product.variantMode?.toLowerCase()
      : "simple") as "simple" | "color" | "options",
    variantAxes,
    variants,
    variantId: variant?.id,
    variantLabel: variant?.label ?? "Standard",
    stockQuantity: variant?.stockQuantity ?? 0,
    shortDescription: product.shortDescription ?? undefined,
    description: product.description ?? undefined,
    gallery: product.images.map((image) => image.url),
    attributes,
    reviewSummary: product.reviewSummary,
  };
}

export async function getCatalogProducts(
  params: {
    category?: string;
    query?: string;
    section?: string;
    limit?: number;
    summary?: boolean;
    featured?: boolean;
    bestSeller?: boolean;
    promotion?: boolean;
  } = {},
) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.query) search.set("q", params.query);
  if (params.section) search.set("section", params.section);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.summary) search.set("summary", "1");
  if (params.featured) search.set("featured", "1");
  if (params.bestSeller) search.set("bestSeller", "1");
  if (params.promotion) search.set("promotion", "1");

  const products = await publicApiFetch<ApiProduct[]>(
    `/catalog/products${search.size ? `?${search}` : ""}`,
  );
  return products.map(mapApiProduct);
}

export type CatalogProductsQuery = {
  category?: string;
  query?: string;
  section?: string;
  featured?: boolean;
  bestSeller?: boolean;
  promotion?: boolean;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  attributes?: Record<string, string[]>;
};

export type CatalogProductsPage = {
  products: Product[];
  pagination: ApiCatalogProductsPage["pagination"];
  facets: {
    price: { min: number; max: number };
    brands: ApiBrandFacet[];
  };
};

export async function getCatalogProductsPage(
  params: CatalogProductsQuery = {},
): Promise<CatalogProductsPage> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.query) search.set("q", params.query);
  if (params.section) search.set("section", params.section);
  if (params.featured) search.set("featured", "1");
  if (params.bestSeller) search.set("bestSeller", "1");
  if (params.promotion) search.set("promotion", "1");
  if (params.brands?.length) search.set("brand", params.brands.join(","));
  if (Number.isFinite(params.minPrice)) search.set("minPrice", String(params.minPrice));
  if (Number.isFinite(params.maxPrice)) search.set("maxPrice", String(params.maxPrice));
  if (Number.isFinite(params.minDiscount)) search.set("minDiscount", String(params.minDiscount));
  if (params.sort) search.set("sort", params.sort);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 24));
  search.set("summary", "1");
  if (params.attributes && Object.keys(params.attributes).length) {
    search.set("attributes", JSON.stringify(params.attributes));
  }

  const response = await publicApiFetch<ApiCatalogProductsPage>(`/catalog/products?${search}`);
  return {
    products: response.products.map(mapApiProduct),
    pagination: response.pagination,
    facets: {
      price: {
        min: numberValue(response.facets.price.min),
        max: numberValue(response.facets.price.max),
      },
      brands: response.facets.brands,
    },
  };
}

export async function getCatalogProduct(slug: string) {
  return mapApiProduct(await publicApiFetch<ApiProduct>(`/catalog/products/${slug}`));
}

export async function getProductPreview(token: string) {
  const response = await publicApiFetch<{ product: ApiProduct; expiresAt: string }>(
    `/products/preview/${encodeURIComponent(token)}`,
  );
  return {
    product: mapApiProduct(response.product),
    expiresAt: response.expiresAt,
  };
}

export async function createCodOrder(input: CreateCodOrderInput) {
  return apiFetch<CreatedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCustomerCodOrder(input: CreateCodOrderInput) {
  return apiFetch<CreatedOrder>("/orders/customer", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getProductReviews(
  slug: string,
  params: { page?: number; pageSize?: number } = {},
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  return publicApiFetch<ProductReviewsResponse>(
    `/catalog/products/${slug}/reviews${search.size ? `?${search}` : ""}`,
  );
}

export async function getMyProductReview(slug: string) {
  return apiFetch<MyProductReviewResponse>(`/catalog/products/${slug}/reviews/me`);
}

export async function createProductReview(slug: string, input: ProductReviewInput) {
  return apiFetch<MyProductReviewResponse>(`/catalog/products/${slug}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProductReview(
  slug: string,
  reviewId: string,
  input: ProductReviewInput,
) {
  return apiFetch<MyProductReviewResponse>(`/catalog/products/${slug}/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProductReview(slug: string, reviewId: string) {
  return apiFetch<{ success: boolean }>(`/catalog/products/${slug}/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
