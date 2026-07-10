import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check, Package, Truck, MapPin, ArrowRight, Sparkles } from "lucide-react";
import type { CartLine } from "@/hooks/useCart";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({ meta: [{ title: "Merci pour votre commande — Soltani Signature" }] }),
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
    trackMetaPixelEvent("Purchase", {
      content_ids: order.lines.map((line) => line.variantId),
      content_type: "product",
      contents: order.lines.map((line) => ({ id: line.variantId, quantity: line.qty, item_price: line.price })),
      num_items: order.lines.reduce((sum, line) => sum + line.qty, 0),
      value: order.total,
      currency: "TND",
    });
  }, [order]);

  if (!order) return null;

  return (
    <SiteLayout>
      <div className="container-luxe py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gold/15 text-gold animate-in zoom-in-50 duration-500">
            <Check className="h-10 w-10" strokeWidth={2.5} />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-gold" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Commande confirmée</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Merci pour votre commande !</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Votre commande a été enregistrée avec succès. Vous recevrez un email de confirmation dans quelques instants.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-border bg-secondary/40 rounded-sm text-sm">
            <span className="text-muted-foreground">N° de commande</span>
            <span className="font-mono font-bold text-gold tracking-wider">{order.number}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { icon: Check, label: "Confirmée", active: true },
            { icon: Package, label: "En cours de préparation", active: true, current: true },
            { icon: Truck, label: "Expédition", active: false },
          ].map((s, i) => (
            <div key={i} className={`p-4 border rounded-sm flex items-center gap-3 ${s.current ? "border-gold bg-gold/5" : s.active ? "border-border" : "border-border opacity-50"}`}>
              <div className={`h-10 w-10 grid place-items-center rounded-full ${s.active ? "bg-gold text-ink" : "bg-secondary text-muted-foreground"}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Étape {i + 1}</p>
                <p className="text-sm font-semibold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="font-display text-lg font-bold mb-5">Récapitulatif</h2>
            <div className="divide-y divide-border">
              {order.lines.map((l) => (
                <div key={l.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 overflow-hidden rounded-sm bg-background shrink-0">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-bold">{l.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-gold">{l.brand}</p>
                    <p className="text-sm truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.variant}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums whitespace-nowrap">{l.price * l.qty} DT</p>
                </div>
              ))}
            </div>
            <dl className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{order.subtotal} DT</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="tabular-nums">{order.shipping === 0 ? "Offerte" : `${order.shipping} DT`}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold"><dt>Réduction</dt><dd className="tabular-nums">−{order.discount} DT</dd></div>
              )}
              <div className="flex justify-between items-end pt-3 border-t border-border">
                <dt className="font-display font-bold">Total payé</dt>
                <dd className="font-display font-bold text-2xl text-gold tabular-nums">{order.total} DT</dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
            <div className="bg-card border border-border rounded-sm p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3"><MapPin className="h-3.5 w-3.5" /> Adresse de livraison</p>
              <p className="text-sm font-semibold">{order.address.name}</p>
              <p className="text-sm text-muted-foreground">{order.address.line}</p>
              <p className="text-sm text-muted-foreground">{order.address.zip} {order.address.city}</p>
              <p className="text-sm text-muted-foreground mt-2">{order.address.phone}</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3"><Truck className="h-3.5 w-3.5" /> Livraison</p>
              <p className="text-sm">{order.shippingMethod}</p>
              <p className="text-xs text-muted-foreground mt-1">Estimée sous 2-4 jours ouvrés</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-5">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-2">Paiement</p>
              <p className="text-sm">{order.payment}</p>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">
            Continuer mes achats <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/legal/$slug" params={{ slug: "suivi-de-commande" }} className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-gold text-gold text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-ink transition rounded-sm">
            Suivre ma commande
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
