import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const SLIDES = [
  {
    image: hero1,
    eyebrow: "Collection Automne",
    title: "L'Art de l'Élégance",
    subtitle: "Bijoux d'exception, accessoires signés. Une sélection rare pour celles qui osent.",
    cta: "Découvrir la collection",
  },
  {
    image: hero2,
    eyebrow: "Horlogerie Suisse",
    title: "Le Temps en Or",
    subtitle: "Montres mécaniques, chronographes d'exception. La précision se porte au poignet.",
    cta: "Explorer les montres",
  },
  {
    image: hero3,
    eyebrow: "Parfumerie de Niche",
    title: "Sillages Inoubliables",
    subtitle: "Des fragrances rares signées par les plus grandes maisons.",
    cta: "Voir les parfums",
  },
];

export function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const slide = SLIDES[i];

  return (
    <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-background">
      <h1 className="sr-only">Soltani Signature — Parfumerie, Horlogerie et Maroquinerie de Luxe en Tunisie</h1>
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
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
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-12 bg-gold" />
                <span className="text-[11px] uppercase tracking-[0.4em] text-gold font-medium">
                  {slide.eyebrow}
                </span>
              </div>
              <p className="font-display text-4xl md:text-6xl lg:text-7xl font-medium text-foreground leading-[0.95] mb-6">
                {slide.title}
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#categories"
                  className="group inline-flex items-center gap-3 bg-gold text-ink px-7 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition shadow-gold rounded-sm"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </a>
                <a
                  href="#promos"
                  className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-7 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-foreground hover:text-background transition rounded-sm"
                >
                  Voir les promos
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
        <button
          onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-ink transition bg-background/70 backdrop-blur"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-foreground/70 text-sm tabular-nums tracking-widest">
          0{i + 1} <span className="text-gold/70">/ 0{SLIDES.length}</span>
        </span>
        <button
          onClick={() => setI((p) => (p + 1) % SLIDES.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-ink transition bg-background/70 backdrop-blur"
          aria-label="Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-[2px] transition-all duration-500 ${idx === i ? "w-14 bg-gold" : "w-7 bg-foreground/25"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
