import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-1.jpg";
import { canonicalLink, seoMeta } from "@/lib/seo";

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
    meta: seoMeta({
      title: "Maison — Soltani Signature",
      description: "Ambiance maison : parfums d'intérieur, coffrets et signatures lifestyle pour sublimer votre espace.",
      path: "/maison",
    }),
    links: [canonicalLink("/maison")],
  }),
  component: () => <LifestylePage config={config} />,
});
