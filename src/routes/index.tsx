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
import { getActivePromoBanners, type PromoBanner as PromoBannerItem } from "@/lib/promo-banners-api";
import type { Product } from "@/components/site/ProductCard";
import { canonicalLink, seoMeta } from "@/lib/seo";

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

export const Route = createFileRoute("/")({
  loader: async (): Promise<{
    heroSlides: HeroSlide[];
    bestsellers: Product[];
    newArrivals: Product[];
    packs: Product[];
    promoBanners: PromoBannerItem[];
    limitedOffer: PromoBannerItem | null;
  }> => {
    const [heroSlides, products, packs, promoBanners, limitedOffers] = await Promise.all([
      getActiveHeroSlides().catch(() => []),
      getCatalogProducts().catch(() => []),
      getCatalogProducts({ category: "coffrets-parfum" }).catch(() => []),
      getActivePromoBanners("home", "promotion").catch(() => []),
      getActivePromoBanners("home", "limited_offer").catch(() => []),
    ]);
    return {
      heroSlides,
      bestsellers: products.filter((product) => product.isBestSeller).slice(0, 8),
      newArrivals: products.filter((product) => product.isFeatured).slice(0, 8),
      packs,
      promoBanners,
      limitedOffer: limitedOffers[0] ?? null,
    };
  },
  head: () => ({
    meta: seoMeta({
      title: "Soltani Signature — Beauté, parfums & lifestyle en Tunisie",
      description:
        "Découvrez Soltani Signature : parfums, maquillage, soins, cheveux, protection solaire et mode lifestyle. Livraison rapide en Tunisie.",
      path: "/",
    }),
    links: [canonicalLink("/")],
  }),
  component: Home,
});

function Home() {
  const { heroSlides, bestsellers, newArrivals, packs, promoBanners, limitedOffer } = Route.useLoaderData();

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
          <Packs items={packs} />
        </LazySection>
        {promoBanners.map((banner: PromoBannerItem, index: number) => (
          <LazySection key={banner.id} minHeight={420}>
            <PromoBanner
              eyebrow={banner.ctaLabel}
              title={banner.title}
              subtitle={banner.subtitle}
              cta={banner.ctaLabel}
              to={banner.ctaUrl}
              image={banner.image}
              align={index % 2 === 0 ? "right" : "left"}
            />
          </LazySection>
        ))}
        <LazySection minHeight={520}>
          <Testimonials />
        </LazySection>
        {limitedOffer && (
          <LazySection minHeight={360}>
            <Promo banner={limitedOffer} />
          </LazySection>
        )}
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
