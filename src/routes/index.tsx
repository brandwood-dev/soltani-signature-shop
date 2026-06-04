import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { ProductGrid, BESTSELLERS, NEWARRIVALS } from "@/components/site/ProductGrid";
import { Brands } from "@/components/site/Brands";
import { PromoBanner } from "@/components/site/PromoBanner";
import { Promo } from "@/components/site/Promo";
import { Testimonials } from "@/components/site/Testimonials";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";
import { TrustBar } from "@/components/site/TrustBar";
import bannerMothers from "@/assets/cat-jewelry.jpg";
import bannerValentine from "@/assets/cat-bags.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Soltani Signature — Montres, Parfums & Luxe en Tunisie" },
      { name: "description", content: "Boutique de luxe en ligne : montres, lunettes, parfums, sacs, bijoux et cosmétiques premium. Livraison gratuite dès 300 DT, paiement 3x sans frais." },
      { property: "og:title", content: "Soltani Signature — L'art du luxe" },
      { property: "og:description", content: "Sélection rare de marques d'exception. Service signature en Tunisie." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <CategoryNav />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Categories />
        <ProductGrid eyebrow="Les Indispensables" title="Meilleures Ventes" items={BESTSELLERS} kicker="Les pièces les plus convoitées par notre clientèle." />
        <PromoBanner
          eyebrow="Édition Spéciale"
          title="Fête des Mères"
          subtitle="Offrez l'élégance"
          cta="Découvrir les cadeaux"
          to="/category/bijoux"
          image={bannerMothers}
          align="left"
        />

        <Brands />
        <ProductGrid eyebrow="Just Dropped" title="Nouvelles Arrivées" items={NEWARRIVALS} kicker="Les dernières créations des maisons que nous distribuons." />
        <PromoBanner
          eyebrow="Saint Valentin 2026"
          title="L'amour dans les détails"
          subtitle="Une sélection rare pour célébrer l'élégance partagée"
          cta="Voir les offres spéciales"
          to="/promotions"
          image={bannerValentine}
          align="right"
        />
        <Testimonials />
        <Promo />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
