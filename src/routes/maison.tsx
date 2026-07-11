import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-1.jpg";

const config: LifestyleConfig = {
  page: "maison",
  hero: {
    eyebrow: "Univers Maison",
    title: "L'Art",
    titleAccent: "de Recevoir",
    subtitle:
      "Parfums d'intérieur, bougies signées, décoration et textiles précieux. La maison devient écrin.",
    image: hero,
    primaryCta: { label: "Découvrir la collection", href: "#parfums-interieur" },
    secondaryCta: { label: "Voir les bougies", href: "#bougies" },
  },
  sections: [
    {
      eyebrow: "Atmosphère",
      title: "Parfums d'intérieur",
      kicker: "Diffuseurs et brumes textiles pour parfumer chaque pièce avec élégance.",
      subSlugs: ["brumes-parfumees", "parfums"],
      ctaLabel: "Voir les parfums maison",
      ctaHref: "/category/parfums-fragrances?audience=maison",
    },
    {
      eyebrow: "Lueur précieuse",
      title: "Bougies signature",
      kicker: "Cires végétales et fragrances rares — la lumière qui transforme l'instant.",
      subSlugs: ["coffrets-parfum"],
      ctaLabel: "Voir les bougies",
      ctaHref: "/category/parfums-fragrances?audience=maison&type=bougie",
    },
    {
      eyebrow: "Art de vivre",
      title: "Décoration",
      kicker: "Objets précieux, vases et pièces d'exception pour sublimer votre intérieur.",
      subSlugs: ["bijoux", "accessoires-maquillage"],
      ctaLabel: "Voir la décoration",
      ctaHref: "/category/mode-style?audience=maison",
    },
    {
      eyebrow: "Confort raffiné",
      title: "Textiles",
      kicker: "Plaids, coussins et linges de maison signés des plus grandes maisons.",
      subSlugs: ["sacs-a-main"],
      ctaLabel: "Voir les textiles",
      ctaHref: "/category/mode-style?audience=maison&type=textile",
    },
  ],
  bannerLayout: { fullAlign: "right" },
};

export const Route = createFileRoute("/maison")({
  head: () => ({
    meta: [
      { title: "Univers Maison — Soltani Signature" },
      { name: "description", content: "Univers Maison : parfums d'intérieur, bougies signées, décoration et textiles précieux pour sublimer votre quotidien." },
      { property: "og:title", content: "Univers Maison — Soltani Signature" },
      { property: "og:description", content: "L'art de recevoir : parfums d'intérieur, bougies et décoration." },
    ],
  }),
  component: () => <LifestylePage config={config} />,
});
