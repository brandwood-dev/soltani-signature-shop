import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Minus, Plus, X, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { canonicalLink, seoMeta } from "@/lib/seo";
import {
  DEFAULT_SHOP_SETTINGS,
  calculateShipping,
  getPublicShopSettings,
  type ShopSettings,
} from "@/lib/settings-api";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: seoMeta({ title: "Panier — Soltani Signature", description: "Votre panier Soltani Signature.", path: "/cart", noindex: true }),
    links: [canonicalLink("/cart")],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, update, remove, subtotal } = useCart();
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);

  useEffect(() => {
    getPublicShopSettings()
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SHOP_SETTINGS));
  }, []);

  const shipping = calculateShipping(subtotal, settings);
  const total = subtotal + shipping;
  const paymentMessage = settings.cashOnDeliveryEnabled
    ? "Paiement à la livraison disponible partout en Tunisie."
    : settings.cardPaymentEnabled
      ? "Paiement par carte disponible au checkout."
      : "Aucun moyen de paiement disponible pour le moment.";

  return (
    <SiteLayout>
      <PageHero eyebrow="Votre sélection" title="Panier" subtitle={`${lines.length} article${lines.length > 1 ? "s" : ""} dans votre panier`} />

      <div className="container-luxe py-16 grid lg:grid-cols-[1fr_400px] gap-10">
        <div>
          {lines.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
              <Link to="/" className="text-gold underline">Continuer mes achats</Link>
            </div>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {lines.map((l) => (
                <div key={l.id} className="py-6 grid grid-cols-[100px_1fr_auto] gap-5">
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">{l.brand}</p>
                    <h3 className="font-medium mb-1">{l.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{l.variant}</p>
                    <div className="flex items-center border border-border w-fit rounded-sm">
                      <button onClick={() => update(l.id, l.qty - 1)} className="h-9 w-9 grid place-items-center hover:text-gold"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-9 text-center text-sm">{l.qty}</span>
                      <button onClick={() => update(l.id, l.qty + 1)} className="h-9 w-9 grid place-items-center hover:text-gold"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{l.price * l.qty} DT</p>
                    <button onClick={() => remove(l.id)} className="mt-3 text-muted-foreground hover:text-destructive"><X className="h-4 w-4 ml-auto" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-secondary/40 border border-border rounded-sm p-6 h-fit lg:sticky lg:top-28">
          <h3 className="font-display text-xl font-bold mb-5">Récapitulatif</h3>
          <dl className="space-y-2 text-sm pb-4 border-b border-border">
            <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{subtotal} DT</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="tabular-nums">{shipping === 0 ? "Offerte" : `${shipping} DT`}</dd></div>
          </dl>
          <div className="flex justify-between items-end py-4">
            <span className="font-display font-bold text-lg">Total</span>
            <span className="font-display font-bold text-2xl text-gold tabular-nums">{total} DT</span>
          </div>
          <div className="p-3 bg-background border border-gold/30 rounded-sm mb-4">
            <p className="text-xs text-foreground/80">{paymentMessage}</p>
          </div>
          <Link to="/checkout" search={{ quick: undefined }} className="block w-full text-center h-12 leading-[3rem] bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">
            Passer commande
          </Link>
          <p className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" /> Commande confirmée via API sécurisée
          </p>
        </aside>
      </div>
    </SiteLayout>
  );
}
