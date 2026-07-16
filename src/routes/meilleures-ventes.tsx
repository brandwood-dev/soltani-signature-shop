import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { FilterableProductListing } from "@/components/site/FilterableProductListing";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/meilleures-ventes")({
  head: () => ({
    meta: seoMeta({
      title: "Meilleures Ventes — Soltani Signature",
      description:
        "Découvrez les meilleures ventes Soltani Signature : les pièces les plus plébiscitées par notre communauté.",
      path: "/meilleures-ventes",
    }),
    links: [canonicalLink("/meilleures-ventes")],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Meilleures Ventes", path: "/meilleures-ventes" },
        ]),
      ),
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Sélection signature"
        title="Meilleures Ventes"
        subtitle="Les pièces les plus plébiscitées par notre communauté."
      />

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Meilleures Ventes</span>
      </div>

      <FilterableProductListing
        bestSeller
        emptyMessage="Aucune meilleure vente à afficher pour le moment."
      />
    </SiteLayout>
  );
}
