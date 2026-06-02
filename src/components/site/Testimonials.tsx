import { Star, Quote } from "lucide-react";

const TESTS = [
  { name: "Yasmine B.", city: "Tunis", text: "Service impeccable, emballage sublime. Ma montre est arrivée en 24h, exactement comme sur les photos.", product: "Tissot Chronographe" },
  { name: "Mehdi K.", city: "Sousse", text: "Soltani Signature est devenu mon adresse de référence pour les parfums de niche. Conseillère adorable.", product: "Tom Ford Parfum" },
  { name: "Lina R.", city: "Sfax", text: "L'expérience d'achat est aussi luxueuse que le produit. Je recommande sans hésiter.", product: "Sac Cartier" },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-secondary/40">
      <div className="container-luxe">
        <div className="text-center mb-14">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Avis Clients</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 text-foreground">
            Ils nous font <span className="italic font-light text-gold">confiance</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTS.map((t) => (
            <div key={t.name} className="p-8 bg-card border border-border hover:border-gold/40 shadow-sm transition rounded-sm relative">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-gold/20" />
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-gold text-gold" />))}
              </div>
              <p className="text-foreground/85 mb-6 leading-relaxed">"{t.text}"</p>
              <div className="pt-5 border-t border-border">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.city} · {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
