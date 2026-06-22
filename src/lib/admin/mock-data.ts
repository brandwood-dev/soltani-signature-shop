// Mock data for the admin UI. No backend — purely front-end demo.

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  image: string;
  createdAt: string;
};

export type AdminOrder = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  total: number;
  items: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "card" | "cod";
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  createdAt: string;
};

const BRANDS = ["Dior", "Chanel", "YSL", "Armani", "Gucci", "Prada", "Tom Ford", "Hermès"];
const CATEGORIES = ["Parfums", "Soins", "Maquillage", "Sacs", "Montres", "Accessoires"];
const STATUSES: AdminProduct["status"][] = ["active", "active", "active", "draft", "archived"];

function seed(n: number) {
  let x = n * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export const MOCK_PRODUCTS: AdminProduct[] = Array.from({ length: 87 }, (_, i) => {
  const r = seed(i + 1);
  const brand = BRANDS[Math.floor(r() * BRANDS.length)];
  const category = CATEGORIES[Math.floor(r() * CATEGORIES.length)];
  return {
    id: `p_${i + 1}`,
    name: `${brand} ${category} ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    sku: `SKU-${(1000 + i).toString()}`,
    brand,
    category,
    price: Math.round(80 + r() * 1800),
    stock: Math.floor(r() * 60),
    status: STATUSES[Math.floor(r() * STATUSES.length)],
    image: `https://picsum.photos/seed/prod${i}/120/120`,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

const ORDER_STATUSES: AdminOrder["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const FIRST = ["Yasmine", "Mohamed", "Sarra", "Karim", "Leila", "Ahmed", "Nour", "Skander", "Ines", "Walid"];
const LAST = ["Ben Salah", "Trabelsi", "Khelifi", "Mansouri", "Hadj", "Bouzid", "Gharbi", "Saidi"];

export const MOCK_ORDERS: AdminOrder[] = Array.from({ length: 54 }, (_, i) => {
  const r = seed(i + 100);
  const first = FIRST[Math.floor(r() * FIRST.length)];
  const last = LAST[Math.floor(r() * LAST.length)];
  const items = 1 + Math.floor(r() * 4);
  return {
    id: `o_${i + 1}`,
    reference: `SOL-${(20240 + i).toString()}`,
    customer: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, "")}@mail.tn`,
    total: Math.round(150 + r() * 2500),
    items,
    status: ORDER_STATUSES[Math.floor(r() * ORDER_STATUSES.length)],
    paymentMethod: r() > 0.5 ? "card" : "cod",
    createdAt: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  };
});

export const MOCK_CUSTOMERS: AdminCustomer[] = Array.from({ length: 38 }, (_, i) => {
  const r = seed(i + 500);
  const first = FIRST[Math.floor(r() * FIRST.length)];
  const last = LAST[Math.floor(r() * LAST.length)];
  return {
    id: `c_${i + 1}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, "")}@mail.tn`,
    phone: `+216 ${20 + Math.floor(r() * 79)} ${100 + Math.floor(r() * 899)} ${100 + Math.floor(r() * 899)}`,
    orders: Math.floor(r() * 14),
    spent: Math.round(r() * 12000),
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  };
});

export const KPIS = {
  revenueToday: 4280,
  revenueMonth: 86420,
  ordersToday: 12,
  ordersMonth: 248,
  newCustomers: 34,
  conversionRate: 3.2,
  averageBasket: 348,
  pendingOrders: MOCK_ORDERS.filter((o) => o.status === "pending").length,
};

export const REVENUE_SERIES = [
  { day: "Lun", value: 3200 },
  { day: "Mar", value: 4100 },
  { day: "Mer", value: 2800 },
  { day: "Jeu", value: 5200 },
  { day: "Ven", value: 6100 },
  { day: "Sam", value: 7400 },
  { day: "Dim", value: 4280 },
];

export const TOP_PRODUCTS = MOCK_PRODUCTS.slice(0, 5).map((p, i) => ({
  ...p,
  sold: 120 - i * 14,
}));

export function formatTND(n: number) {
  return `${n.toLocaleString("fr-TN")} DT`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
