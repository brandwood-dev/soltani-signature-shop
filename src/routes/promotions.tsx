import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Flame } from "lucide-react";
import { useState } from "react";
import { FilterableProductListing } from "@/components/site/FilterableProductListing";
import { LimitedOfferCountdown } from "@/components/site/LimitedOfferCountdown";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { getActiveLimitedOffer, type PromoBanner } from "@/lib/promo-banners-api";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/promotions")({
  loader: async (): Promise<{ limitedOffer: PromoBanner | null }> => ({
    limitedOffer: await getActiveLimitedOffer().catch(() => null),
  }),
  head: () => ({
    meta: seoMeta({
      title: "Promotions — Soltani Signature",
      description:
        "Toutes les offres promotionnelles Soltani Signature : parfums, soins, maquillage, cheveux et lifestyle.",
      path: "/promotions",
    }),
    links: [canonicalLink("/promotions")],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Promotions", path: "/promotions" },
        ]),
      ),
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { limitedOffer } = Route.useLoaderData() as { limitedOffer: PromoBanner | null };
  const [offerExpired, setOfferExpired] = useState(false);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Offres exclusives"
        title="Promotions"
        subtitle="Une sélection rare de pièces signées à prix exceptionnels."
      />

      {limitedOffer?.endsAt && !offerExpired && (
        <div className="bg-ink text-cream py-5 border-y border-gold/20">
          <div className="container-luxe flex flex-wrap items-center justify-center gap-3 text-sm">
            <Flame className="h-4 w-4 text-destructive" />
            <span className="uppercase tracking-[0.2em] text-[11px] text-cream/70">Offres en cours —</span>
            <LimitedOfferCountdown
              endsAt={limitedOffer.endsAt}
              className="text-cream"
              onExpire={() => setOfferExpired(true)}
            />
          </div>
        </div>
      )}

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Promotions</span>
      </div>

      <FilterableProductListing
        promotion
        showDiscountFilter
        defaultSort="discount-desc"
        countLabel="offre"
        emptyMessage="Aucune promotion en cours. Restez connecté pour profiter de nos prochaines offres."
      />
    </SiteLayout>
  );
}
