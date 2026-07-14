import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Newsletter } from "@/components/site/Newsletter";
import { PageHero } from "@/components/site/SiteLayout";
import { TrustBar } from "@/components/site/TrustBar";
import { LifestyleSection, DualBanner } from "@/components/site/LifestyleSection";
import { PromoBanner } from "@/components/site/PromoBanner";
import type { Product } from "@/components/site/ProductCard";
import { getCatalogProducts } from "@/lib/catalog-api";
import { getActivePromoBanners, type PromoBanner as DynamicPromoBanner } from "@/lib/promo-banners-api";
import { useEffect, useState, type ReactNode } from "react";

type Section = {
  eyebrow?: string;
  title: string;
  kicker?: string;
  subSlugs: string | string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type LifestyleConfig = {
  page: "femme" | "homme" | "enfant" | "maison" | "bien-etre";
  hero: {
    eyebrow: string;
    title: string;
    titleAccent?: string;
    subtitle: string;
    image: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  sections: Section[];
  bannerLayout?: {
    fullAlign?: "left" | "right";
    bottomAlign?: "left" | "right";
  };
  intro?: ReactNode;
};

export function LifestylePage({ config }: { config: LifestyleConfig }) {
  const [banners, setBanners] = useState<DynamicPromoBanner[]>([]);
  const [sectionProducts, setSectionProducts] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    let active = true;
    getActivePromoBanners(config.page)
      .then((items) => {
        if (active) setBanners(items);
      })
      .catch(() => {
        if (active) setBanners([]);
      });

    return () => {
      active = false;
    };
  }, [config.page]);

  useEffect(() => {
    let active = true;

    Promise.all(
      config.sections.map(async (section) => {
        const slugs = Array.isArray(section.subSlugs) ? section.subSlugs : [section.subSlugs];
        const products = await Promise.all(
          slugs.map((slug) => getCatalogProducts({ section: config.page, category: slug }).catch(() => [])),
        );
        const unique = Array.from(
          new Map(products.flat().map((product) => [product.slug, product])).values(),
        ).slice(0, 4);
        return [section.title, unique] as const;
      }),
    ).then((entries) => {
      if (active) setSectionProducts(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [config.page, config.sections]);

  const fullBanner = banners[0];
  const dualLeftBanner = banners[1];
  const dualRightBanner = banners[2];
  const bottomBanner = banners[3];
  const getSectionItems = (section: Section) => sectionProducts[section.title] ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <CategoryNav />
      <Header />
      <main>
        <LifestyleHero
          eyebrow={config.hero.eyebrow}
          title={config.hero.title}
          titleAccent={config.hero.titleAccent}
          subtitle={config.hero.subtitle}
          image={config.hero.image}
          cta={config.hero.primaryCta}
          secondaryCta={config.hero.secondaryCta}
        />

        <TrustBar />

        {config.intro}

        {config.sections.slice(0, 2).map((s) => (
          <LifestyleSection
            key={s.title}
            eyebrow={s.eyebrow}
            title={s.title}
            kicker={s.kicker}
            items={getSectionItems(s)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {fullBanner && (
          <PromoBanner
            eyebrow={fullBanner.ctaLabel}
            title={fullBanner.title}
            subtitle={fullBanner.subtitle}
            cta={fullBanner.ctaLabel}
            to={fullBanner.ctaUrl}
            image={fullBanner.image}
            align={config.bannerLayout?.fullAlign}
          />
        )}

        {config.sections.slice(2, 4).map((s) => (
          <LifestyleSection
            key={s.title}
            eyebrow={s.eyebrow}
            title={s.title}
            kicker={s.kicker}
            items={getSectionItems(s)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {dualLeftBanner && dualRightBanner && (
          <DualBanner
            left={{
              eyebrow: dualLeftBanner.ctaLabel,
              title: dualLeftBanner.title,
              subtitle: dualLeftBanner.subtitle,
              cta: dualLeftBanner.ctaLabel,
              href: dualLeftBanner.ctaUrl,
              image: dualLeftBanner.image,
            }}
            right={{
              eyebrow: dualRightBanner.ctaLabel,
              title: dualRightBanner.title,
              subtitle: dualRightBanner.subtitle,
              cta: dualRightBanner.ctaLabel,
              href: dualRightBanner.ctaUrl,
              image: dualRightBanner.image,
            }}
          />
        )}

        {config.sections.slice(4).map((s) => (
          <LifestyleSection
            key={s.title}
            eyebrow={s.eyebrow}
            title={s.title}
            kicker={s.kicker}
            items={getSectionItems(s)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {bottomBanner && (
          <PromoBanner
            eyebrow={bottomBanner.ctaLabel}
            title={bottomBanner.title}
            subtitle={bottomBanner.subtitle}
            cta={bottomBanner.ctaLabel}
            to={bottomBanner.ctaUrl}
            image={bottomBanner.image}
            align={config.bannerLayout?.bottomAlign}
          />
        )}

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
