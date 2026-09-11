import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackCategoryTree, loadCategoryTree, type CategoryTree } from "@/lib/categories-api";

export function Categories() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [desktopHasOverflow, setDesktopHasOverflow] = useState(false);
  const [desktopPaused, setDesktopPaused] = useState(false);
  const desktopTrackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let active = true;
    loadCategoryTree()
      .then((items) => {
        if (active && items.length) setCategories(items);
      })
      .catch(() => {
        if (active) setCategories(fallbackCategoryTree());
      });
    return () => {
      active = false;
    };
  }, []);

  const scrollDesktop = useCallback((direction: 1 | -1) => {
    const track = desktopTrackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-category-card]");
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0");
    const distance = firstCard.getBoundingClientRect().width + gap;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;

    const nextScroll = track.scrollLeft + direction * distance;
    const left = nextScroll <= 1 ? maxScroll : nextScroll >= maxScroll - 1 ? 0 : nextScroll;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    track.scrollTo({ left, behavior });
  }, []);

  useEffect(() => {
    const track = desktopTrackRef.current;
    if (!track) return;

    const updateOverflow = () => {
      setDesktopHasOverflow(track.scrollWidth > track.clientWidth + 1);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(track);
    window.addEventListener("resize", updateOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [categories.length]);

  useEffect(() => {
    if (!desktopHasOverflow || desktopPaused) return;

    const interval = window.setInterval(() => scrollDesktop(1), 5000);
    return () => window.clearInterval(interval);
  }, [desktopHasOverflow, desktopPaused, scrollDesktop]);

  return (
    <section id="categories" className="py-12 md:pb-8 md:pt-16 bg-background">
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

        {/* Desktop: horizontal carousel */}
        <div
          className="hidden md:block"
          onMouseEnter={() => setDesktopPaused(true)}
          onMouseLeave={() => setDesktopPaused(false)}
          onFocus={() => setDesktopPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDesktopPaused(false);
          }}
        >
          <ul
            ref={desktopTrackRef}
            className="flex gap-4 lg:gap-5 overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((c) => (
              <li
                key={c.slug}
                data-category-card
                className="snap-start shrink-0 w-[calc((100%-2rem)/3)] lg:w-[calc((100%-6.25rem)/6)]"
              >
                <CategoryCard slug={c.slug} name={c.name} image={c.image} />
              </li>
            ))}
          </ul>

          {desktopHasOverflow && (
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => scrollDesktop(-1)}
                aria-label="Collections précédentes"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollDesktop(1)}
                aria-label="Collections suivantes"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                →
              </button>
            </div>
          )}
        </div>
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
