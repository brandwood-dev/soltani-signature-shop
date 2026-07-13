import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

const PAGES: Record<string, { title: string; eyebrow: string; sections: { h: string; p: string }[] }> = {
  cgv: {
    title: "Conditions Générales de Vente",
    eyebrow: "Légal",
    sections: [
      { h: "Préambule", p: "Les présentes Conditions Générales de Vente régissent les ventes réalisées sur le site Soltani Signature. Toute commande passée sur notre site implique l'acceptation pleine et entière des présentes conditions." },
      { h: "Produits", p: "Les produits proposés sont décrits avec le plus grand soin. Nous nous efforçons de garantir que les photographies, les couleurs et les descriptions correspondent fidèlement aux produits commercialisés. Toutefois, de légères différences peuvent exister en raison des paramètres d'affichage des écrans." },
      { h: "Prix", p: "Les prix sont indiqués en dinars tunisiens (TND), toutes taxes comprises, sauf mention contraire. Les frais de livraison sont affichés avant la validation définitive de la commande." },
      { h: "Paiement", p: "Le paiement est effectué selon les moyens proposés sur le site. La commande est considérée comme confirmée dès la validation du paiement ou selon les modalités de règlement choisies." },
      { h: "Livraison", p: "Les délais de livraison sont donnés à titre indicatif et peuvent varier en fonction de la disponibilité des produits et de la destination de la commande." },
      { h: "Retours et remboursements", p: "La satisfaction de nos clients est une priorité. Le client peut demander le retour et le remboursement d'un produit dans les cas suivants : le produit reçu ne correspond pas à la description ou aux caractéristiques présentées sur le site ; le produit reçu est différent de celui commandé à la suite d'une erreur de préparation ou d'expédition ; le produit présente un défaut de fabrication constaté dès sa réception." },
      { h: "Délai et conditions de retour", p: "Toute demande de retour doit être adressée à notre service client dans un délai maximum de 4 jours suivant la réception de la commande, accompagnée de photos permettant de constater la non-conformité ou l'erreur. Le produit doit être retourné dans son état d'origine, non utilisé, avec son emballage d'origine et tous ses accessoires éventuels." },
      { h: "Traitement du retour", p: "Après vérification du produit retourné, Soltani Signature procédera, selon le choix du client et lorsque les conditions sont remplies, soit à l'échange du produit, soit au remboursement intégral du montant payé. Lorsque l'erreur est imputable à Soltani Signature, les frais de retour sont entièrement pris en charge par notre société." },
      { h: "Exclusions", p: "Les demandes de retour motivées uniquement par un changement d'avis, une erreur de commande du client ou une mauvaise utilisation du produit ne donnent pas lieu à un remboursement, sauf décision exceptionnelle de Soltani Signature." },
      { h: "Modification des CGV", p: "Soltani Signature se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment. Les conditions applicables sont celles en vigueur à la date de la commande." },
    ],
  },
  confidentialite: {
    title: "Politique de Confidentialité",
    eyebrow: "Vie privée",
    sections: [
      { h: "Notre engagement", p: "Chez Soltani Signature, nous accordons une importance particulière à la protection de vos données personnelles." },
      { h: "Utilisation des données", p: "Les informations collectées lors de votre navigation ou de vos commandes sont utilisées exclusivement pour : traiter vos commandes ; assurer leur livraison ; gérer votre compte client ; répondre à vos demandes ; améliorer nos services ; vous adresser des offres promotionnelles, uniquement avec votre accord." },
      { h: "Confidentialité", p: "Vos données personnelles sont traitées de manière strictement confidentielle et ne sont jamais vendues ou cédées à des tiers. Elles peuvent uniquement être transmises aux prestataires indispensables au traitement de votre commande (transporteurs, prestataires de paiement, etc.)." },
      { h: "Sécurité", p: "Nous mettons en œuvre des mesures de sécurité appropriées afin de protéger vos informations contre tout accès non autorisé, perte, modification ou divulgation." },
      { h: "Vos droits", p: "Conformément à la réglementation applicable, vous pouvez demander à tout moment l'accès, la rectification ou la suppression de vos données personnelles en contactant notre service client." },
    ],
  },
  mentions: {
    title: "Mentions Légales",
    eyebrow: "Informations",
    sections: [
      { h: "Éditeur du site", p: "Le présent site est édité par Soltani Signature, marque spécialisée dans la commercialisation de produits de beauté et de cosmétiques." },
      { h: "Propriété intellectuelle", p: "L'ensemble des contenus présents sur ce site, notamment les textes, photographies, logos, graphismes, vidéos et éléments visuels, est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction, diffusion, modification ou utilisation, totale ou partielle, sans autorisation préalable écrite est strictement interdite." },
      { h: "Responsabilité", p: "Nous nous efforçons de fournir des informations exactes et régulièrement mises à jour. Toutefois, Soltani Signature ne peut garantir l'absence totale d'erreurs ou d'omissions et ne saurait être tenue responsable des conséquences résultant de l'utilisation des informations publiées sur le site." },
      { h: "Loi applicable", p: "L'utilisation du site est soumise à la législation en vigueur. Tout litige relatif à son utilisation ou aux ventes réalisées sera traité conformément aux lois applicables." },
      { h: "Contact", p: "Pour toute question, demande d'information ou réclamation, vous pouvez contacter notre service client via les coordonnées figurant sur la page Contact du site." },
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
  head: ({ params, loaderData }) => {
    const page = loaderData?.page;
    const path = `/legal/${params.slug}`;
    return {
      meta: seoMeta({
        title: `${page?.title ?? "Informations l?gales"} ? Soltani Signature`,
        description: page?.sections?.[0]?.p?.slice(0, 155) ?? "Informations l?gales et service client Soltani Signature.",
        path,
      }),
      links: [canonicalLink(path)],
      scripts: params.slug === "faq" && page
        ? [jsonLdScript({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.sections.map((section) => ({
              "@type": "Question",
              name: section.h,
              acceptedAnswer: { "@type": "Answer", text: section.p },
            })),
          })]
        : [],
    };
  },
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
