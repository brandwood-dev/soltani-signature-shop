const BRANDS = ["ROLEX", "CARTIER", "TISSOT", "RAY·BAN", "PORSCHE DESIGN", "TOM FORD", "DIOR", "CHANEL", "YSL", "GUCCI", "PRADA", "VERSACE"];

export function Brands() {
  return (
    <section className="py-16 border-y border-gold/10 bg-ink/40 overflow-hidden">
      <div className="container-luxe mb-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Marques Partenaires</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-cream">Les maisons d'exception</h2>
      </div>
      <div className="relative">
        <div className="flex marquee gap-16 whitespace-nowrap w-max">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-display text-2xl md:text-3xl font-light tracking-[0.25em] text-cream/40 hover:text-gold transition cursor-pointer">
              {b}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
