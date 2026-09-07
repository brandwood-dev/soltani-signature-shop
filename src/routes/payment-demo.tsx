import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CreditCard, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/payment-demo")({
  component: PaymentDemoPage,
});

type DemoPayment = {
  reference: string;
  amount: number;
  subtotal: number;
  shipping: number;
  lines: Array<{
    name: string;
    qty: number;
    price: number;
    image?: string;
  }>;
};

type DemoResult = "pending" | "success" | "cancelled" | "invalid";

function PaymentDemoPage() {
  const [payment, setPayment] = useState<DemoPayment | null>(null);
  const [result, setResult] = useState<DemoResult>("pending");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("soltani-demo-payment");
      if (!raw) {
        setResult("invalid");
        return;
      }
      setPayment(JSON.parse(raw) as DemoPayment);
    } catch {
      setResult("invalid");
    }
  }, []);

  const finishDemo = (nextResult: Exclude<DemoResult, "pending" | "invalid">) => {
    sessionStorage.removeItem("soltani-demo-payment");
    setResult(nextResult);
  };

  if (result === "invalid" || !payment) {
    return (
      <SiteLayout>
        <div className="container-luxe py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Session de démonstration expirée</h1>
          <p className="mt-3 text-muted-foreground">Revenez au panier pour recommencer le test.</p>
          <Link to="/cart" className="mt-8 inline-flex h-12 items-center gap-2 bg-gold px-6 font-semibold text-ink">
            <ArrowLeft className="h-4 w-4" /> Retour au panier
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (result !== "pending") {
    const succeeded = result === "success";
    return (
      <SiteLayout>
        <div className="container-luxe py-20 text-center">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${succeeded ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {succeeded ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold">Mode démonstration</p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {succeeded ? "Paiement simulé réussi" : "Paiement simulé annulé"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Aucun débit, aucune commande et aucune réservation de stock n’ont été créés.
          </p>
          <Link to="/cart" className="mt-8 inline-flex h-12 items-center gap-2 bg-gold px-6 font-semibold text-ink">
            <ArrowLeft className="h-4 w-4" /> Retour au panier
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-luxe max-w-2xl py-12">
        <div className="mb-6 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Démonstration ClicToPay SMT</p>
          <p className="mt-1">Cet écran simule le parcours bancaire. Aucun paiement réel ne sera effectué.</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold">ClicToPay SMT</p>
              <h1 className="font-display text-2xl font-bold">Paiement sécurisé</h1>
            </div>
            <ShieldCheck className="ml-auto h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Référence</span><span className="font-mono font-semibold">{payment.reference}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Sous-total</span><span>{payment.subtotal} DT</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Livraison</span><span>{payment.shipping === 0 ? "Offerte" : `${payment.shipping} DT`}</span></div>
            <div className="flex justify-between gap-4 border-t border-border pt-3 text-lg font-bold"><span>Total</span><span className="text-gold">{payment.amount} DT</span></div>
          </div>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {payment.lines.map((line) => (
              <div key={`${line.name}-${line.qty}`} className="flex items-center gap-3 py-3">
                {line.image ? <img src={line.image} alt="" className="h-12 w-12 rounded-sm object-cover" /> : null}
                <span className="flex-1 text-sm">{line.name} × {line.qty}</span>
                <span className="text-sm font-semibold">{line.price * line.qty} DT</span>
              </div>
            ))}
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => finishDemo("success")} className="h-12 bg-gold px-4 text-sm font-bold text-ink">Simuler un paiement réussi</button>
            <button type="button" onClick={() => finishDemo("cancelled")} className="h-12 border border-border px-4 text-sm font-semibold">Simuler annulation / échec</button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
