import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const COLS = [
  {
    title: "Boutique",
    links: ["Nouveautés", "Best Sellers", "Montres", "Lunettes", "Parfums", "Sacs", "Bijoux", "Cosmétiques"],
  },
  {
    title: "Service Client",
    links: ["Contact", "Suivi de commande", "Livraison", "Retours & échanges", "FAQ", "WhatsApp"],
  },
  {
    title: "À propos",
    links: ["Notre histoire", "Showroom Tunis", "Carrières", "Authenticité", "Programme fidélité"],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink border-t border-gold/15">
      <div className="container-luxe py-20">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="font-display text-3xl font-bold text-cream">SOLTANI</span>
              <span className="font-display text-3xl font-light italic text-gold">Signature</span>
            </div>
            <p className="text-cream/70 max-w-sm leading-relaxed mb-6">
              Maison tunisienne de référence pour les montres, parfums et accessoires de luxe.
              Sélection authentique, service d'exception.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Réseau social" className="grid h-10 w-10 place-items-center border border-gold/30 text-gold hover:bg-gold hover:text-ink transition rounded-sm">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-cream/75 hover:text-gold transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-gold/15 grid md:grid-cols-3 gap-6 items-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Soltani Signature. Tous droits réservés.</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {["VISA", "MASTERCARD", "AMEX", "PAYPAL", "D17", "3X"].map(p => (
              <span key={p} className="px-2.5 py-1 text-[10px] uppercase tracking-widest border border-gold/30 text-cream/80 rounded-sm">{p}</span>
            ))}
          </div>
          <div className="flex md:justify-end gap-5 text-xs">
            <a href="#" className="text-cream/60 hover:text-gold transition">CGV</a>
            <a href="#" className="text-cream/60 hover:text-gold transition">Confidentialité</a>
            <a href="#" className="text-cream/60 hover:text-gold transition">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
