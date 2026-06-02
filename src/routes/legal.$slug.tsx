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
    title: "Livraison",
    eyebrow: "Service client",
    sections: [
      { h: "Livraison Standard", p: "Offerte dès 300 DT d'achat. Délai 2 à 4 jours ouvrés partout en Tunisie. Tarif fixe : 8 DT en dessous du seuil." },
      { h: "Livraison Express 24h", p: "Disponible pour Tunis, Sfax, Sousse, Hammamet et Nabeul. Tarif : 25 DT. Commandez avant 14h pour une livraison le lendemain." },
      { h: "Retrait Showroom", p: "Retrait gratuit dans notre boutique Avenue Habib Bourguiba à Tunis sous 24h après confirmation de commande." },
      { h: "Suivi de colis", p: "Un email et un SMS contenant votre numéro de suivi vous sont envoyés dès l'expédition de votre colis." },
      { h: "Emballage Signature", p: "Chaque commande est expédiée dans notre coffret Signature noir et or, idéal pour offrir." },
      { h: "Livraison internationale", p: "Disponible sur demande pour le Maghreb et l'Europe. Contactez notre service client pour un devis personnalisé." },
    ],
  },
  "retours-echanges": {
    title: "Retours & Échanges",
    eyebrow: "Service client",
    sections: [
      { h: "Délai de rétractation", p: "Vous disposez de 14 jours à compter de la réception pour retourner un article qui ne vous conviendrait pas." },
      { h: "Conditions de retour", p: "L'article doit être neuf, non porté, dans son emballage d'origine avec toutes ses étiquettes, certificats et accessoires." },
      { h: "Procédure", p: "Envoyez-nous un email à retours@soltani-signature.tn ou contactez-nous via WhatsApp. Un coursier passera récupérer votre colis gratuitement." },
      { h: "Échanges", p: "Vous pouvez échanger votre article contre une autre référence ou une autre taille sous 14 jours, sans frais supplémentaires." },
      { h: "Remboursement", p: "Le remboursement s'effectue sous 7 jours ouvrés après réception et contrôle qualité du produit retourné, sur le moyen de paiement utilisé." },
      { h: "Articles non éligibles", p: "Pour des raisons d'hygiène, les parfums ouverts, cosmétiques utilisés et bijoux personnalisés ne sont ni repris ni échangés." },
    ],
  },
  "suivi-commande": {
    title: "Suivi de Commande",
    eyebrow: "Service client",
    sections: [
      { h: "Comment suivre ma commande ?", p: "Dès l'expédition, vous recevez un email avec votre numéro de suivi et un lien direct vers la page de tracking du transporteur." },
      { h: "Statuts de commande", p: "Commande reçue → En préparation → Expédiée → En livraison → Livrée. Vous êtes notifié à chaque étape par email et SMS." },
      { h: "Délais de traitement", p: "Les commandes passées avant 14h sont préparées le jour même. Au-delà, expédition sous 24h ouvrées." },
      { h: "Modification de commande", p: "Toute modification est possible dans l'heure qui suit la commande. Contactez-nous rapidement via WhatsApp au +216 58 997 716." },
      { h: "Colis non reçu ?", p: "Si vous n'avez pas reçu votre colis sous 5 jours ouvrés, contactez notre service client. Nous lançons immédiatement une enquête auprès du transporteur." },
    ],
  },
  faq: {
    title: "Questions Fréquentes",
    eyebrow: "Aide",
    sections: [
      { h: "Les produits sont-ils authentiques ?", p: "Oui, 100% authentiques avec garantie internationale de la marque. Chaque pièce est accompagnée de son certificat et de sa facture d'achat officielle." },
      { h: "Puis-je payer en plusieurs fois ?", p: "Oui, paiement en 3 fois sans frais par carte bancaire dès 500 DT d'achat." },
      { h: "Combien de temps pour la livraison ?", p: "2 à 4 jours ouvrés en standard, 24h en express pour Tunis et grandes villes." },
      { h: "Comment retourner un produit ?", p: "Contactez-nous sous 14 jours via WhatsApp ou email, nous organisons l'enlèvement gratuit à domicile." },
      { h: "Avez-vous un showroom ?", p: "Oui, notre showroom est situé Avenue Habib Bourguiba à Tunis, ouvert du lundi au samedi de 9h à 19h." },
      { h: "Proposez-vous l'emballage cadeau ?", p: "Oui, l'emballage cadeau Signature est offert sur simple demande au moment de la commande." },
      { h: "Comment bénéficier du programme fidélité ?", p: "L'inscription au Cercle Signature est automatique dès votre première commande. Vous cumulez des points convertibles en avantages." },
    ],
  },
  "notre-histoire": {
    title: "Notre Histoire",
    eyebrow: "À propos",
    sections: [
      { h: "Une passion familiale", p: "Fondée à Tunis, Soltani Signature est née de la passion d'une famille pour l'horlogerie fine, la parfumerie de prestige et l'art de vivre." },
      { h: "Une sélection exigeante", p: "Chaque pièce de notre catalogue est sélectionnée avec soin auprès des plus grandes maisons internationales, en partenariat direct avec les marques." },
      { h: "L'authenticité avant tout", p: "Nous ne proposons que des produits 100% authentiques, garantis par leurs maisons mères. La traçabilité est au cœur de notre engagement." },
      { h: "Un service d'exception", p: "Conciergerie privée, livraison sur-mesure, écrin Signature, conseils personnalisés : nous redéfinissons l'expérience du luxe en Tunisie." },
      { h: "Notre vision", p: "Devenir la référence du luxe authentique en Afrique du Nord, en alliant héritage tunisien et standards internationaux." },
    ],
  },
  authenticite: {
    title: "Garantie d'Authenticité",
    eyebrow: "Notre engagement",
    sections: [
      { h: "100% authentique, garanti", p: "Chaque produit vendu sur Soltani Signature est rigoureusement authentique. Nous travaillons exclusivement avec les fabricants ou leurs distributeurs officiels." },
      { h: "Garantie internationale", p: "Toutes nos montres et bijoux sont accompagnés de la garantie internationale de leur marque, valable dans le monde entier." },
      { h: "Certificats officiels", p: "Chaque pièce est livrée avec son certificat d'authenticité, sa facture officielle et l'emballage d'origine du fabricant." },
      { h: "Engagement de remboursement", p: "Si l'authenticité d'un produit était contestée, nous procéderions à un remboursement intégral immédiat, sans condition." },
      { h: "Contrôle qualité", p: "Chaque commande passe par un double contrôle qualité avant expédition : conformité, état et présentation." },
    ],
  },
  fidelite: {
    title: "Cercle Signature",
    eyebrow: "Programme fidélité",
    sections: [
      { h: "Une expérience privilégiée", p: "Le Cercle Signature est notre programme de fidélité réservé à nos clients. L'inscription est automatique et gratuite dès votre première commande." },
      { h: "Membre Argent", p: "Dès 1 000 DT cumulés : -5% sur toutes vos commandes, accès aux ventes privées et emballage cadeau offert." },
      { h: "Membre Or", p: "Dès 5 000 DT cumulés : -10% permanent, livraison express offerte, invitations exclusives et cadeau d'anniversaire." },
      { h: "Membre Platine", p: "Dès 15 000 DT cumulés : -15%, conciergerie dédiée, accès en avant-première aux nouveautés et expérience showroom privée." },
      { h: "Cumul de points", p: "1 DT dépensé = 1 point. Vos points sont convertibles en bons d'achat ou en cadeaux exclusifs de la maison." },
      { h: "Avantages annuels", p: "Cadeau d'anniversaire, offres flash réservées, accès prioritaire aux éditions limitées." },
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
          {page.sections.map((s: { h: string; p: string }) => (
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
