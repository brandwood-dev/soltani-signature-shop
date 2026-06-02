import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroBag from "@/assets/cat-bags.jpg";

function useCountdown(target: number) {
  const [t, setT] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const clamp = Math.max(t, 0);
  const d = Math.floor(clamp / 86400000);
  const h = Math.floor((clamp / 3600000) % 24);
  const m = Math.floor((clamp / 60000) % 60);
  const s = Math.floor((clamp / 1000) % 60);
  return { d, h, m, s };
}

export function Promo() {
  const { d, h, m, s } = useCountdown(Date.now() + 3 * 86400000 + 4 * 3600000);
  const cells = [
    { v: d, l: "Jours" },
    { v: h, l: "Heures" },
    { v: m, l: "Minutes" },
    { v: s, l: "Secondes" },
  ];
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
          <a href="#" className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition shadow-gold rounded-sm">
            Profiter des offres <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-5">
          {cells.map((c) => (
            <div key={c.l} className="aspect-square bg-ink/80 border border-gold/30 backdrop-blur flex flex-col items-center justify-center rounded-sm">
              <span className="font-display text-4xl md:text-6xl font-bold text-gold tabular-nums">
                {String(c.v).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-cream/70 mt-2">{c.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
