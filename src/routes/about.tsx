import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Award, Globe, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Soltani Signature" },
      { name: "description", content: "L'histoire d'une maison tunisienne dédiée au luxe authentique." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Notre maison" title="L'art du luxe, signé Soltani" subtitle="Depuis plus de 15 ans, nous sélectionnons les pièces d'exception qui définissent l'élégance contemporaine." />

      <section className="container-luxe py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Notre histoire</span>
          <h2 className="font-display text-4xl font-bold mt-3 mb-6">Une passion devenue institution</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>Fondée à Tunis en 2008, Soltani Signature est née d'une conviction : le luxe authentique mérite un écrin à sa hauteur. Notre maison s'engage à offrir à une clientèle exigeante les plus belles créations horlogères, parfumées et joaillières du monde.</p>
            <p>Chaque pièce que nous distribuons est sélectionnée à la main, vérifiée pour son authenticité, et présentée avec le soin qui sied à son rang.</p>
          </div>
        </div>
        <div className="aspect-[4/5] bg-gradient-to-br from-gold/20 via-secondary to-background rounded-sm" />
      </section>

      <section className="bg-secondary/40 border-y border-border py-20">
        <div className="container-luxe">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Nos engagements</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[{ I: Award, t: "Authenticité", d: "Chaque pièce est certifiée d'origine." },
              { I: Sparkles, t: "Excellence", d: "Une sélection rigoureuse au plus haut niveau." },
              { I: Users, t: "Service signature", d: "Conseillers dédiés disponibles 7j/7." },
              { I: Globe, t: "Made in Tunisia", d: "Une maison locale, un rayonnement global." }].map(({ I, t, d }) => (
              <div key={t} className="p-6 bg-background border border-border rounded-sm text-center">
                <I className="h-8 w-8 text-gold mx-auto mb-4" />
                <h3 className="font-display font-semibold mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-luxe py-20 grid md:grid-cols-3 gap-8 text-center">
        {[["15+", "années d'expertise"], ["3 200+", "clients fidèles"], ["120+", "marques distribuées"]].map(([n, l]) => (
          <div key={l}>
            <p className="font-display text-5xl md:text-6xl font-bold text-gold mb-2">{n}</p>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
