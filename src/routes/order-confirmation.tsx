import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check, Package, Truck, MapPin, ArrowRight, Sparkles } from "lucide-react";
import type { CartLine } from "@/hooks/useCart";
import {
  clearStoredMetaUserData,
  readStoredMetaUserData,
  trackMetaPixelEvent,
} from "@/lib/meta-pixel";
import { canonicalLink, seoMeta } from "@/lib/seo";
import { getSession } from "@/lib/supabase";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: seoMeta({
      title: "Merci pour votre commande — Soltani Signature",
      description: "Confirmation de votre commande Soltani Signature.",
      path: "/order-confirmation",
      noindex: true,
    }),
    links: [canonicalLink("/order-confirmation")],
  }),
  component: OrderConfirmationPage,
});

type Order = {
  number: string;
  date: string;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment: string;
  shippingMethod: string;
  address: { name: string; line: string; city: string; zip: string; phone: string };
};

function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("soltani-last-order");
      if (raw) setOrder(JSON.parse(raw));
      else navigate({ to: "/" });
    } catch {
      navigate({ to: "/" });
    }
  }, [navigate]);

  useEffect(() => {
    if (!order) return;
    const purchaseKey = `soltani-purchase-tracked:${order.number}`;
    if (sessionStorage.getItem(purchaseKey)) return;
    sessionStorage.setItem(purchaseKey, "1");
    const hashedUserData = readStoredMetaUserData();
    trackMetaPixelEvent("Purchase", {
      content_ids: order.lines.flatMap((line) => (line.productId ? [line.productId] : [])),
      content_type: "product",
      contents: order.lines.flatMap((line) =>
        line.productId ? [{ id: line.productId, quantity: line.qty, item_price: line.price }] : [],
      ),
      num_items: order.lines.reduce((sum, line) => sum + line.qty, 0),
      value: order.total,
      currency: "TND",
    }, {
      consent: Boolean(hashedUserData),
      hashedUserData,
    });
    clearStoredMetaUserData();
  }, [order]);

  if (!order) return null;

  const trackOrder = async () => {
    const session = await getSession();
    if (session) {
      await navigate({ to: "/profile", search: { tab: "orders" } });
      return;
    }

    await navigate({ to: "/register", search: { reason: "track-order" } });
  };

  return (
    <SiteLayout>
      <div className="container-luxe max-w-4xl py-10 sm:py-16">
        <div className="mb-9 text-center sm:mb-12">
          <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gold/15 text-gold animate-in zoom-in-50 duration-500">
            <Check className="h-10 w-10" strokeWidth={2.5} />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-gold" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">
            Commande confirmée
          </p>
          <h1 className="mb-3 break-words font-display text-3xl font-bold sm:text-5xl">
            Merci pour votre commande !
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Votre commande a été enregistrée avec succès. Vous recevrez un email de confirmation
            dans quelques instants.
          </p>
          <p className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-sm border border-border bg-secondary/40 px-3 py-2 text-center text-sm sm:px-4">
            <span className="text-muted-foreground">N° de commande</span>
            <span className="break-all font-mono font-bold tracking-wider text-gold">{order.number}</span>
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:mb-8 md:grid-cols-3">
          {[
            { icon: Check, label: "Confirmée", active: true },
            { icon: Package, label: "En cours de préparation", active: true, current: true },
            { icon: Truck, label: "Expédition", active: false },
          ].map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-sm border p-3 sm:p-4 ${s.current ? "border-gold bg-gold/5" : s.active ? "border-border" : "border-border opacity-50"}`}
            >
              <div
                className={`h-10 w-10 grid place-items-center rounded-full ${s.active ? "bg-gold text-ink" : "bg-secondary text-muted-foreground"}`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Étape {i + 1}
                </p>
                <p className="text-sm font-semibold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px] md:gap-6">
          <div className="rounded-sm border border-border bg-card p-4 sm:p-6">
            <h2 className="font-display text-lg font-bold mb-5">Récapitulatif</h2>
            <div className="divide-y divide-border">
              {order.lines.map((l) => (
                <div key={l.id} className="flex min-w-0 gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-background sm:h-16 sm:w-16">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-bold">
                      {l.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-gold">{l.brand}</p>
                    <p className="break-words text-sm">{l.name}</p>
                    <p className="break-words text-xs text-muted-foreground">{l.variant}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums whitespace-nowrap">
                    {l.price * l.qty} DT
                  </p>
                </div>
              ))}
            </div>
            <dl className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd className="tabular-nums">{order.subtotal} DT</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd className="tabular-nums">
                  {order.shipping === 0 ? "Offerte" : `${order.shipping} DT`}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold">
                  <dt>Réduction</dt>
                  <dd className="tabular-nums">−{order.discount} DT</dd>
                </div>
              )}
              <div className="flex justify-between items-end pt-3 border-t border-border">
                <dt className="font-display font-bold">Total payé</dt>
                <dd className="font-display font-bold text-2xl text-gold tabular-nums">
                  {order.total} DT
                </dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
            <div className="rounded-sm border border-border bg-card p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3">
                <MapPin className="h-3.5 w-3.5" /> Adresse de livraison
              </p>
              <p className="text-sm font-semibold">{order.address.name}</p>
              <p className="text-sm text-muted-foreground">{order.address.line}</p>
              <p className="text-sm text-muted-foreground">
                {order.address.zip} {order.address.city}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{order.address.phone}</p>
            </div>
            <div className="rounded-sm border border-border bg-card p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3">
                <Truck className="h-3.5 w-3.5" /> Livraison
              </p>
              <p className="text-sm">{order.shippingMethod}</p>
              <p className="text-xs text-muted-foreground mt-1">Estimée sous 2-4 jours ouvrés</p>
            </div>
            <div className="rounded-sm border border-border bg-card p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-2">Paiement</p>
              <p className="text-sm">{order.payment}</p>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row">
          <Link
            to="/"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-gold px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-gold sm:w-auto sm:px-8 sm:text-[12px] sm:tracking-[0.2em]"
          >
            Continuer mes achats <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={trackOrder}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-gold px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gold transition hover:bg-gold hover:text-ink sm:w-auto sm:px-8 sm:text-[12px] sm:tracking-[0.2em]"
          >
            Suivre ma commande
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
