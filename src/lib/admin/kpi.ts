// Mock KPI computation based on a date period. No backend.
import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { DatePeriod } from "@/components/admin/DateRangeFilter";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function rand(seed: number) {
  let x = seed || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0xffffffff;
  };
}

export type PeriodKPIs = {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  visitors: number;
  visitorsDelta: number;
  averageBasket: number;
  averageBasketDelta: number;
  conversionRate: number;
  conversionDelta: number;
  series: { day: string; value: number; date: Date }[];
};

export function computeKPIs(period: DatePeriod): PeriodKPIs {
  const seed = hash(period.from.toISOString() + period.to.toISOString());
  const r = rand(seed);
  const days = Math.max(1, period.days);

  const baseRevenuePerDay = 2800 + r() * 1800;
  const revenue = Math.round(baseRevenuePerDay * days * (0.85 + r() * 0.3));
  const orders = Math.max(1, Math.round(days * (6 + r() * 8)));
  const customers = Math.max(1, Math.round(orders * (0.35 + r() * 0.25)));
  const visitors = Math.round(orders * (28 + r() * 22));
  const averageBasket = Math.round(revenue / orders);
  const conversionRate = +((orders / visitors) * 100).toFixed(2);

  const delta = () => +(((r() - 0.4) * 25).toFixed(1));

  const interval = eachDayOfInterval({ start: period.from, end: period.to });
  // Cap rendered bars to avoid huge series
  const step = Math.max(1, Math.ceil(interval.length / 14));
  const sampled = interval.filter((_, i) => i % step === 0);
  const series = sampled.map((d) => {
    const dr = rand(hash(d.toDateString()));
    return {
      date: d,
      day:
        days <= 1
          ? format(d, "HH:mm", { locale: fr })
          : days <= 14
            ? format(d, "EEE", { locale: fr })
            : format(d, "d MMM", { locale: fr }),
      value: Math.round(baseRevenuePerDay * (0.5 + dr() * 1.1)),
    };
  });

  return {
    revenue,
    revenueDelta: delta(),
    orders,
    ordersDelta: delta(),
    customers,
    customersDelta: delta(),
    visitors,
    visitorsDelta: delta(),
    averageBasket,
    averageBasketDelta: delta(),
    conversionRate,
    conversionDelta: delta(),
    series,
  };
}
