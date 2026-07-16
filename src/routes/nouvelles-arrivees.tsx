import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { FilterableProductListing } from "@/components/site/FilterableProductListing";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/nouvelles-arrivees")({
  head: () => ({
    meta: seoMeta({
      title: "Nouvelles Arrivées — Soltani Signature",
      description:
        "Découvrez les dernières nouveautés Soltani Signature : les pièces fraîchement arrivées dans notre sélection.",
      path: "/nouvelles-arrivees",
    }),
    links: [canonicalLink("/nouvelles-arrivees")],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Nouvelles Arrivées", path: "/nouvelles-arrivees" },
        ]),
      ),
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Fraîchement arrivés"
        title="Nouvelles Arrivées"
        subtitle="Les dernières pièces à rejoindre notre sélection signature."
      />

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Nouvelles Arrivées</span>
      </div>

      <FilterableProductListing
        featured
        defaultSort="newest"
        emptyMessage="Aucune nouveauté à afficher pour le moment."
      />
    </SiteLayout>
  );
}
