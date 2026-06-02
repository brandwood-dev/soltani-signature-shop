import { useEffect, useState } from "react";
import { Truck, CreditCard, Sparkles, Tag } from "lucide-react";

const MESSAGES = [
  { icon: Truck, text: "Livraison gratuite dès 300 DT partout en Tunisie" },
  { icon: CreditCard, text: "Paiement en 4× sans frais avec D17" },
  { icon: Tag, text: "−25% sur toutes les montres Rolex cette semaine" },
  { icon: Sparkles, text: "Nouvelles collections Printemps 2026 disponibles" },
];

export function TopBar() {
  const [i, setI] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-[0.18em] text-foreground/80 overflow-hidden">
      <div className="container-luxe relative h-9 flex items-center justify-center">
        {MESSAGES.map((m, idx) => {
          const Icon = m.icon;
          const active = mounted ? idx === i : idx === 0;
          return (
            <div
              key={m.text}
              aria-hidden={!active}
              className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-700 ease-out ${
                active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <Icon className="h-3 w-3 text-gold shrink-0" />
              <span className="truncate">{m.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
