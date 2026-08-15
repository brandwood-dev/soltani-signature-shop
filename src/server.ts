import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const API_PATH_PREFIX = "/api/v1";

let serverEntryPromise: Promise<ServerEntry> | undefined;

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
  if (!env || typeof env !== "object" || !("API_ORIGIN" in env)) return undefined;
  const value = (env as Record<string, unknown>).API_ORIGIN;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function proxyApiRequest(request: Request, apiOrigin: string) {
  const incomingUrl = new URL(request.url);
  const targetOrigin = new URL(apiOrigin);
  incomingUrl.protocol = targetOrigin.protocol;
  incomingUrl.host = targetOrigin.host;

  const proxyRequest = new Request(incomingUrl, request);
  proxyRequest.headers.set("x-forwarded-host", new URL(request.url).host);
  return fetch(proxyRequest);
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
        return await proxyApiRequest(request, apiOrigin);
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
