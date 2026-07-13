import type { Product } from "@/components/site/ProductCard";
import type { CategoryTree } from "@/lib/categories-api";
import type { FeaturedBrand } from "@/lib/featured-brands-api";

export const SITE_URL = "https://soltanisignature.com";
export const SITE_NAME = "Soltani Signature";
export const SITE_LOCALE = "fr_TN";
export const DEFAULT_SEO_TITLE = "Soltani Signature — Beauté, parfums & lifestyle en Tunisie";
export const DEFAULT_SEO_DESCRIPTION =
  "Boutique e-commerce beauté, parfums, soins, mode et lifestyle en Tunisie. Produits authentiques, livraison rapide et paiement à la livraison.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/web-app-manifest-512x512.png`;

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function seoMeta({
  title = DEFAULT_SEO_TITLE,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}: SeoInput = {}) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: SITE_LOCALE },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    ...(noindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
  ];
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: absoluteUrl(path) };
}

export function faviconLinks() {
  return [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/site.webmanifest" },
  ];
}

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/web-app-manifest-512x512.png`,
    sameAs: [
      "https://www.facebook.com/soltani.signature",
      "https://www.instagram.com/soltanisignature/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+216-58-997-716",
      contactType: "customer service",
      areaServed: "TN",
      availableLanguage: ["fr", "ar"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product, reviewSummary?: { total: number; averageRating: number }) {
  const availability = product.stockQuantity && product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.length ? product.gallery.map(absoluteUrl) : [absoluteUrl(product.image)],
    description: product.description ?? `${product.name} par ${product.brand}, disponible chez Soltani Signature.`,
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "TND",
      price: product.price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  if (reviewSummary?.total) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.averageRating,
      reviewCount: reviewSummary.total,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}

export function productReviewsJsonLd(product: Product, reviews: Array<{ rating: number; content: string; authorName: string; createdAt: string; title?: string | null }>) {
  return reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: product.name,
      url: absoluteUrl(`/product/${product.slug}`),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: review.authorName,
    },
    name: review.title ?? `Avis sur ${product.name}`,
    reviewBody: review.content,
    datePublished: review.createdAt,
  }));
}

export function sitemapXml(urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }>) {
  const entries = urls
    .map((url) => {
      const loc = escapeXml(absoluteUrl(url.loc));
      const lastmod = url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : "";
      const changefreq = url.changefreq ? `<changefreq>${escapeXml(url.changefreq)}</changefreq>` : "";
      const priority = url.priority ? `<priority>${escapeXml(url.priority)}</priority>` : "";
      return `<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}

export function collectSitemapUrls(categories: CategoryTree[], products: Product[], brands: FeaturedBrand[]) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/homme", changefreq: "weekly", priority: "0.8" },
    { loc: "/femme", changefreq: "weekly", priority: "0.8" },
    { loc: "/enfant", changefreq: "weekly", priority: "0.8" },
    { loc: "/maison", changefreq: "weekly", priority: "0.8" },
    { loc: "/bien-etre", changefreq: "weekly", priority: "0.8" },
    { loc: "/promotions", changefreq: "daily", priority: "0.8" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/legal/mentions-legales", changefreq: "yearly", priority: "0.3" },
    { loc: "/legal/confidentialite", changefreq: "yearly", priority: "0.3" },
    { loc: "/legal/conditions-generales", changefreq: "yearly", priority: "0.3" },
    ...categories.flatMap((category) => [
      { loc: `/category/${category.slug}`, changefreq: "weekly", priority: "0.7" },
      ...category.subs.map((sub) => ({ loc: `/category/${sub.slug}`, changefreq: "weekly", priority: "0.6" })),
    ]),
    ...products.map((product) => ({ loc: `/product/${product.slug}`, lastmod: today, changefreq: "weekly", priority: "0.7" })),
    ...brands.map((brand) => ({ loc: `/brand/${slugifyBrand(brand.name)}`, changefreq: "weekly", priority: "0.5" })),
  ];

  const seen = new Set<string>();
  return urls.filter((url) => {
    if (seen.has(url.loc)) return false;
    seen.add(url.loc);
    return true;
  });
}

function slugifyBrand(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
