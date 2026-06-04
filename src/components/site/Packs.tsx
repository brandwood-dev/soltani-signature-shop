import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";
import p5 from "@/assets/prod-5.jpg";
import p6 from "@/assets/prod-6.jpg";

type Pack = {
  title: string;
  subtitle: string;
  image: string;
  to: string;
};

const PACKS: Pack[] = [
  { title: "Pack Soins Visage", subtitle: "Routine complète éclat", image: p1, to: "/category/soins-visage" },
  { title: "Pack Parfum", subtitle: "Découverte signature", image: p2, to: "/category/parfums-fragrances" },
  { title: "Pack Cheveux", subtitle: "Rituel brillance & soin", image: p3, to: "/category/cheveux" },
  { title: "Pack Maquillage", subtitle: "Essentiels du teint", image: p4, to: "/category/maquillage" },
  { title: "Pack Pour Elle", subtitle: "Cadeau d'exception", image: p5, to: "/femme" },
  { title: "Pack Pour Lui", subtitle: "L'élégance masculine", image: p6, to: "/homme" },
];

export function Packs() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col items-center text-center mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Coffrets</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light max-w-2xl">
            Nos <span className="italic text-gold">Packs</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md text-sm md:text-base font-light">
            Des sélections signature pensées comme des rituels.
          </p>
        </div>

        {/* Mobile: horizontal carousel */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
          <ul className="flex gap-4 snap-x snap-mandatory pb-2">
            {PACKS.map((p) => (
              <li key={p.title} className="snap-start shrink-0 w-[70%]">
                <PackCard p={p} />
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop */}
        <ul className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKS.map((p) => (
            <li key={p.title}>
              <PackCard p={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PackCard({ p }: { p: Pack }) {
  return (
    <Link
      to={p.to}
      className="group relative block h-[280px] md:h-[320px] overflow-hidden rounded-sm bg-secondary shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      <img
        src={p.image}
        alt={p.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="font-display text-xl md:text-2xl font-light text-cream mb-1">
          {p.title}
        </h3>
        <p className="text-cream/80 text-xs md:text-sm font-light mb-3">{p.subtitle}</p>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
          Découvrir <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition" />
        </span>
      </div>
    </Link>
  );
}
