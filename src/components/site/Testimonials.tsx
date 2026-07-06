import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

const TESTS = [
  { name: "Yasmine B.", city: "Tunis", text: "Service impeccable, emballage sublime. Ma montre est arrivée en 24h, exactement comme sur les photos.", product: "Tissot Chronographe" },
  { name: "Mehdi K.", city: "Sousse", text: "Soltani Signature est devenu mon adresse de référence pour les parfums de niche. Conseillère adorable.", product: "Tom Ford Parfum" },
  { name: "Lina R.", city: "Sfax", text: "L'expérience d'achat est aussi luxueuse que le produit. Je recommande sans hésiter.", product: "Sac Cartier" },
];

function Card({ t }: { t: (typeof TESTS)[number] }) {
  return (
    <div className="h-full p-6 sm:p-8 bg-card border border-border hover:border-gold/40 shadow-sm transition rounded-sm relative">
      <Quote className="absolute top-5 right-5 h-7 w-7 text-gold/20" />
      <div className="flex gap-0.5 mb-4 sm:mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
        ))}
      </div>
      <p className="text-foreground/85 mb-6 leading-relaxed text-[15px]">"{t.text}"</p>
      <div className="pt-4 sm:pt-5 border-t border-border">
        <p className="font-semibold text-foreground">{t.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t.city} · {t.product}
        </p>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % TESTS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-secondary/40">
      <div className="container-luxe">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Avis Clients</span>
          <h2 className="font-display text-3xl md:text-5xl font-medium mt-3 text-foreground">
            Ils nous font <span className="italic font-light text-gold">confiance</span>
          </h2>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {TESTS.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </div>

        {/* Mobile: auto-carousel, 1 card per line */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${i * 100}%)` }}
            >
              {TESTS.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-1">
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            {TESTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Témoignage ${idx + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  idx === i ? "w-8 bg-gold" : "w-3 bg-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
