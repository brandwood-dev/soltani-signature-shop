import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/data/catalog";

export function Categories() {
  return (
    <section id="categories" className="py-24 md:py-32 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Univers</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-medium max-w-2xl">
              Explorez nos <span className="italic font-light text-gold">collections</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Six univers, des centaines de pièces sélectionnées avec exigence pour vous habiller d'exception.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary block"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/0 group-hover:ring-gold/40 transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1.5">{c.count}</p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream">{c.name}</h3>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 text-gold opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
