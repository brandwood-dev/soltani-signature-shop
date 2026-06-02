import { Truck, CreditCard, MessageCircle } from "lucide-react";

export function TopBar() {
  const items = [
    { icon: Truck, text: "Livraison gratuite dès 300 DT" },
    { icon: CreditCard, text: "Paiement en 3x sans frais" },
    { icon: MessageCircle, text: "Service client WhatsApp 7j/7" },
  ];
  return (
    <div className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-[0.18em] text-foreground/75">
      <div className="container-luxe flex h-9 items-center justify-center gap-8 overflow-hidden">
        {items.map((i) => (
          <div key={i.text} className="flex items-center gap-2">
            <i.icon className="h-3 w-3 text-gold" />
            <span className="hidden sm:inline">{i.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
