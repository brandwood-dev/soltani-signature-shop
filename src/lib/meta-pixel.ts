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
type MetaClientParamBuilder = {
  processAndCollectAllParams(url?: string | null): Promise<{
    _fbp?: string;
    _fbc?: string;
    _fbi?: string;
  }>;
  getFbc(): string;
  getFbp(): string;
};

export type MetaPixelEventOptions = {
  eventId?: string;
  sendToServer?: boolean;
};

export type MetaUserData = {
  em?: string[];
  ph?: string[];
  external_id?: string[];
};

export type MetaUserIdentifiers = {
  email?: string;
  phone?: string;
  externalId?: string;
  consent?: boolean;
  hashedUserData?: MetaUserData;
};

type MetaServerEvent = {
  eventName: MetaPixelEvent;
  eventId: string;
  eventSourceUrl?: string;
  referrerUrl?: string;
  fbp?: string;
  fbc?: string;
  userAgent?: string;
  userData?: MetaUserData;
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
    clientParamBuilder?: MetaClientParamBuilder;
  }
}

const PIXEL_SCRIPT_ID = "meta-pixel-script";
const PIXEL_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const META_PARAM_BUILDER_SOURCES = [
  "https://cdn.jsdelivr.net/npm/meta-capi-param-builder-clientjs@1.3.2/dist/clientParamBuilder.bundle.js",
  "https://unpkg.com/meta-capi-param-builder-clientjs@1.3.2/dist/clientParamBuilder.bundle.js",
];
const META_ENHANCED_MATCHING_CONSENT_KEY = "soltani-meta-enhanced-matching-consent";
const META_USER_DATA_KEY = "soltani-meta-user-data";
const META_GUEST_EXTERNAL_ID_KEY = "soltani-meta-guest-external-id";
const META_EXTERNAL_ID_MAX_LENGTH = 128;
let metaParamBuilderPromise: Promise<MetaClientParamBuilder | undefined> | undefined;
let metaParameterCollectionPromise: Promise<MetaEventContext> | undefined;

export type MetaEventContext = {
  fbp?: string;
  fbc?: string;
  referrerUrl?: string;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function initMetaPixel() {
  if (!isBrowser()) return;

  void collectMetaParameters();

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

  const hasPixelScript = Array.from(document.scripts).some((script) => script.src === PIXEL_SCRIPT_SRC);
  if (!document.getElementById(PIXEL_SCRIPT_ID) && !hasPixelScript) {
    const script = document.createElement("script");
    script.id = PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = PIXEL_SCRIPT_SRC;
    document.head.appendChild(script);
  }

  if (!window.__soltaniMetaPixelLoaded) {
    window.fbq?.("init", publicEnv.metaPixelId);
    window.__soltaniMetaPixelLoaded = true;
  }
}

export function readMetaEnhancedMatchingConsent() {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(META_ENHANCED_MATCHING_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function setMetaEnhancedMatchingConsent(accepted: boolean) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(META_ENHANCED_MATCHING_CONSENT_KEY, accepted ? "accepted" : "refused");
  } catch {
    // Privacy preferences remain opt-in when storage is unavailable.
  }
  if (!accepted) {
    clearStoredMetaUserData();
    clearMetaGuestExternalId();
  }
}

export function normalizeMetaExternalId(value?: string) {
  const normalized = value?.trim();
  const hasControlCharacter = normalized?.split("").some((character) => {
    const code = character.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });
  if (!normalized || normalized.length > META_EXTERNAL_ID_MAX_LENGTH || hasControlCharacter) {
    return undefined;
  }
  return normalized;
}

export function getMetaExternalId(authenticatedId?: string, consent = readMetaEnhancedMatchingConsent()) {
  if (!consent || !isBrowser()) return undefined;

  const normalizedAuthenticatedId = normalizeMetaExternalId(authenticatedId);
  if (normalizedAuthenticatedId) return normalizedAuthenticatedId;

  try {
    const stored = normalizeMetaExternalId(window.localStorage.getItem(META_GUEST_EXTERNAL_ID_KEY) ?? undefined);
    if (stored) return stored;

    const generated = `guest:${createEventId()}`;
    window.localStorage.setItem(META_GUEST_EXTERNAL_ID_KEY, generated);
    return generated;
  } catch {
    return undefined;
  }
}

export function clearMetaGuestExternalId() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(META_GUEST_EXTERNAL_ID_KEY);
  } catch {
    // The identifier is optional and must never block checkout.
  }
}

export function normalizeMetaEmail(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.includes("@") ? normalized : undefined;
}

export function normalizeMetaPhone(value?: string) {
  const digits = value?.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length === 8) return `216${digits}`;
  if (digits.startsWith("216") && digits.length === 11) return digits;
  return digits.length >= 8 && digits.length <= 15 ? digits : undefined;
}

export async function hashMetaIdentifiers(identifiers: MetaUserIdentifiers) {
  if (!isBrowser() || !globalThis.crypto?.subtle) return undefined;

  const values: Array<[keyof MetaUserData, string | undefined]> = [
    ["em", normalizeMetaEmail(identifiers.email)],
    ["ph", normalizeMetaPhone(identifiers.phone)],
    ["external_id", identifiers.externalId?.trim() || undefined],
  ];
  const hashedEntries = await Promise.all(
    values.flatMap(([key, value]) =>
      value ? [hashMetaValue(value).then((hash) => [key, hash] as const)] : [],
    ),
  );
  if (!hashedEntries.length) return undefined;

  const userData: MetaUserData = {};
  for (const [key, hash] of hashedEntries) userData[key] = [hash];
  return userData;
}

export function storeMetaUserData(userData: MetaUserData) {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(META_USER_DATA_KEY, JSON.stringify(sanitizeMetaUserData(userData)));
  } catch {
    // Enhanced matching is optional and must never block checkout.
  }
}

export function readStoredMetaUserData() {
  if (!isBrowser()) return undefined;
  try {
    const raw = window.sessionStorage.getItem(META_USER_DATA_KEY);
    if (!raw) return undefined;
    return sanitizeMetaUserData(JSON.parse(raw) as MetaUserData);
  } catch {
    return undefined;
  }
}

export function clearStoredMetaUserData() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(META_USER_DATA_KEY);
  } catch {
    // Nothing to clear when session storage is unavailable.
  }
}

export function trackMetaPixelEvent(
  event: MetaPixelEvent,
  params?: MetaPixelParams,
  identifiers?: MetaUserIdentifiers,
  options: MetaPixelEventOptions = {},
) {
  if (!isBrowser()) return;
  initMetaPixel();
  const eventId = options.eventId ?? createEventId();
  const sanitizedParams = sanitizeMetaPixelParams(params);
  const pixelOptions: MetaPixelTrackOptions = { eventID: eventId };

  if (event === "PageView") {
    window.fbq?.("track", event, {}, pixelOptions);
  } else if (sanitizedParams) {
    window.fbq?.("track", event, sanitizedParams, pixelOptions);
  } else {
    window.fbq?.("track", event, {}, pixelOptions);
  }
  if (options.sendToServer !== false) {
    const consent = identifiers?.consent ?? readMetaEnhancedMatchingConsent();
    const serverIdentifiers = consent
      ? {
          ...identifiers,
          consent: true,
          externalId: getMetaExternalId(identifiers?.externalId, true),
        }
      : identifiers;
    void sendMetaServerEvent({
      eventName: event,
      eventId,
      eventSourceUrl: window.location.href,
      userAgent: navigator.userAgent,
      identifiers: serverIdentifiers,
      customData: sanitizedParams,
    });
  }
}

export function getMetaPurchaseEventId(orderReference: string) {
  return `purchase:${orderReference.trim()}`;
}

export function trackPageView(path: string) {
  if (!isBrowser()) return;
  const pageKey = path || window.location.href;
  if (window.__soltaniLastPageView === pageKey) return;
  window.__soltaniLastPageView = pageKey;
  trackMetaPixelEvent("PageView");
}

export function sanitizeMetaPixelParams(params?: MetaPixelParams) {
  if (!params) return undefined;
  const sanitized: MetaPixelParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (!hasValidNumericValues(value)) continue;
    if (key === "currency") {
      if (typeof value !== "string" || value.trim().toUpperCase() !== "TND") continue;
      sanitized[key] = "TND";
      continue;
    }
    sanitized[key] = value;
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function hasValidNumericValues(value: MetaPixelParamValue) {
  if (typeof value === "number") return Number.isFinite(value);
  if (!Array.isArray(value)) return true;
  return value.every((item) => {
    if (typeof item === "string") return true;
    return Object.values(item).every((nestedValue) =>
      typeof nestedValue !== "number" || Number.isFinite(nestedValue),
    );
  });
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

async function hashMetaValue(value: string) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sanitizeMetaUserData(userData?: MetaUserData) {
  if (!userData) return undefined;
  const sanitized: MetaUserData = {};
  for (const key of ["em", "ph", "external_id"] as const) {
    const values = userData[key];
    if (!values?.length) continue;
    const validValues = values.filter((value) => /^[a-f0-9]{64}$/.test(value)).slice(0, 3);
    if (validValues.length) sanitized[key] = validValues;
  }
  return Object.keys(sanitized).length ? sanitized : undefined;
}

function readCookie(name: string) {
  const item = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));
  if (!item) return undefined;
  const value = item.slice(name.length + 1);
  try {
    return decodeURIComponent(value) || undefined;
  } catch {
    return undefined;
  }
}

export function getMetaEventContext() {
  return collectMetaParameters();
}

function readMetaFbc() {
  const stored = readCookie("_fbc");
  if (stored) return stored;

  const fbclid = new URLSearchParams(window.location.search).get("fbclid")?.trim();
  if (!fbclid || fbclid.length > 512 || /\s/.test(fbclid)) return undefined;

  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  document.cookie = `_fbc=${encodeURIComponent(fbc)}; Max-Age=7776000; Path=/; SameSite=Lax`;
  return fbc;
}

async function sendMetaServerEvent(event: MetaServerEvent & { identifiers?: MetaUserIdentifiers }) {
  try {
    const { identifiers, ...serverEvent } = event;
    const collected = await collectMetaParameters();
    const userData = await buildMetaUserData(identifiers);
    await fetch(`${publicEnv.apiUrl}/catalog/meta/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...serverEvent,
        fbp: collected.fbp,
        fbc: collected.fbc,
        referrerUrl: collected.referrerUrl,
        userData,
      }),
      keepalive: true,
    });
  } catch {
    // Browser Pixel remains the fallback when the server event cannot be queued.
  }
}

async function collectMetaParameters(): Promise<MetaEventContext> {
  if (!isBrowser()) return {};
  if (!metaParameterCollectionPromise) {
    metaParameterCollectionPromise = (async () => {
      const fallback: MetaEventContext = {
        fbp: readCookie("_fbp"),
        fbc: readMetaFbc(),
        referrerUrl: document.referrer.trim() || undefined,
      };
      const builder = await loadMetaParamBuilder();
      if (!builder) return fallback;

      try {
        const collected = await builder.processAndCollectAllParams(window.location.href);
        return {
          fbp: collected._fbp || builder.getFbp() || fallback.fbp,
          fbc: collected._fbc || builder.getFbc() || fallback.fbc,
          referrerUrl: fallback.referrerUrl,
        };
      } catch {
        return fallback;
      }
    })();
  }
  return metaParameterCollectionPromise;
}

async function loadMetaParamBuilder() {
  if (!isBrowser()) return undefined;
  if (window.clientParamBuilder) return window.clientParamBuilder;
  if (!metaParamBuilderPromise) {
    metaParamBuilderPromise = new Promise((resolve) => {
      let sourceIndex = 0;
      const loadNextSource = () => {
        if (window.clientParamBuilder) {
          resolve(window.clientParamBuilder);
          return;
        }
        const source = META_PARAM_BUILDER_SOURCES[sourceIndex++];
        if (!source) {
          resolve(undefined);
          return;
        }
        const script = document.createElement("script");
        script.async = true;
        script.src = source;
        script.dataset.soltaniMetaParamBuilder = "true";
        script.onload = () => resolve(window.clientParamBuilder);
        script.onerror = loadNextSource;
        document.head.appendChild(script);
      };
      loadNextSource();
    });
  }
  return metaParamBuilderPromise;
}

async function buildMetaUserData(identifiers?: MetaUserIdentifiers) {
  if (identifiers?.consent !== true) return undefined;
  return identifiers.hashedUserData
    ? sanitizeMetaUserData(identifiers.hashedUserData)
    : hashMetaIdentifiers(identifiers);
}
