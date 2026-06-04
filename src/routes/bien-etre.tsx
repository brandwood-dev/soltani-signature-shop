import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-2.jpg";
import bannerCosmetics from "@/assets/cat-cosmetics.jpg";
import bannerPerfumes from "@/assets/cat-perfumes.jpg";

const config: LifestyleConfig = {
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
  fullBanner: {
    eyebrow: "Wellness",
    title: "Cocon de sérénité",
    subtitle: "Une parenthèse sensorielle, chez vous, chaque jour.",
    cta: "Explorer le bien-être",
    to: "/category/soins-visage",
    image: bannerCosmetics,
    align: "left",
  },
  dualBanner: {
    left: {
      eyebrow: "Essentiel",
      title: "Synergies d'huiles",
      subtitle: "Compositions exclusives pour le diffuseur.",
      cta: "Découvrir",
      href: "/category/cheveux",
      image: bannerPerfumes,
    },
    right: {
      eyebrow: "Rituel",
      title: "Massage & Détente",
      subtitle: "Huiles de massage et baumes nourrissants.",
      cta: "Voir les soins",
      href: "/category/soins-visage",
      image: bannerCosmetics,
    },
  },
};

export const Route = createFileRoute("/bien-etre")({
  head: () => ({
    meta: [
      { title: "Bien-être & Sérénité — Soltani Signature" },
      { name: "description", content: "Univers Bien-être : huiles essentielles, soins corps, compléments et aromathérapie pour un quotidien apaisé." },
      { property: "og:title", content: "Bien-être & Sérénité — Soltani Signature" },
      { property: "og:description", content: "L'art du rituel : huiles essentielles, aromathérapie et soins corps." },
    ],
  }),
  component: () => <LifestylePage config={config} />,
});
