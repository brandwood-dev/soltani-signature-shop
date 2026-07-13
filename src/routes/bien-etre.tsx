import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-2.jpg";
import { canonicalLink, seoMeta } from "@/lib/seo";

const config: LifestyleConfig = {
  page: "bien-etre",
  hero: {
    eyebrow: "Bien-être & Sérénité",
    title: "Rituel",
    titleAccent: "de Sérénité",
    subtitle:
      "Huiles essentielles, soins corps et aromathérapie. L'art de prendre soin de soi, dans le silence et la pureté.",
    image: hero,
    primaryCta: { label: "Découvrir la collection", href: "#huiles-essentielles" },
    secondaryCta: { label: "Voir l'aromathérapie", href: "#aromatherapie" },
  },
  sections: [
    {
      eyebrow: "Essences pures",
      title: "Huiles essentielles",
      kicker: "Lavande, ylang-ylang, bois de santal — la quintessence des plantes en flacon.",
      subSlugs: ["huiles-serums", "serums"],
      ctaLabel: "Voir les huiles",
      ctaHref: "/category/cheveux?audience=bien-etre",
    },
    {
      eyebrow: "Rituel corps",
      title: "Soins corps",
      kicker: "Laits hydratants, gommages et baumes nourrissants pour une peau de velours.",
      subSlugs: ["cremes-hydratantes", "masques", "nettoyants"],
      ctaLabel: "Voir les soins corps",
      ctaHref: "/category/soins-visage?audience=bien-etre",
    },
    {
      eyebrow: "Énergie & Vitalité",
      title: "Compléments",
      kicker: "Compléments alimentaires et boosters naturels pour soutenir votre équilibre.",
      subSlugs: ["serums", "contour-yeux"],
      ctaLabel: "Voir les compléments",
      ctaHref: "/category/soins-visage?audience=bien-etre&type=complement",
    },
    {
      eyebrow: "Atmosphère",
      title: "Aromathérapie",
      kicker: "Diffuseurs, sprays d'ambiance et synergies olfactives pour apaiser l'esprit.",
      subSlugs: ["brumes-parfumees", "huiles-serums"],
      ctaLabel: "Voir l'aromathérapie",
      ctaHref: "/category/parfums-fragrances?audience=bien-etre",
    },
    {
      eyebrow: "Sun & Recovery",
      title: "Après-soleil & Apaisants",
      kicker: "Soins réparateurs après-soleil et baumes apaisants pour une peau réconfortée.",
      subSlugs: ["apres-soleil", "masques"],
      ctaLabel: "Voir les apaisants",
      ctaHref: "/category/protection-solaire?audience=bien-etre",
    },
  ],
  bannerLayout: { fullAlign: "left" },
};

export const Route = createFileRoute("/bien-etre")({
  head: () => ({
    meta: seoMeta({
      title: "Bien-être — Soltani Signature",
      description: "Routine bien-être : soins, protection solaire, cheveux et beauté premium en Tunisie.",
      path: "/bien-etre",
    }),
    links: [canonicalLink("/bien-etre")],
  }),
  component: () => <LifestylePage config={config} />,
});
