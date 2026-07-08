import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { ProductGrid } from "@/components/site/ProductGrid";
import { Brands } from "@/components/site/Brands";
import { PromoBanner } from "@/components/site/PromoBanner";
import { Promo } from "@/components/site/Promo";
import { Testimonials } from "@/components/site/Testimonials";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";
import { TrustBar } from "@/components/site/TrustBar";
import { CollectionBanners } from "@/components/site/CollectionBanners";
import { Packs } from "@/components/site/Packs";
import { getCatalogProducts } from "@/lib/catalog-api";
import type { Product } from "@/components/site/ProductCard";

const bannerBrumes = "https://res.cloudinary.com/dxkxiy900/image/upload/v1780604892/banner_zgtjc9.jpg";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ bestsellers: Product[]; newArrivals: Product[] }> => {
    const products = await getCatalogProducts().catch(() => []);
    return {
      bestsellers: products.slice(0, 8),
      newArrivals: products.slice(8, 16).length ? products.slice(8, 16) : products.slice(0, 8),
    };
  },
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
  const { bestsellers, newArrivals } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <CategoryNav />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Categories />
        <ProductGrid eyebrow="Les Indispensables" title="Meilleures Ventes" items={bestsellers} kicker="Les pièces les plus convoitées par notre clientèle." />
        <CollectionBanners />

        <Brands />
        <ProductGrid eyebrow="Just Dropped" title="Nouvelles Arrivées" items={newArrivals} kicker="Les dernières créations des maisons que nous distribuons." />
        <Packs />
        <PromoBanner
          eyebrow="Collection Victoria's Secret Été 2026"
          title="Brumes Parfumées"
          subtitle="Pour le corps & les cheveux"
          cta="Découvrir la collection"
          to="/promotions"
          image={bannerBrumes}
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
