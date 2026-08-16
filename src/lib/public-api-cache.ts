export type PublicApiCachePolicy = {
  freshSeconds: number;
  staleSeconds: number;
  tag: string;
};

const LONG_LIVED_CONTENT = [
  /^\/api\/v1\/catalog\/(categories|brands)\/?$/,
  /^\/api\/v1\/catalog\/categories\/[^/]+\/attributes\/?$/,
  /^\/api\/v1\/content\/(hero|top-banner|featured-brands|promo-banners|testimonials|settings)\/?$/,
];

const SHORT_LIVED_CATALOG = [
  /^\/api\/v1\/catalog\/products\/?$/,
  /^\/api\/v1\/catalog\/products\/[^/]+\/?$/,
];

export function publicApiCachePolicy(
  method: string,
  pathname: string,
  hasAuthorization: boolean,
): PublicApiCachePolicy | null {
  if (method !== "GET" || hasAuthorization) return null;

  if (LONG_LIVED_CONTENT.some((pattern) => pattern.test(pathname))) {
    return { freshSeconds: 300, staleSeconds: 86_400, tag: "public-content" };
  }

  if (SHORT_LIVED_CATALOG.some((pattern) => pattern.test(pathname))) {
    return { freshSeconds: 30, staleSeconds: 3_600, tag: "public-catalog" };
  }

  return null;
}

export function publicApiCacheKey(requestUrl: string, kind: "fresh" | "stale") {
  const url = new URL(requestUrl);
  url.searchParams.set("__soltani_edge_cache", kind);
  return new Request(url, { method: "GET" });
}
