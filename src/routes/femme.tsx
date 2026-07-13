import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-1.jpg";
import { canonicalLink, seoMeta } from "@/lib/seo";

const config: LifestyleConfig = {
  page: "femme",
  hero: {
    eyebrow: "Univers Femme",
    title: "Collection",
    titleAccent: "Femme",
    subtitle:
      "Parfums signatures, maquillage couture, soins d'exception et accessoires précieux. L'art du luxe au féminin, sélectionné pour vous.",
    image: hero,
    primaryCta: { label: "Découvrir la collection", href: "#parfums-femme" },
    secondaryCta: { label: "Voir les cadeaux", href: "#cadeaux-elle" },
  },
  sections: [
    {
      eyebrow: "Sillages d'exception",
      title: "Parfums Femme",
      kicker: "Des fragrances florales, ambrées et orientales signées par les plus grandes maisons.",
      subSlugs: ["parfums", "brumes-parfumees"],
      ctaLabel: "Voir tous les parfums",
      ctaHref: "/category/parfums-fragrances?audience=femme",
    },
    {
      eyebrow: "Beauté Couture",
      title: "Maquillage Femme",
      kicker: "Teint lumineux, regard intense, lèvres précieuses — la beauté à son apogée.",
      subSlugs: ["teint", "yeux", "levres"],
      ctaLabel: "Voir le maquillage",
      ctaHref: "/category/maquillage?audience=femme",
    },
    {
      eyebrow: "Rituel d'éclat",
      title: "Soins du Visage Femme",
      kicker: "Sérums repulpants, crèmes hydratantes et masques d'exception pour une peau radieuse.",
      subSlugs: ["serums", "cremes-hydratantes", "contour-yeux"],
      ctaLabel: "Voir les soins",
      ctaHref: "/category/soins-visage?audience=femme",
    },
    {
      eyebrow: "Précieux & Signature",
      title: "Montres & Bijoux Femme",
      kicker: "Pièces d'orfèvrerie et garde-temps d'exception pour celles qui osent l'élégance.",
      subSlugs: ["bijoux", "montres"],
      ctaLabel: "Voir la joaillerie",
      ctaHref: "/category/bijoux?audience=femme",
    },
    {
      eyebrow: "Regard d'icône",
      title: "Lunettes Femme",
      kicker: "Solaires et optiques signées — l'accessoire qui transforme une silhouette.",
      subSlugs: "lunettes",
      ctaLabel: "Voir les lunettes",
      ctaHref: "/category/lunettes?audience=femme",
    },
    {
      eyebrow: "Sun Care",
      title: "Protection Solaire Femme",
      kicker: "Protégez votre éclat : crèmes solaires, après-soleil et soins haute protection.",
      subSlugs: ["solaires-visage", "apres-soleil"],
      ctaLabel: "Voir la protection",
      ctaHref: "/category/protection-solaire?audience=femme",
    },
    {
      eyebrow: "Cadeaux pour elle",
      title: "L'Art d'offrir",
      kicker: "Coffrets précieux, accessoires emblématiques — des cadeaux pensés pour la marquer.",
      subSlugs: ["coffrets-parfum", "sacs-a-main"],
      ctaLabel: "Voir tous les cadeaux",
      ctaHref: "/category/parfums-fragrances?audience=femme&type=cadeau",
    },
  ],
  bannerLayout: { fullAlign: "left", bottomAlign: "right" },
};

export const Route = createFileRoute("/femme")({
  head: () => ({
    meta: seoMeta({
      title: "Collection Femme — Soltani Signature",
      description: "Univers Femme : parfums, maquillage, soins, cheveux et essentiels beauté disponibles chez Soltani Signature.",
      path: "/femme",
    }),
    links: [canonicalLink("/femme")],
  }),
  component: () => <LifestylePage config={config} />,
});
