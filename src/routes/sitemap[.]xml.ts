import { createFileRoute } from "@tanstack/react-router";
import { getCatalogProducts } from "@/lib/catalog-api";
import { fallbackCategoryTree, loadCategoryTree } from "@/lib/categories-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";
import { collectSitemapUrls, sitemapXml } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [categories, products, brands] = await Promise.all([
          loadCategoryTree().catch(() => fallbackCategoryTree()),
          getCatalogProducts().catch(() => []),
          getActiveFeaturedBrands().catch(() => []),
        ]);

        return new Response(sitemapXml(collectSitemapUrls(categories, products, brands)), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
