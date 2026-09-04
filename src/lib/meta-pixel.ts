import { publicEnv } from "@/lib/env";

type MetaPixelEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToWishlist"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

type MetaPixelParamValue = string | number | boolean | string[] | Array<Record<string, string | number>> | undefined;
type MetaPixelParams = Record<string, MetaPixelParamValue>;
type MetaPixelTrackOptions = { eventID?: string };

type MetaServerEvent = {
  eventName: MetaPixelEvent;
  eventId: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
};

declare global {
  interface Window {
    fbq?: ((action: "init" | "track", eventOrPixelId: string, params?: MetaPixelParams, options?: MetaPixelTrackOptions) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: Window["fbq"];
    };
    _fbq?: Window["fbq"];
    __soltaniMetaPixelLoaded?: boolean;
    __soltaniLastPageView?: string;
  }
}

const PIXEL_SCRIPT_ID = "meta-pixel-script";
const PIXEL_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function initMetaPixel() {
  if (!isBrowser() || window.__soltaniMetaPixelLoaded) return;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    } as NonNullable<Window["fbq"]>;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!document.getElementById(PIXEL_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = PIXEL_SCRIPT_SRC;
    document.head.appendChild(script);
  }

  window.fbq?.("init", publicEnv.metaPixelId);
  window.__soltaniMetaPixelLoaded = true;
}

export function trackMetaPixelEvent(event: MetaPixelEvent, params?: MetaPixelParams) {
  if (!isBrowser()) return;
  initMetaPixel();
  const eventId = createEventId();
  window.fbq?.("track", event, sanitizeParams(params), { eventID: eventId });
  void sendMetaServerEvent({
    eventName: event,
    eventId,
    eventSourceUrl: window.location.href,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    userAgent: navigator.userAgent,
    customData: sanitizeParams(params),
  });
}

export function trackPageView(path: string) {
  if (!isBrowser()) return;
  const pageKey = path || window.location.href;
  if (window.__soltaniLastPageView === pageKey) return;
  window.__soltaniLastPageView = pageKey;
  trackMetaPixelEvent("PageView");
}

function sanitizeParams(params?: MetaPixelParams) {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

function readCookie(name: string) {
  const value = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1];
  return value ? decodeURIComponent(value) : undefined;
}

async function sendMetaServerEvent(event: MetaServerEvent) {
  try {
    await fetch(`${publicEnv.apiUrl}/catalog/meta/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Browser Pixel remains the fallback when the server event cannot be queued.
  }
}
