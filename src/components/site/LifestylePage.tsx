import { TopBar } from "@/components/site/TopBar";
import { CategoryNav } from "@/components/site/CategoryNav";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Newsletter } from "@/components/site/Newsletter";
import { LifestyleHero } from "@/components/site/LifestyleHero";
import { TrustBar } from "@/components/site/TrustBar";
import { LifestyleSection, DualBanner } from "@/components/site/LifestyleSection";
import { PromoBanner } from "@/components/site/PromoBanner";
import type { ReactNode } from "react";

type Section = {
  eyebrow?: string;
  title: string;
  kicker?: string;
  subSlugs: string | string[];
  ctaLabel?: string;
  ctaHref?: string;
};

import { pickProducts } from "@/lib/lifestyle";

export type LifestyleConfig = {
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
  fullBanner?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    cta: string;
    to: string;
    image: string;
    align?: "left" | "right";
  };
  dualBanner?: {
    left: { eyebrow?: string; title: string; subtitle: string; cta: string; href: string; image: string };
    right: { eyebrow?: string; title: string; subtitle: string; cta: string; href: string; image: string };
  };
  bottomBanner?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    cta: string;
    to: string;
    image: string;
    align?: "left" | "right";
  };
  intro?: ReactNode;
};

export function LifestylePage({ config }: { config: LifestyleConfig }) {
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
            items={pickProducts(s.subSlugs, 4)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {config.fullBanner && (
          <PromoBanner
            eyebrow={config.fullBanner.eyebrow}
            title={config.fullBanner.title}
            subtitle={config.fullBanner.subtitle}
            cta={config.fullBanner.cta}
            to={config.fullBanner.to}
            image={config.fullBanner.image}
            align={config.fullBanner.align}
          />
        )}

        {config.sections.slice(2, 4).map((s) => (
          <LifestyleSection
            key={s.title}
            eyebrow={s.eyebrow}
            title={s.title}
            kicker={s.kicker}
            items={pickProducts(s.subSlugs, 4)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {config.dualBanner && <DualBanner left={config.dualBanner.left} right={config.dualBanner.right} />}

        {config.sections.slice(4).map((s) => (
          <LifestyleSection
            key={s.title}
            eyebrow={s.eyebrow}
            title={s.title}
            kicker={s.kicker}
            items={pickProducts(s.subSlugs, 4)}
            ctaLabel={s.ctaLabel}
            ctaHref={s.ctaHref}
          />
        ))}

        {config.bottomBanner && (
          <PromoBanner
            eyebrow={config.bottomBanner.eyebrow}
            title={config.bottomBanner.title}
            subtitle={config.bottomBanner.subtitle}
            cta={config.bottomBanner.cta}
            to={config.bottomBanner.to}
            image={config.bottomBanner.image}
            align={config.bottomBanner.align}
          />
        )}

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
