import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Truck, Lock, Headphones } from "lucide-react";
import { useInViewport, usePrefersReducedMotion } from "@/hooks/useInViewport";

const ITEMS = [
  { Icon: ShieldCheck, title: "Produits 100% Authentiques", sub: "Sourcing officiel et certifié" },
  { Icon: Truck, title: "Livraison Rapide", sub: "Livraison sur toute la Tunisie sous 48h" },
  { Icon: Lock, title: "Paiement Sécurisé", sub: "Par carte bancaire ou en espèces à la livraison" },
  { Icon: Headphones, title: "Service Client 7J/7", sub: "À votre écoute" },
];

export function TrustBar() {
  const [idx, setIdx] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInViewport(sectionRef);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % ITEMS.length), 3500);
    return () => clearInterval(t);
  }, [inView, reducedMotion]);

  return (
    <section ref={sectionRef} className="bg-white border-y border-border/60">
      {/* Desktop / tablet */}
      <div className="hidden sm:block container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
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

      {/* Mobile carousel — one badge at a time */}
      <div className="sm:hidden overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {ITEMS.map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="min-w-full flex items-center justify-center gap-3 px-4 py-5"
            >
              <Icon className="h-8 w-8 shrink-0 text-gold" strokeWidth={1.25} />
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-foreground truncate">
                  {title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-light truncate">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1 pb-3">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              aria-label={`Badge ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`mobile-slider-dot min-h-0 p-0 rounded-full transition-all ${i === idx ? "h-[3px] w-3 bg-gold" : "h-[3px] w-[3px] bg-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
