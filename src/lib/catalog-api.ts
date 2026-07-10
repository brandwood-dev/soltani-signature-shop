import type { Product } from "@/components/site/ProductCard";
import { apiFetch } from "@/lib/api";

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  basePrice: string | number;
  compareAtPrice?: string | number | null;
  isFeatured?: boolean;
  tags?: string[];
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  images: Array<{ url: string; alt?: string | null }>;
  variants: Array<{
    id: string;
    label?: string | null;
    price: string | number;
    stockQuantity: number;
    isActive: boolean;
  }>;
  attributes?: Array<{ key: string; value: string }>;
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
  const variant = product.variants.find((item) => item.isActive) ?? product.variants[0];
  const tags = product.tags ?? [];
  const isPromotion = tags.some((tag) => tag.toLowerCase() === PROMOTION_TAG);
  const discountTag = tags.find((tag) => tag.toLowerCase().startsWith(DISCOUNT_TAG_PREFIX));
  const discountPercentage = Number(discountTag?.slice(DISCOUNT_TAG_PREFIX.length) ?? 0);
  const isBestSeller =
    Boolean(product.isFeatured) || tags.some((tag) => tag.toLowerCase() === BEST_SELLER_TAG);
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
    price: numberValue(variant?.price ?? product.basePrice),
    oldPrice: product.compareAtPrice ? numberValue(product.compareAtPrice) : undefined,
    image: product.images[0]?.url ?? "/placeholder.svg",
    badge: isBestSeller ? "Best Seller" : isPromotion ? "Promo" : undefined,
    isPromotion,
    discountPercentage: isPromotion && Number.isFinite(discountPercentage) && discountPercentage > 0 ? discountPercentage : undefined,
    isBestSeller,
    rating: 5,
    variantId: variant?.id,
    variantLabel: variant?.label ?? "Standard",
    stockQuantity: variant?.stockQuantity ?? 0,
    description: product.description ?? undefined,
    gallery: product.images.map((image) => image.url),
    attributes,
  };
}

export async function getCatalogProducts(params: { category?: string; query?: string } = {}) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.query) search.set("q", params.query);

  const products = await apiFetch<ApiProduct[]>(`/catalog/products${search.size ? `?${search}` : ""}`);
  return products.map(mapApiProduct);
}

export async function getCatalogProduct(slug: string) {
  return mapApiProduct(await apiFetch<ApiProduct>(`/catalog/products/${slug}`));
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

export async function getProductReviews(slug: string, params: { page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  return apiFetch<ProductReviewsResponse>(`/catalog/products/${slug}/reviews${search.size ? `?${search}` : ""}`);
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

export async function updateProductReview(slug: string, reviewId: string, input: ProductReviewInput) {
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
