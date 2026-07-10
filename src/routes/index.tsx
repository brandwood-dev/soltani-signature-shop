import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { ProductGrid } from "@/components/site/ProductGrid";
import { TrustBar } from "@/components/site/TrustBar";
import { LazySection } from "@/components/site/LazySection";
import { getCatalogProducts } from "@/lib/catalog-api";
import { getActiveHeroSlides, type HeroSlide } from "@/lib/hero-api";
import type { Product } from "@/components/site/ProductCard";

// Below-the-fold: split into separate chunks and mount on scroll.
const CollectionBanners = lazy(() =>
  import("@/components/site/CollectionBanners").then((m) => ({ default: m.CollectionBanners })),
);
const Brands = lazy(() =>
  import("@/components/site/Brands").then((m) => ({ default: m.Brands })),
);
const Packs = lazy(() => import("@/components/site/Packs").then((m) => ({ default: m.Packs })));
const PromoBanner = lazy(() =>
  import("@/components/site/PromoBanner").then((m) => ({ default: m.PromoBanner })),
);
const Promo = lazy(() => import("@/components/site/Promo").then((m) => ({ default: m.Promo })));
const Testimonials = lazy(() =>
  import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials })),
);
const Newsletter = lazy(() =>
  import("@/components/site/Newsletter").then((m) => ({ default: m.Newsletter })),
);
const Footer = lazy(() =>
  import("@/components/site/Footer").then((m) => ({ default: m.Footer })),
);

const bannerBrumes =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780604892/banner_zgtjc9.jpg";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ heroSlides: HeroSlide[]; bestsellers: Product[]; newArrivals: Product[] }> => {
    const [heroSlides, products] = await Promise.all([
      getActiveHeroSlides().catch(() => []),
      getCatalogProducts().catch(() => []),
    ]);
    return {
      heroSlides,
      bestsellers: products.slice(0, 8),
      newArrivals: products.slice(8, 16).length ? products.slice(8, 16) : products.slice(0, 8),
    };
  },
  head: () => ({
    meta: [
      { title: "Soltani Signature — Montres, Parfums & Luxe en Tunisie" },
      {
        name: "description",
        content:
          "Boutique de luxe en ligne : montres, lunettes, parfums, sacs, bijoux et cosmétiques premium. Livraison gratuite dès 300 DT, paiement 3x sans frais.",
      },
      { property: "og:title", content: "Soltani Signature — L'art du luxe" },
      {
        property: "og:description",
        content: "Sélection rare de marques d'exception. Service signature en Tunisie.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  const { heroSlides, bestsellers, newArrivals } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <CategoryNav />
      <Header />
      <main>
        <Hero initialSlides={heroSlides} />
        <TrustBar />
        <Categories />
        <ProductGrid
          eyebrow="Les Indispensables"
          title="Meilleures Ventes"
          items={bestsellers}
          kicker="Les pièces les plus convoitées par notre clientèle."
        />
        <LazySection minHeight={520}>
          <CollectionBanners />
        </LazySection>
        <LazySection minHeight={280}>
          <Brands />
        </LazySection>
        <LazySection minHeight={640}>
          <ProductGrid
            eyebrow="Just Dropped"
            title="Nouvelles Arrivées"
            items={newArrivals}
            kicker="Les dernières créations des maisons que nous distribuons."
          />
        </LazySection>
        <LazySection minHeight={520}>
          <Packs />
        </LazySection>
        <LazySection minHeight={420}>
          <PromoBanner
            eyebrow="Collection Victoria's Secret Été 2026"
            title="Brumes Parfumées"
            subtitle="Pour le corps & les cheveux"
            cta="Découvrir la collection"
            to="/promotions"
            image={bannerBrumes}
            align="right"
          />
        </LazySection>
        <LazySection minHeight={520}>
          <Testimonials />
        </LazySection>
        <LazySection minHeight={360}>
          <Promo />
        </LazySection>
        <LazySection minHeight={320}>
          <Newsletter />
        </LazySection>
        <LazySection minHeight={480}>
          <Footer />
        </LazySection>
      </main>
    </div>
  );
}
