export type PublicApiCachePolicy = {
  freshSeconds: number;
  staleSeconds: number;
  tag: string;
};

export type CacheLookupResult<T> =
  | { status: "resolved"; value: T }
  | { status: "rejected"; error: unknown }
  | { status: "timeout" };

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

export async function settleCacheLookup<T>(
  lookup: Promise<T>,
  timeoutMs: number,
): Promise<CacheLookupResult<T>> {
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
  const settled = lookup.then<CacheLookupResult<T>, CacheLookupResult<T>>(
    (value) => ({ status: "resolved", value }),
    (error: unknown) => ({ status: "rejected", error }),
  );
  const timeout = new Promise<CacheLookupResult<T>>((resolve) => {
    timeoutId = globalThis.setTimeout(() => resolve({ status: "timeout" }), timeoutMs);
  });

  try {
    return await Promise.race([settled, timeout]);
  } finally {
    if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
  }
}
