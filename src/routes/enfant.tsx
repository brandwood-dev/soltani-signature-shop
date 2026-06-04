import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-3.jpg";
import bannerCosmetics from "@/assets/cat-cosmetics.jpg";
import bannerPerfumes from "@/assets/cat-perfumes.jpg";
import bannerBags from "@/assets/cat-bags.jpg";

const config: LifestyleConfig = {
  hero: {
    eyebrow: "Univers Enfant",
    title: "Collection",
    titleAccent: "Enfant",
    subtitle:
      "Soins doux, parfums délicats et accessoires malicieux. Une sélection pensée pour la tendresse et l'éveil.",
    image: hero,
    primaryCta: { label: "Découvrir la collection", href: "#soins-enfant" },
    secondaryCta: { label: "Voir les cadeaux", href: "#cadeaux-enfant" },
  },
  sections: [
    {
      eyebrow: "Douceur",
      title: "Soins Enfant",
      kicker: "Formules ultra-douces, hypoallergéniques et testées dermatologiquement.",
      subSlugs: ["cremes-hydratantes", "nettoyants", "masques"],
      ctaLabel: "Voir les soins",
      ctaHref: "/category/soins-visage?audience=enfant",
    },
    {
      eyebrow: "Eaux légères",
      title: "Parfums Enfant",
      kicker: "Brumes parfumées et eaux fraîches conçues pour les peaux les plus sensibles.",
      subSlugs: ["brumes-parfumees", "coffrets-parfum"],
      ctaLabel: "Voir les parfums",
      ctaHref: "/category/parfums-fragrances?audience=enfant",
    },
    {
      eyebrow: "Sun Care Kids",
      title: "Protection Solaire Enfant",
      kicker: "Crèmes solaires haute protection spécialement formulées pour les enfants.",
      subSlugs: ["solaires-corps", "apres-soleil"],
      ctaLabel: "Voir la protection",
      ctaHref: "/category/protection-solaire?audience=enfant",
    },
    {
      eyebrow: "Petits Accessoires",
      title: "Mode & Accessoires Enfant",
      kicker: "Lunettes, petits sacs et accessoires fantaisie pour les plus jeunes.",
      subSlugs: ["lunettes", "sacs-a-main"],
      ctaLabel: "Voir la mode enfant",
      ctaHref: "/category/mode-style?audience=enfant",
    },
    {
      eyebrow: "Cadeaux Enfant",
      title: "L'Art d'offrir aux Petits",
      kicker: "Coffrets émerveillants pour les anniversaires et grandes occasions.",
      subSlugs: ["coffrets-parfum", "accessoires-maquillage"],
      ctaLabel: "Voir tous les cadeaux",
      ctaHref: "/category/parfums-fragrances?audience=enfant&type=cadeau",
    },
  ],
  fullBanner: {
    eyebrow: "Nouveauté",
    title: "Univers tendresse",
    subtitle: "Une collection pensée avec amour pour vos enfants.",
    cta: "Explorer la collection",
    to: "/category/soins-visage",
    image: bannerCosmetics,
    align: "left",
  },
  dualBanner: {
    left: {
      eyebrow: "Brumes",
      title: "Eaux fraîches",
      subtitle: "Délicates et hypoallergéniques.",
      cta: "Découvrir",
      href: "/category/brumes-parfumees",
      image: bannerPerfumes,
    },
    right: {
      eyebrow: "Cadeau",
      title: "Petits trésors",
      subtitle: "Des coffrets précieux à offrir.",
      cta: "Voir les coffrets",
      href: "/category/coffrets-parfum",
      image: bannerBags,
    },
  },
};

export const Route = createFileRoute("/enfant")({
  head: () => ({
    meta: [
      { title: "Collection Enfant — Soltani Signature" },
      { name: "description", content: "Univers Enfant : soins doux, parfums délicats, protection solaire et accessoires pour les plus jeunes." },
      { property: "og:title", content: "Collection Enfant — Soltani Signature" },
      { property: "og:description", content: "Une sélection tendre et précieuse pour les enfants." },
    ],
  }),
  component: () => <LifestylePage config={config} />,
});
