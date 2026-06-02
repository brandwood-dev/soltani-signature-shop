import { Link } from "@tanstack/react-router";
import { TOP_BRANDS } from "@/data/catalog";

export function TopBrands() {
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Nos Maisons</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Top Marques</h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Des maisons légendaires soigneusement sélectionnées pour leur excellence.
            </p>
          </div>
        </div>

        <div className="-mx-4 md:mx-0 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-5 px-4 md:px-0 pb-2">
            {TOP_BRANDS.map((b) => (
              <li key={b.slug} className="snap-start shrink-0 w-[220px] sm:w-[240px] md:w-[260px]">
                <Link
                  to="/brand/$slug"
                  params={{ slug: b.slug }}
                  className="group block relative aspect-[4/5] overflow-hidden rounded-sm bg-card shadow-sm border border-border hover:border-gold/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe"
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Maison</span>
                    <h3 className="font-display text-2xl font-semibold text-cream">{b.name}</h3>
                    <p className="text-xs text-cream/70 mt-1">{b.tagline}</p>
                    <span className="mt-4 inline-flex w-fit text-[10px] uppercase tracking-[0.25em] text-cream border-b border-gold/60 pb-0.5 group-hover:text-gold transition">
                      Découvrir →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
