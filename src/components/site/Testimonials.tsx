import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

import type { Testimonial } from "@/lib/testimonials-api";
import { getPublicTestimonials } from "@/lib/testimonials-api";
import { useInViewport, usePrefersReducedMotion } from "@/hooks/useInViewport";

function Card({ t }: { t: Testimonial }) {
  return (
    <div className="h-full p-6 sm:p-8 bg-card border border-border hover:border-gold/40 shadow-sm transition rounded-sm relative">
      <Quote className="absolute top-5 right-5 h-7 w-7 text-gold/20" />
      <div className="flex gap-0.5 mb-4 sm:mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <p className="text-foreground/85 mb-6 leading-relaxed text-[15px]">"{t.text}"</p>
      <div className="pt-4 sm:pt-5 border-t border-border">
        <p className="font-semibold text-foreground">{t.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t.gouvernorat} ·{" "}
          {t.productUrl ? (
            <a href={t.productUrl} className="underline underline-offset-2">
              {t.productTitle}
            </a>
          ) : (
            t.productTitle
          )}
        </p>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    getPublicTestimonials()
      .then(setTestimonials)
      .catch(() => setTestimonials([]));
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  useEffect(() => {
    setI(0);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const desktopTestimonials =
    testimonials.length <= 3
      ? testimonials
      : Array.from({ length: 3 }, (_, offset) => testimonials[(i + offset) % testimonials.length]);

  return (
    <section className="py-12 md:py-20 bg-secondary/40">
      <div className="container-luxe">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Avis Clients</span>
          <h2 className="font-display text-3xl md:text-5xl font-medium mt-3 text-foreground">
            Ils nous font <span className="italic font-light text-gold">confiance</span>
          </h2>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {desktopTestimonials.map((t) => (
            <Card key={t.id} t={t} />
          ))}
        </div>

        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${i * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full shrink-0 px-1">
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-1">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Témoignage ${idx + 1}`}
                className={`mobile-slider-dot min-h-0 p-0 rounded-full transition-all duration-500 ${
                  idx === i ? "h-[3px] w-3 bg-gold" : "h-[3px] w-[3px] bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
