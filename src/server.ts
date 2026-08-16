import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  publicApiCacheKey,
  publicApiCachePolicy,
  settleCacheLookup,
  type PublicApiCachePolicy,
} from "./lib/public-api-cache";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type CloudflareCacheStorage = CacheStorage & { default?: Cache };
type ExecutionContextWithWaitUntil = {
  waitUntil: (promise: Promise<unknown>) => void;
};

const API_PATH_PREFIX = "/api/v1";
const CACHE_LOOKUP_TIMEOUT_MS = 200;

let serverEntryPromise: Promise<ServerEntry> | undefined;
let apiCacheUnavailable = false;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function getApiOrigin(env: unknown) {
  if (env && typeof env === "object" && "API_ORIGIN" in env) {
    const value = (env as Record<string, unknown>).API_ORIGIN;
    if (typeof value === "string" && value.length > 0) return value;
  }

  const processValue = process.env.API_ORIGIN;
  return typeof processValue === "string" && processValue.length > 0 ? processValue : undefined;
}

function getDefaultCache() {
  return (globalThis.caches as CloudflareCacheStorage | undefined)?.default;
}

function hasWaitUntil(ctx: unknown): ctx is ExecutionContextWithWaitUntil {
  return Boolean(
    ctx &&
    typeof ctx === "object" &&
    "waitUntil" in ctx &&
    typeof (ctx as ExecutionContextWithWaitUntil).waitUntil === "function",
  );
}

async function scheduleBackground(ctx: unknown, promise: Promise<unknown>) {
  if (hasWaitUntil(ctx)) {
    ctx.waitUntil(promise);
    return;
  }
  await promise;
}

function toOriginRequest(request: Request, apiOrigin: string, anonymous: boolean) {
  const incomingUrl = new URL(request.url);
  const targetOrigin = new URL(apiOrigin);
  incomingUrl.protocol = targetOrigin.protocol;
  incomingUrl.host = targetOrigin.host;

  const proxyRequest = new Request(incomingUrl, request);
  proxyRequest.headers.set("x-forwarded-host", new URL(request.url).host);
  if (anonymous) {
    proxyRequest.headers.delete("authorization");
    proxyRequest.headers.delete("cookie");
  }
  return proxyRequest;
}

function isCacheableApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  return (
    response.status === 200 &&
    contentType.includes("application/json") &&
    !response.headers.has("set-cookie")
  );
}

function storedApiResponse(response: Response, seconds: number, tag: string) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${seconds}`);
  headers.set("Cache-Tag", tag);
  headers.delete("CDN-Cache-Control");
  headers.delete("Cloudflare-CDN-Cache-Control");
  headers.delete("Vercel-CDN-Cache-Control");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function clientApiResponse(response: Response, cacheStatus: "HIT" | "STALE" | "MISS" | "BYPASS") {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.set("X-Soltani-Edge-Cache", cacheStatus);
  headers.delete("CDN-Cache-Control");
  headers.delete("Cloudflare-CDN-Cache-Control");
  headers.delete("Vercel-CDN-Cache-Control");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function matchApiCache(cache: Cache, key: Request, path: string) {
  const result = await settleCacheLookup(cache.match(key), CACHE_LOOKUP_TIMEOUT_MS);
  if (result.status === "resolved") return result.value;

  apiCacheUnavailable = true;
  console.warn({
    event: "public_api_cache_bypassed",
    path,
    reason: result.status,
    message:
      result.status === "rejected" && result.error instanceof Error
        ? result.error.message
        : undefined,
  });
  return undefined;
}

async function persistApiResponse(
  cache: Cache,
  request: Request,
  response: Response,
  policy: PublicApiCachePolicy,
) {
  const fresh = storedApiResponse(response.clone(), policy.freshSeconds, policy.tag);
  const stale = storedApiResponse(
    response.clone(),
    policy.freshSeconds + policy.staleSeconds,
    policy.tag,
  );
  await Promise.all([
    cache.put(publicApiCacheKey(request.url, "fresh"), fresh),
    cache.put(publicApiCacheKey(request.url, "stale"), stale),
  ]);
}

async function refreshApiCache(
  cache: Cache,
  request: Request,
  apiOrigin: string,
  policy: PublicApiCachePolicy,
) {
  const response = await fetch(toOriginRequest(request, apiOrigin, true));
  if (isCacheableApiResponse(response)) {
    await persistApiResponse(cache, request, response, policy);
  }
}

async function proxyApiRequest(request: Request, apiOrigin: string, ctx: unknown) {
  const url = new URL(request.url);
  const policy = publicApiCachePolicy(
    request.method,
    url.pathname,
    request.headers.has("authorization"),
  );
  const cache = policy && !apiCacheUnavailable ? getDefaultCache() : undefined;

  if (!policy) {
    return fetch(toOriginRequest(request, apiOrigin, false));
  }
  if (!cache) {
    const response = await fetch(toOriginRequest(request, apiOrigin, true));
    return clientApiResponse(response, "BYPASS");
  }

  const fresh = await matchApiCache(cache, publicApiCacheKey(request.url, "fresh"), url.pathname);
  if (fresh) return clientApiResponse(fresh, "HIT");
  if (apiCacheUnavailable) {
    const response = await fetch(toOriginRequest(request, apiOrigin, true));
    return clientApiResponse(response, "BYPASS");
  }

  const stale = await matchApiCache(cache, publicApiCacheKey(request.url, "stale"), url.pathname);
  if (stale) {
    const refresh = refreshApiCache(cache, request, apiOrigin, policy).catch((error) => {
      console.warn({
        event: "public_api_cache_refresh_failed",
        path: url.pathname,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
    await scheduleBackground(ctx, refresh);
    return clientApiResponse(stale, "STALE");
  }
  if (apiCacheUnavailable) {
    const response = await fetch(toOriginRequest(request, apiOrigin, true));
    return clientApiResponse(response, "BYPASS");
  }

  const response = await fetch(toOriginRequest(request, apiOrigin, true));
  if (isCacheableApiResponse(response)) {
    await scheduleBackground(ctx, persistApiResponse(cache, request, response.clone(), policy));
  }
  return clientApiResponse(response, "MISS");
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const pathname = new URL(request.url).pathname;
      if (pathname === API_PATH_PREFIX || pathname.startsWith(`${API_PATH_PREFIX}/`)) {
        const apiOrigin = getApiOrigin(env);
        if (!apiOrigin) {
          return new Response("API temporairement indisponible", { status: 503 });
        }
        try {
          return await proxyApiRequest(request, apiOrigin, ctx);
        } catch (error) {
          console.error({
            event: "api_proxy_failed",
            path: pathname,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          return Response.json(
            { message: "API temporairement indisponible" },
            { status: 502, headers: { "Cache-Control": "private, no-store" } },
          );
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
