import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check, CreditCard, Truck, User, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Commande — Soltani Signature" }] }),
  component: CheckoutPage,
});

const STEPS = [
  { n: 1, label: "Identification", icon: User },
  { n: 2, label: "Livraison", icon: Truck },
  { n: 3, label: "Paiement", icon: CreditCard },
];

const PAY_LABELS: Record<string, string> = {
  card: "Carte bancaire",
  "3x": "Paiement en 3× sans frais",
  d17: "D17 / Mobile",
  cod: "Paiement à la livraison",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState<"card" | "3x" | "cod" | "d17">("3x");
  const formRef = useRef<HTMLDivElement>(null);

  const shipping = subtotal >= 300 ? 0 : 15;
  const total = subtotal + shipping + (pay === "cod" ? 5 : 0);

  const placeOrder = () => {
    const number = `LM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fields = formRef.current?.querySelectorAll("input") ?? [];
    const v = (name: string) => (Array.from(fields).find((f) => f.placeholder?.toLowerCase().includes(name))?.value || "");
    const order = {
      number,
      date: new Date().toISOString(),
      lines,
      subtotal,
      shipping,
      discount: 0,
      total,
      payment: PAY_LABELS[pay],
      shippingMethod: "Standard (2-4 jours)",
      address: {
        name: "Client Soltani",
        line: v("avenue") || "123 Avenue Habib Bourguiba",
        city: "Tunis",
        zip: "1000",
        phone: v("+216") || "+216 00 000 000",
      },
    };
    localStorage.setItem("soltani-last-order", JSON.stringify(order));
    clear();
    navigate({ to: "/order-confirmation" });
  };


  return (
    <SiteLayout>
      <div className="container-luxe py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Finaliser la commande</h1>
        <p className="text-sm text-muted-foreground mb-10">Quelques étapes pour recevoir vos pièces signature.</p>

        {/* Stepper */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`h-11 w-11 grid place-items-center rounded-full border-2 transition ${step >= s.n ? "bg-gold border-gold text-ink" : "border-border text-muted-foreground"}`}>
                  {step > s.n ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={`mt-2 text-[10px] uppercase tracking-widest ${step >= s.n ? "text-gold" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-2 ${step > s.n ? "bg-gold" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="bg-secondary/30 border border-border rounded-sm p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Vos coordonnées</h2>
                <Field label="Email"><input type="email" className="input-luxe" placeholder="vous@exemple.com" /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Prénom"><input className="input-luxe" /></Field>
                  <Field label="Nom"><input className="input-luxe" /></Field>
                </div>
                <Field label="Téléphone"><input className="input-luxe" placeholder="+216 00 000 000" /></Field>
                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input type="checkbox" className="accent-gold" /> Créer un compte pour suivre mes commandes
                </label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Adresse de livraison</h2>
                <Field label="Adresse"><input className="input-luxe" placeholder="123 Avenue Habib Bourguiba" /></Field>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Code postal"><input className="input-luxe" /></Field>
                  <Field label="Ville"><input className="input-luxe" defaultValue="Tunis" /></Field>
                  <Field label="Gouvernorat"><input className="input-luxe" defaultValue="Tunis" /></Field>
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">Mode de livraison</h3>
                  {[{ k: "std", l: "Standard (2-4j)", p: "Offerte" }, { k: "exp", l: "Express 24h", p: "+ 25 DT" }, { k: "pick", l: "Retrait Showroom Tunis", p: "Gratuit" }].map((o) => (
                    <label key={o.k} className="flex items-center justify-between p-4 border border-border rounded-sm cursor-pointer hover:border-gold/60 transition">
                      <span className="flex items-center gap-3"><input type="radio" name="ship" className="accent-gold" defaultChecked={o.k === "std"} /> {o.l}</span>
                      <span className="text-sm font-semibold text-gold">{o.p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Mode de paiement</h2>
                {[
                  { k: "card", l: "Carte bancaire", d: "Visa, Mastercard, AMEX" },
                  { k: "3x", l: "Paiement en 3× sans frais", d: `3 × ${(total / 3).toFixed(0)} DT — par carte` },
                  { k: "d17", l: "D17 / Mobile", d: "Paiement mobile sécurisé" },
                  { k: "cod", l: "Paiement à la livraison", d: "Espèces uniquement (+5 DT)" },
                ].map((o) => (
                  <label key={o.k} onClick={() => setPay(o.k as typeof pay)}
                    className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition ${pay === o.k ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                    <input type="radio" name="pay" checked={pay === o.k} onChange={() => setPay(o.k as typeof pay)} className="accent-gold mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{o.l}</p>
                      <p className="text-xs text-muted-foreground">{o.d}</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-gold" />
                  </label>
                ))}

                {pay === "card" || pay === "3x" ? (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <Field label="Numéro de carte"><input className="input-luxe" placeholder="0000 0000 0000 0000" /></Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiration"><input className="input-luxe" placeholder="MM/AA" /></Field>
                      <Field label="CVC"><input className="input-luxe" placeholder="123" /></Field>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="text-sm uppercase tracking-widest text-muted-foreground hover:text-gold">← Retour</button>
              ) : <Link to="/cart" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-gold">← Panier</Link>}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="px-6 h-11 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">Continuer →</button>
              ) : (
                <button onClick={placeOrder} className="px-6 h-11 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm inline-flex items-center gap-2"><Lock className="h-4 w-4" /> {pay === "cod" ? `Confirmer ${total} DT` : `Payer ${total} DT`}</button>
              )}
            </div>
          </div>

          <aside className="bg-card border border-border rounded-sm p-6 h-fit">
            <h3 className="font-display text-lg font-bold mb-5">Votre commande</h3>
            <div className="space-y-4 pb-4 border-b border-border">
              {lines.map((l) => (
                <div key={l.id} className="flex gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-sm bg-background">
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-bold">{l.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-gold">{l.brand}</p>
                    <p className="text-sm truncate">{l.name}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{l.price * l.qty} DT</p>
                </div>
              ))}
            </div>
            <dl className="space-y-2 text-sm py-4 border-b border-border">
              <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{subtotal} DT</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd>{shipping === 0 ? "Offerte" : `${shipping} DT`}</dd></div>
              {pay === "cod" && <div className="flex justify-between"><dt className="text-muted-foreground">Frais paiement livraison</dt><dd className="tabular-nums">5 DT</dd></div>}
            </dl>
            <div className="flex justify-between items-end pt-4">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-2xl text-gold tabular-nums">{total} DT</span>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-foreground/60 mb-2">{label}</span>
      {children}
    </label>
  );
}
