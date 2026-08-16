import { createFileRoute } from "@tanstack/react-router";
import { lazy, useEffect, useState } from "react";
import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { ProductGrid } from "@/components/site/ProductGrid";
import { TrustBar } from "@/components/site/TrustBar";
import { LazySection } from "@/components/site/LazySection";
import type { PromoBanner as PromoBannerItem } from "@/lib/promo-banners-api";
import { loadHomeData, recoverHomeData, type HomeSection } from "@/lib/home-data";
import { canonicalLink, seoMeta } from "@/lib/seo";

const CollectionBanners = lazy(() =>
  import("@/components/site/CollectionBanners").then((m) => ({ default: m.CollectionBanners })),
);
const Brands = lazy(() => import("@/components/site/Brands").then((m) => ({ default: m.Brands })));
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
const Footer = lazy(() => import("@/components/site/Footer").then((m) => ({ default: m.Footer })));

export const Route = createFileRoute("/")({
  loader: () => loadHomeData(),
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
  const initialData = Route.useLoaderData();
  const [homeData, setHomeData] = useState(initialData);
  const [isRecovering, setIsRecovering] = useState(initialData.failedSections.length > 0);

  useEffect(() => {
    if (initialData.failedSections.length === 0) return;
    let active = true;

    void recoverHomeData(initialData, {
      onProgress: (recovered) => {
        if (active) setHomeData(recovered);
      },
    }).then(() => {
      if (active) setIsRecovering(false);
    });

    return () => {
      active = false;
    };
  }, [initialData]);

  const hasFailed = (section: HomeSection) => homeData.failedSections.includes(section);
  const retryPage = () => window.location.reload();
  const { heroSlides, bestsellers, newArrivals, packs, promoBanners, limitedOffer } = homeData;

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
          loadState={hasFailed("bestsellers") ? (isRecovering ? "loading" : "error") : "ready"}
          onRetry={retryPage}
          kicker="Les pièces les plus convoitées par notre clientèle."
          viewAllTo="/meilleures-ventes"
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
            loadState={hasFailed("newArrivals") ? (isRecovering ? "loading" : "error") : "ready"}
            onRetry={retryPage}
            kicker="Les dernières créations des maisons que nous distribuons."
            viewAllTo="/nouvelles-arrivees"
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
