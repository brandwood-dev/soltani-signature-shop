import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type Product } from "./ProductCard";

type Props = {
  items: Product[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export function ProductCarousel({ items, autoPlay = true, autoPlayInterval = 4000 }: Props) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const pausedRef = useRef(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("li");
    const gap = 20;
    const step = first ? first.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayInterval, scrollByCard]);

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <ul
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
      >
        {items.map((p) => (
          <li
            key={p.slug}
            className="snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[32%] lg:w-[23.5%]"
          >
            <ProductCard p={p} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label="Précédent"
        onClick={() => scrollByCard(-1)}
        disabled={!canPrev}
        className="absolute left-1 md:-left-5 top-[38%] -translate-y-1/2 z-10 grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full bg-background/90 backdrop-blur border border-gold/30 text-foreground shadow-md transition-all duration-300 hover:bg-gold hover:text-ink hover:scale-105 disabled:opacity-0 disabled:pointer-events-none md:opacity-0 md:group-hover/carousel:opacity-100 active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Suivant"
        onClick={() => scrollByCard(1)}
        disabled={!canNext}
        className="absolute right-1 md:-right-5 top-[38%] -translate-y-1/2 z-10 grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full bg-background/90 backdrop-blur border border-gold/30 text-foreground shadow-md transition-all duration-300 hover:bg-gold hover:text-ink hover:scale-105 disabled:opacity-0 disabled:pointer-events-none md:opacity-0 md:group-hover/carousel:opacity-100 active:scale-95"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
