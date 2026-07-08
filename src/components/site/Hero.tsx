import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/hero-api";
import { getActiveHeroSlides } from "@/lib/hero-api";


export function Hero() {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    getActiveHeroSlides()
      .then((apiSlides) => {
        if (apiSlides.length > 0) {
          setSlides(apiSlides);
          setIndex(0);
        }
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];

  if (!slide) {
    return (
      <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden bg-background md:h-[88vh] md:min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden bg-background md:h-[88vh] md:min-h-[600px]">
      <h1 className="sr-only">
        Soltani Signature — Parfumerie, Horlogerie et Maroquinerie de Luxe en Tunisie
      </h1>
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </motion.div>
      </AnimatePresence>

      <div className="container-luxe relative z-10 flex h-full items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center gap-3 md:mb-6">
                <span className="h-px w-8 bg-gold md:w-12" />
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold md:text-[11px] md:tracking-[0.4em]">
                  {slide.tagline}
                </span>
              </div>
              <p className="mb-4 font-display text-[2rem] font-medium leading-[1.05] text-foreground sm:text-4xl md:mb-6 md:text-6xl md:leading-[0.95] lg:text-7xl">
                {slide.title}
              </p>
              <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base md:mb-10 md:text-lg">
                {slide.subtitle}. {slide.description}
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <a
                  href={slide.ctaPrimary.link}
                  className="group inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-gold transition hover:bg-gold-soft md:gap-3 md:px-7 md:py-4 md:text-[12px] md:tracking-[0.25em]"
                >
                  {slide.ctaPrimary.text}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
                <a
                  href={slide.ctaSecondary.link}
                  className="inline-flex items-center gap-2 rounded-sm border border-foreground/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-foreground hover:text-background md:gap-3 md:px-7 md:py-4 md:text-[12px] md:tracking-[0.25em]"
                >
                  {slide.ctaSecondary.text}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-3 md:flex">
        <button
          onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-background/70 text-gold backdrop-blur transition hover:bg-gold hover:text-ink"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm tabular-nums tracking-widest text-foreground/70">
          0{index + 1} <span className="text-gold/70">/ 0{slides.length}</span>
        </span>
        <button
          onClick={() => setIndex((current) => (current + 1) % slides.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-background/70 text-gold backdrop-blur transition hover:bg-gold hover:text-ink"
          aria-label="Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-10">
        {slides.map((slideItem, dotIndex) => (
          <button
            key={slideItem.id}
            onClick={() => setIndex(dotIndex)}
            className={`h-[2px] transition-all duration-500 ${dotIndex === index ? "w-10 bg-gold md:w-14" : "w-5 bg-foreground/25 md:w-7"}`}
            aria-label={`Slide ${dotIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

