// ============================================================
// Schéma de filtres par catégorie / sous-catégorie
// Conforme au PDF "Filtres_-_Sheet1"
// ============================================================

export type FacetDef = {
  key: string;
  label: string;
  options: string[];
};

// Sous-catégorie → facettes spécifiques
export const FILTERS_BY_SUB: Record<string, FacetDef[]> = {
  // Parfums & Fragrances
  parfums: [
    { key: "contenance", label: "Contenance", options: ["30ml", "50ml", "75ml", "100ml", "200ml"] },
    { key: "famille_olfactive", label: "Famille olfactive", options: ["Floral", "Boisé", "Oriental", "Hespéridé", "Fougère", "Gourmand"] },
    { key: "concentration", label: "Concentration", options: ["Eau de Cologne", "Eau de Toilette", "Eau de Parfum", "Parfum"] },
    { key: "tenue", label: "Tenue", options: ["Légère", "Moyenne", "Longue", "Très longue"] },
    { key: "occasion", label: "Occasion", options: ["Jour", "Soir", "Bureau", "Cérémonie"] },
  ],
  "brumes-parfumees": [
    { key: "contenance", label: "Contenance", options: ["150ml", "200ml", "250ml"] },
    { key: "famille_olfactive", label: "Famille olfactive", options: ["Floral", "Fruité", "Gourmand", "Oriental"] },
    { key: "occasion", label: "Occasion", options: ["Jour", "Sport", "Plage", "Soir"] },
  ],
  "coffrets-parfum": [
    { key: "contenance", label: "Contenance", options: ["Découverte", "Voyage", "Standard", "Édition Limitée"] },
    { key: "famille_olfactive", label: "Famille olfactive", options: ["Floral", "Boisé", "Oriental", "Hespéridé"] },
    { key: "occasion", label: "Occasion", options: ["Cadeau", "Fête", "Cérémonie"] },
  ],

  // Maquillage
  teint: [
    { key: "type", label: "Type", options: ["Fond de teint", "BB crème", "Anti-cernes", "Poudre", "Base"] },
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "teinte", label: "Teinte", options: ["Très clair", "Clair", "Médium", "Doré", "Foncé"] },
    { key: "fini", label: "Fini", options: ["Mat", "Naturel", "Lumineux", "Satiné"] },
    { key: "effet", label: "Effet", options: ["Couvrant", "Léger", "Hydratant", "Anti-âge"] },
  ],
  yeux: [
    { key: "type", label: "Type", options: ["Mascara", "Eyeliner", "Fard à paupières", "Crayon khôl", "Palette"] },
    { key: "couleur", label: "Couleur", options: ["Noir", "Brun", "Or", "Bleu", "Bronze", "Nude"] },
    { key: "fini", label: "Fini", options: ["Mat", "Satiné", "Métallique", "Pailleté"] },
    { key: "effet", label: "Effet", options: ["Volume", "Longueur", "Précision", "Waterproof"] },
  ],
  levres: [
    { key: "type", label: "Type", options: ["Rouge à lèvres", "Gloss", "Crayon", "Baume teinté", "Encre"] },
    { key: "couleur", label: "Couleur", options: ["Rouge", "Nude", "Rose", "Bordeaux", "Corail", "Mauve"] },
    { key: "fini", label: "Fini", options: ["Mat", "Satiné", "Brillant", "Métallique"] },
    { key: "effet", label: "Effet", options: ["Hydratant", "Longue tenue", "Volume", "Repulpant"] },
  ],
  "accessoires-maquillage": [
    { key: "type", label: "Type", options: ["Pinceaux", "Éponges", "Recourbe-cils", "Trousses", "Miroirs"] },
  ],

  // Soins du Visage — facettes communes
  nettoyants: [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Démaquillage", "Purification", "Douceur", "Anti-imperfections"] },
    { key: "texture", label: "Texture", options: ["Gel", "Mousse", "Huile", "Eau micellaire", "Pâte"] },
    { key: "utilisation", label: "Utilisation", options: ["Quotidien", "Matin", "Soir"] },
  ],
  serums: [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Hydratation", "Anti-âge", "Éclat", "Anti-imperfections", "Anti-taches"] },
    { key: "ingredient", label: "Ingrédient actif", options: ["Acide hyaluronique", "Vitamine C", "Rétinol", "Niacinamide", "Peptides", "Collagène"] },
    { key: "texture", label: "Texture", options: ["Sérum", "Huile", "Gel"] },
    { key: "utilisation", label: "Utilisation", options: ["Jour", "Nuit", "Quotidien"] },
  ],
  "cremes-hydratantes": [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Hydratation", "Nutrition", "Anti-âge", "Éclat", "Apaisant"] },
    { key: "ingredient", label: "Ingrédient actif", options: ["Acide hyaluronique", "Aloe Vera", "Collagène", "Niacinamide", "Beurre de karité"] },
    { key: "texture", label: "Texture", options: ["Crème", "Gel", "Émulsion", "Baume"] },
    { key: "utilisation", label: "Utilisation", options: ["Jour", "Nuit", "Quotidien"] },
  ],
  masques: [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Hydratation", "Purification", "Éclat", "Exfoliation", "Repulpant"] },
    { key: "ingredient", label: "Ingrédient actif", options: ["Argile", "Vitamine C", "Acide hyaluronique", "Aloe Vera", "Charbon"] },
    { key: "texture", label: "Texture", options: ["Crème", "Tissu", "Argile", "Gel"] },
    { key: "utilisation", label: "Utilisation", options: ["Hebdomadaire", "Quotidien", "Nuit"] },
  ],
  "contour-yeux": [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Anti-cernes", "Anti-poches", "Anti-âge", "Hydratation", "Repulpant"] },
    { key: "ingredient", label: "Ingrédient actif", options: ["Caféine", "Rétinol", "Acide hyaluronique", "Peptides", "Vitamine C"] },
    { key: "texture", label: "Texture", options: ["Crème", "Sérum", "Gel", "Patchs"] },
    { key: "utilisation", label: "Utilisation", options: ["Jour", "Nuit", "Quotidien"] },
  ],

  // Cheveux
  shampoings: cheveuxFacets(),
  "apres-shampoings": cheveuxFacets(),
  "masques-capillaires": cheveuxFacets(),
  "huiles-serums": cheveuxFacets(),
  coiffage: cheveuxFacets(),

  // Protection Solaire
  "solaires-visage": [
    { key: "spf", label: "SPF", options: ["SPF30", "SPF50", "SPF50+"] },
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Grasse", "Sensible"] },
    { key: "texture", label: "Texture", options: ["Crème", "Fluide", "Stick", "Spray"] },
    { key: "fini", label: "Fini", options: ["Invisible", "Teinté", "Mat", "Lumineux"] },
    { key: "resistance", label: "Résistance", options: ["Eau", "Sable", "Sport"] },
  ],
  "solaires-corps": [
    { key: "spf", label: "SPF", options: ["SPF20", "SPF30", "SPF50", "SPF50+"] },
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Sensible", "Enfant"] },
    { key: "texture", label: "Texture", options: ["Lait", "Spray", "Brume", "Huile"] },
    { key: "resistance", label: "Résistance", options: ["Eau", "Sable", "Sport"] },
  ],
  "apres-soleil": [
    { key: "type_peau", label: "Type de peau", options: ["Sèche", "Normale", "Mixte", "Sensible"] },
    { key: "besoin", label: "Besoin", options: ["Apaisant", "Hydratant", "Réparateur", "Prolongateur de bronzage"] },
    { key: "texture", label: "Texture", options: ["Lait", "Gel", "Brume", "Sérum"] },
  ],

  // Mode & Style
  "sacs-a-main": [
    { key: "couleur", label: "Couleur", options: ["Noir", "Brun", "Beige", "Blanc", "Rouge", "Bleu", "Or"] },
    { key: "matiere", label: "Matière", options: ["Cuir lisse", "Cuir grainé", "Toile", "Daim", "Matelassé"] },
    { key: "style", label: "Style", options: ["Cabas", "Pochette", "Bandoulière", "Tote", "Crossbody", "Hobo"] },
    { key: "taille", label: "Taille", options: ["Mini", "Petit", "Moyen", "Grand"] },
  ],
  montres: [
    { key: "couleur", label: "Couleur", options: ["Noir", "Or", "Argent", "Or rose", "Bleu"] },
    { key: "matiere", label: "Matière", options: ["Acier", "Cuir", "Caoutchouc", "Or", "Titane"] },
    { key: "style", label: "Style", options: ["Classique", "Sport", "Chronographe", "Automatique", "Diamants"] },
    { key: "type", label: "Type", options: ["Homme", "Femme", "Unisexe"] },
  ],
  lunettes: [
    { key: "couleur", label: "Couleur", options: ["Noir", "Brun", "Or", "Argent", "Écaille"] },
    { key: "matiere", label: "Matière", options: ["Acétate", "Métal", "Titane"] },
    { key: "style", label: "Style", options: ["Aviator", "Wayfarer", "Carré", "Rond", "Cat-Eye", "Pilote"] },
    { key: "type", label: "Type", options: ["Solaire", "Vue"] },
  ],
  bijoux: [
    { key: "couleur", label: "Couleur", options: ["Or", "Or rose", "Argent", "Platine"] },
    { key: "matiere", label: "Matière", options: ["Or", "Argent", "Diamant", "Perle", "Pierre précieuse"] },
    { key: "style", label: "Style", options: ["Pendentif", "Bague", "Bracelet", "Boucles d'oreilles", "Collier", "Jonc"] },
    { key: "type", label: "Type", options: ["Femme", "Homme", "Unisexe"] },
  ],
};

function cheveuxFacets(): FacetDef[] {
  return [
    { key: "type_cheveux", label: "Type de cheveux", options: ["Secs", "Gras", "Normaux", "Colorés", "Bouclés", "Lisses", "Abîmés"] },
    { key: "besoin", label: "Besoin", options: ["Réparation", "Hydratation", "Volume", "Anti-pelliculaire", "Brillance", "Lissage"] },
    { key: "composition", label: "Composition", options: ["Naturel", "Sans sulfates", "Bio", "Kératine", "Argan"] },
    { key: "texture", label: "Texture", options: ["Liquide", "Crème", "Mousse", "Spray", "Huile"] },
    { key: "effet", label: "Effet", options: ["Brillance", "Volume", "Lissage", "Définition"] },
  ];
}

// ============================================================
// Union des facettes pour la vue parent (cat. parente)
// ============================================================
export function getFacetsForCategory(slug: string, subSlugs?: string[]): FacetDef[] {
  if (FILTERS_BY_SUB[slug]) return FILTERS_BY_SUB[slug];
  if (!subSlugs?.length) return [];
  const merged = new Map<string, FacetDef>();
  for (const ss of subSlugs) {
    for (const f of FILTERS_BY_SUB[ss] ?? []) {
      const existing = merged.get(f.key);
      if (!existing) {
        merged.set(f.key, { ...f, options: [...f.options] });
      } else {
        const set = new Set(existing.options);
        for (const o of f.options) set.add(o);
        existing.options = Array.from(set);
      }
    }
  }
  return Array.from(merged.values());
}

// ============================================================
// Attribution déterministe d'attributs à un produit
// ============================================================
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildProductAttributes(
  productSlug: string,
  subSlug: string,
  index: number,
): Record<string, string[]> {
  const facets = FILTERS_BY_SUB[subSlug];
  if (!facets) return {};
  const h = hash(productSlug);
  const attrs: Record<string, string[]> = {};
  facets.forEach((f, fIdx) => {
    if (!f.options.length) return;
    const pick = (h + index * 7 + fIdx * 13) % f.options.length;
    attrs[f.key] = [f.options[pick]];
  });
  return attrs;
}
