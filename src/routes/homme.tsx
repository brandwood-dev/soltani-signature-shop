import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-2.jpg";
import bannerWatches from "@/assets/cat-watches.jpg";
import bannerSunglasses from "@/assets/cat-sunglasses.jpg";
import bannerPerfumes from "@/assets/cat-perfumes.jpg";

const config: LifestyleConfig = {
  hero: {
    eyebrow: "Univers Homme",
    title: "Collection",
    titleAccent: "Homme",
    subtitle:
      "Horlogerie suisse, parfums boisés et accessoires sculptés. L'élégance masculine, sans compromis.",
    image: hero,
    primaryCta: { label: "Découvrir la collection", href: "#parfums-homme" },
    secondaryCta: { label: "Voir l'horlogerie", href: "#montres-homme" },
  },
  sections: [
    {
      eyebrow: "Sillages Boisés",
      title: "Parfums Homme",
      kicker: "Fragrances boisées, cuirées, orientales — pour un caractère affirmé.",
      subSlugs: ["parfums", "coffrets-parfum"],
      ctaLabel: "Voir les parfums",
      ctaHref: "/category/parfums-fragrances?audience=homme",
    },
    {
      eyebrow: "Grooming Premium",
      title: "Soins Homme",
      kicker: "Sérums, hydratants et rituels visage spécialement formulés pour la peau masculine.",
      subSlugs: ["serums", "cremes-hydratantes", "nettoyants"],
      ctaLabel: "Voir les soins",
      ctaHref: "/category/soins-visage?audience=homme",
    },
    {
      eyebrow: "Garde-temps",
      title: "Montres Homme",
      kicker: "Chronographes, automatiques et pièces de manufacture — la mécanique au poignet.",
      subSlugs: "montres",
      ctaLabel: "Voir les montres",
      ctaHref: "/category/montres?audience=homme",
    },
    {
      eyebrow: "Regard d'acier",
      title: "Lunettes Homme",
      kicker: "Solaires aviator, pilotes en titane, montures acétate — la signature du regard.",
      subSlugs: "lunettes",
      ctaLabel: "Voir les lunettes",
      ctaHref: "/category/lunettes?audience=homme",
    },
    {
      eyebrow: "Maille précieuse",
      title: "Bijoux Homme",
      kicker: "Bracelets, chevalières et chaînes — l'accessoire qui signe le style.",
      subSlugs: "bijoux",
      ctaLabel: "Voir la joaillerie",
      ctaHref: "/category/bijoux?audience=homme",
    },
  ],
  fullBanner: {
    eyebrow: "Édition Limitée",
    title: "Horlogerie d'exception",
    subtitle: "Une sélection de chronographes et automatiques signés.",
    cta: "Explorer les montres",
    to: "/category/montres",
    image: bannerWatches,
    align: "left",
  },
  dualBanner: {
    left: {
      eyebrow: "Signature",
      title: "Parfums Boisés",
      subtitle: "Oud, vétiver, santal — l'essence du masculin.",
      cta: "Découvrir",
      href: "/category/parfums-fragrances",
      image: bannerPerfumes,
    },
    right: {
      eyebrow: "Iconique",
      title: "Solaires Aviator",
      subtitle: "Les modèles cultes des plus grandes maisons.",
      cta: "Voir les lunettes",
      href: "/category/lunettes",
      image: bannerSunglasses,
    },
  },
  bottomBanner: {
    eyebrow: "Offre Limitée",
    title: "−25% sur l'horlogerie",
    subtitle: "Saisissez l'opportunité d'un garde-temps d'exception.",
    cta: "Profiter de l'offre",
    to: "/promotions",
    image: bannerWatches,
    align: "right",
  },
};

export const Route = createFileRoute("/homme")({
  head: () => ({
    meta: [
      { title: "Collection Homme — Soltani Signature" },
      { name: "description", content: "Univers Homme : montres, parfums, soins, lunettes et bijoux de luxe. Sélection signature pour l'homme exigeant." },
      { property: "og:title", content: "Collection Homme — Soltani Signature" },
      { property: "og:description", content: "Horlogerie, parfums et accessoires d'exception pour homme." },
    ],
  }),
  component: () => <LifestylePage config={config} />,
});
