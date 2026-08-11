import type { AdminProductVariant } from "@/lib/admin-products-api";

export function makeColorVariant(
  price = 0,
  stockQuantity = 0,
  lowStockThreshold = 5,
): AdminProductVariant {
  return {
    sku: "",
    label: "",
    reference: "",
    colorHex: "#C47A7A",
    imageUrl: "",
    price,
    stockQuantity,
    lowStockThreshold,
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  };
}
