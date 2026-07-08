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

const numberValue = (value: string | number | null | undefined) => Number(value ?? 0);

export function mapApiProduct(product: ApiProduct): Product {
  const variant = product.variants.find((item) => item.isActive) ?? product.variants[0];
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
    badge: product.isFeatured ? "Best Seller" : undefined,
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
