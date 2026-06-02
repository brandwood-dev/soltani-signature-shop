import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroBag from "@/assets/cat-bags.jpg";
import { CountdownCells, useStableDeadline } from "./Countdown";

export function Promo() {
  const target = useStableDeadline(3, 8);
  return (
    <section id="promos" className="relative py-24 md:py-32 overflow-hidden">
      <img src={heroBag} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
      <div className="container-luxe relative grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-destructive text-cream rounded-sm mb-6">
            Offre limitée
          </span>
          <h2 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] text-cream mb-6">
            Soldes <span className="italic font-light text-gold">privées</span><br />
            jusqu'à −50%
          </h2>
          <p className="text-cream/70 max-w-lg mb-8 text-lg">
            Une sélection exclusive de pièces signées, à prix exceptionnels. Pour une durée limitée seulement.
          </p>
          <Link to="/promotions" className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition shadow-gold rounded-sm">
            Profiter des offres <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CountdownCells target={target} />
      </div>
    </section>
  );
}
