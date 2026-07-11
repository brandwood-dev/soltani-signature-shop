import { createFileRoute } from "@tanstack/react-router";
import { LifestylePage, type LifestyleConfig } from "@/components/site/LifestylePage";
import hero from "@/assets/hero-2.jpg";

const config: LifestyleConfig = {
  page: "homme",
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
  bannerLayout: { fullAlign: "left", bottomAlign: "right" },
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
