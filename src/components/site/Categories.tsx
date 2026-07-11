import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fallbackCategoryTree, loadCategoryTree, type CategoryTree } from "@/lib/categories-api";

export function Categories() {
  const [categories, setCategories] = useState<CategoryTree[]>(fallbackCategoryTree());

  useEffect(() => {
    let active = true;
    loadCategoryTree()
      .then((items) => {
        if (active && items.length) setCategories(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="categories" className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col items-center text-center mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Univers</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light max-w-2xl">
            Explorez nos <span className="italic text-gold">collections</span>
          </h2>
        </div>

        {/* Mobile: horizontal scroll carousel */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-4 snap-x snap-mandatory pb-2">
            {categories.map((c) => (
              <li key={c.slug} className="snap-start shrink-0 w-[44%]">
                <CategoryCard slug={c.slug} name={c.name} image={c.image} />
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop: 6-column grid */}
        <ul className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {categories.map((c) => (
            <li key={c.slug}>
              <CategoryCard slug={c.slug} name={c.name} image={c.image} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoryCard({ slug, name, image }: { slug: string; name: string; image: string }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="group block bg-white rounded-sm overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      </div>
      <div className="px-3 py-4 text-center">
        <h3 className="font-display text-[13px] md:text-sm font-normal uppercase tracking-[0.15em] text-foreground">
          {name}
        </h3>
        <p className="mt-1.5 text-[11px] text-muted-foreground font-light">Voir la sélection</p>
        <span className="mt-2 block mx-auto h-px w-8 bg-gold transition-all duration-500 group-hover:w-14" />
      </div>
    </Link>
  );
}
