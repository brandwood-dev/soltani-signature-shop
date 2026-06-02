import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";

const PAGES: Record<string, { title: string; eyebrow: string; sections: { h: string; p: string }[] }> = {
  cgv: {
    title: "Conditions Générales de Vente",
    eyebrow: "Légal",
    sections: [
      { h: "1. Objet", p: "Les présentes CGV régissent les ventes conclues sur le site Soltani Signature entre la société et tout client particulier majeur." },
      { h: "2. Produits", p: "Les caractéristiques essentielles des produits sont décrites sur chaque fiche. Les photographies sont les plus fidèles possible mais ne sauraient engager la responsabilité de la maison." },
      { h: "3. Prix", p: "Les prix sont indiqués en Dinars Tunisiens TTC. La maison se réserve le droit de modifier ses prix à tout moment." },
      { h: "4. Commande", p: "Le client valide sa commande après vérification du panier et confirmation du paiement." },
      { h: "5. Paiement", p: "Le règlement s'effectue par carte bancaire, paiement mobile D17, paiement en 3 fois ou à la livraison." },
      { h: "6. Livraison", p: "Livraison dans toute la Tunisie sous 2 à 4 jours ouvrés. Livraison express 24h disponible." },
      { h: "7. Droit de rétractation", p: "Le client dispose de 14 jours pour retourner son produit, sous réserve qu'il soit dans son état d'origine." },
      { h: "8. Garantie", p: "Toutes nos pièces bénéficient de la garantie internationale de leur marque." },
    ],
  },
  confidentialite: {
    title: "Politique de Confidentialité",
    eyebrow: "Vie privée",
    sections: [
      { h: "Données collectées", p: "Nous collectons uniquement les informations nécessaires au traitement de votre commande : identité, coordonnées, adresse de livraison." },
      { h: "Utilisation", p: "Vos données servent à traiter vos commandes, vous informer et améliorer notre service. Aucune revente à des tiers." },
      { h: "Cookies", p: "Nous utilisons des cookies pour optimiser votre expérience. Vous pouvez les désactiver dans votre navigateur." },
      { h: "Vos droits", p: "Conformément à la loi, vous disposez d'un droit d'accès, de rectification et de suppression. Contactez-nous à privacy@soltani-signature.tn." },
    ],
  },
  mentions: {
    title: "Mentions Légales",
    eyebrow: "Informations",
    sections: [
      { h: "Éditeur", p: "Soltani Signature SARL — Capital 100 000 DT — Avenue Habib Bourguiba, 1000 Tunis." },
      { h: "Directeur de la publication", p: "M. Soltani — contact@soltani-signature.tn" },
      { h: "Hébergement", p: "Site hébergé sur infrastructure cloud sécurisée." },
      { h: "Propriété intellectuelle", p: "L'ensemble du contenu du site est protégé. Toute reproduction est interdite sans autorisation." },
    ],
  },
  livraison: {
    title: "Livraison & Retours",
    eyebrow: "Service client",
    sections: [
      { h: "Livraison Standard", p: "Offerte dès 300 DT d'achat. Délai 2-4 jours ouvrés partout en Tunisie." },
      { h: "Livraison Express", p: "Livraison en 24h pour Tunis et grandes villes. Tarif : 25 DT." },
      { h: "Retrait Showroom", p: "Retrait gratuit dans notre boutique à Tunis sous 24h." },
      { h: "Retours", p: "Vous disposez de 14 jours pour retourner votre produit. Le produit doit être neuf, dans son emballage d'origine." },
      { h: "Remboursement", p: "Le remboursement intervient sous 7 jours après réception et contrôle du produit retourné." },
    ],
  },
  faq: {
    title: "Questions Fréquentes",
    eyebrow: "Aide",
    sections: [
      { h: "Les produits sont-ils authentiques ?", p: "Oui, 100% authentiques avec garantie internationale de la marque." },
      { h: "Puis-je payer en plusieurs fois ?", p: "Oui, paiement en 3 fois sans frais par carte bancaire." },
      { h: "Combien de temps pour la livraison ?", p: "2 à 4 jours ouvrés en standard, 24h en express." },
      { h: "Comment retourner un produit ?", p: "Contactez-nous sous 14 jours, nous organisons l'enlèvement gratuit." },
      { h: "Avez-vous un showroom ?", p: "Oui, notre showroom est situé Avenue Habib Bourguiba à Tunis." },
    ],
  },
};

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.page.title ?? "Légal"} — Soltani Signature` }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHero title="Page introuvable" />
      <div className="container-luxe py-16 text-center">
        <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => (
    <SiteLayout>
      <PageHero title="Une erreur est survenue" />
      <div className="container-luxe py-16 text-center">
        <button onClick={reset} className="text-gold underline">Réessayer</button>
      </div>
    </SiteLayout>
  ),
  component: LegalPage,
});

function LegalPage() {
  const { page } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero eyebrow={page.eyebrow} title={page.title} />
      <article className="container-luxe py-16 max-w-3xl">
        <div className="space-y-10">
          {page.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-2xl font-bold mb-3 text-gold">{s.h}</h2>
              <p className="text-foreground/80 leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
