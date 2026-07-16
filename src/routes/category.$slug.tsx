import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { FilterableProductListing } from "@/components/site/FilterableProductListing";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { findCategory } from "@/data/catalog";
import {
  fallbackCategoryTree,
  findInCategoryTree,
  findParentInTree,
  loadCategoryTree,
  type CategoryTree,
} from "@/lib/categories-api";
import { toUserFriendlyErrorMessage } from "@/lib/error-messages";
import { breadcrumbJsonLd, canonicalLink, jsonLdScript, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const categoryTree = await loadCategoryTree().catch(() => fallbackCategoryTree());
    const category = findInCategoryTree(params.slug, categoryTree) ?? findCategory(params.slug);
    if (!category) throw notFound();
    return { category, categoryTree };
  },
  head: ({ params, loaderData }) => {
    const category = loaderData?.category ?? findCategory(params.slug);
    const title = category ? category.name : "Catégorie";
    const parent = category?.kind === "sub" ? category.parent : null;
    const path = `/category/${params.slug}`;

    return {
      meta: seoMeta({
        title: `${title} — Soltani Signature`,
        description: category
          ? `Découvrez notre sélection ${title.toLowerCase()} chez Soltani Signature : produits authentiques, livraison rapide en Tunisie et paiement à la livraison.`
          : "Explorez nos catégories beauté, parfums, soins, mode et lifestyle chez Soltani Signature.",
        path,
        image: category?.image,
      }),
      links: [canonicalLink(path)],
      scripts: [
        jsonLdScript(
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            ...(parent ? [{ name: parent.name, path: `/category/${parent.slug}` }] : []),
            { name: title, path },
          ]),
        ),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Catégorie introuvable</h1>
        <Link to="/" className="text-gold underline">
          Retour à l'accueil
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">
        {toUserFriendlyErrorMessage(error)}
      </div>
    </SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, categoryTree } = Route.useLoaderData() as {
    category: ReturnType<typeof findCategory> & object;
    categoryTree: CategoryTree[];
  };
  const isParent = category.kind === "parent";
  const parent = isParent
    ? findParentInTree(category.slug, categoryTree)
    : findParentInTree(category.parent.slug, categoryTree);
  const subcategories = isParent && parent ? parent.subs.map(({ slug, name }) => ({ slug, name })) : [];

  return (
    <SiteLayout>
      <PageHero
        eyebrow={isParent ? "Univers" : category.parent.name}
        title={category.name}
        subtitle="Une sélection rigoureuse."
      />

      <div className="container-luxe py-6 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link to="/" className="hover:text-gold">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        {!isParent && (
          <>
            <Link to="/category/$slug" params={{ slug: category.parent.slug }} className="hover:text-gold">
              {category.parent.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground">{category.name}</span>
      </div>

      {isParent && parent && (
        <div className="container-luxe pb-6">
          <div className="flex flex-wrap gap-2">
            {parent.subs.map((subcategory) => (
              <Link
                key={subcategory.slug}
                to="/category/$slug"
                params={{ slug: subcategory.slug }}
                className="px-4 h-9 inline-flex items-center text-xs uppercase tracking-[0.2em] border border-border text-foreground/70 hover:text-gold hover:border-gold transition rounded-sm"
              >
                {subcategory.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <FilterableProductListing
        categorySlug={category.slug}
        subcategories={subcategories}
        emptyMessage="Aucun produit à afficher pour le moment."
      />
    </SiteLayout>
  );
}
