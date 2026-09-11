const publicEnvFallbacks = {
  VITE_SUPABASE_URL: "https://vljwsbvdqpenhckchyts.supabase.co",
  VITE_SUPABASE_ANON_KEY:
    "sb_publishable_OfhVgAwbFCFn4gR5bRvLcA_CIXufMcq",
  VITE_API_URL: "https://soltani-signature-api.onrender.com/api/v1",
  VITE_META_PIXEL_ID: "2017963328859874",
} as const;

const DECOMMISSIONED_API_HOSTS = new Set(["soltani-signature-api.vercel.app"]);

function requiredPublicEnv(name: keyof typeof publicEnvFallbacks) {
  const value = import.meta.env[name] || publicEnvFallbacks[name];
  if (!value) {
    console.error(`[Config] Missing public environment variable: ${name}`);
    throw new Error("Configuration momentanément indisponible. Réessayez plus tard.");
  }

  return value;
}

export function resolvePublicApiUrl(value: string) {
  const normalized = value.replace(/\/$/, "");
  try {
    if (DECOMMISSIONED_API_HOSTS.has(new URL(normalized).hostname)) {
      return publicEnvFallbacks.VITE_API_URL;
    }
  } catch {
    // Let fetch surface malformed custom URLs with the standard network error handling.
  }
  return normalized;
}

export const publicEnv = {
  supabaseUrl: requiredPublicEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: requiredPublicEnv("VITE_SUPABASE_ANON_KEY"),
  apiUrl: resolvePublicApiUrl(requiredPublicEnv("VITE_API_URL")),
  metaPixelId: requiredPublicEnv("VITE_META_PIXEL_ID"),
};
