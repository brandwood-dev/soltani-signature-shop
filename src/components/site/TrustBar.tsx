import { ShieldCheck, Truck, Lock, Headphones } from "lucide-react";

const ITEMS = [
  { Icon: ShieldCheck, title: "Produits 100% Authentiques", sub: "Sourcing officiel et certifié" },
  { Icon: Truck, title: "Livraison Rapide", sub: "Partout en Tunisie & à l'international" },
  { Icon: Lock, title: "Paiement Sécurisé", sub: "Carte bancaire, virement, à la livraison" },
  { Icon: Headphones, title: "Service Client 7J/7", sub: "À votre écoute" },
];

export function TrustBar() {
  return (
    <section className="bg-white border-y border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {ITEMS.map(({ Icon, title, sub }, i) => (
            <li
              key={title}
              className="flex items-center gap-4 lg:justify-center text-left lg:text-left animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className="h-9 w-9 shrink-0 text-gold" strokeWidth={1.25} />
              <div className="min-w-0">
                <p className="text-[12px] sm:text-[13px] font-medium tracking-[0.14em] uppercase text-foreground">
                  {title}
                </p>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-1 font-light">
                  {sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
