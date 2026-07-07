import { apiFetch } from "@/lib/api";

export type ShopSettings = {
  shopName: string;
  contactEmail: string;
  description: string;
  shippingFee: number;
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
  cashOnDeliveryEnabled: boolean;
  cardPaymentEnabled: boolean;
  updatedAt: string;
};

export type ShopSettingsInput = Omit<ShopSettings, "updatedAt">;

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: "Soltani Signature",
  contactEmail: "contact@soltanisignature.com",
  description: "Boutique de luxe en Tunisie.",
  shippingFee: 8,
  freeShippingThreshold: 300,
  freeShippingEnabled: false,
  cashOnDeliveryEnabled: true,
  cardPaymentEnabled: false,
  updatedAt: "",
};

export function calculateShipping(subtotal: number, settings: ShopSettings) {
  if (settings.freeShippingEnabled || subtotal >= settings.freeShippingThreshold) {
    return 0;
  }
  return settings.shippingFee;
}

export async function getPublicShopSettings() {
  const response = await apiFetch<{ settings: ShopSettings }>("/content/settings");
  return response.settings;
}

export async function getAdminShopSettings() {
  const response = await apiFetch<{ settings: ShopSettings }>("/admin/settings");
  return response.settings;
}

export async function updateShopSettings(input: ShopSettingsInput) {
  const response = await apiFetch<{ settings: ShopSettings }>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.settings;
}
