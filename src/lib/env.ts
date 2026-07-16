const publicEnvFallbacks = {
  VITE_SUPABASE_URL: "https://etzqtyrkbekvgzfrzgjr.supabase.co",
  VITE_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0enF0eXJrYmVrdmd6ZnJ6Z2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjg2MjgsImV4cCI6MjA5ODk0NDYyOH0.zuy7-fRQlfn7iYtyFoNA7MEyQJeed8o7Fqx71fsOPso",
  VITE_API_URL: "https://soltani-signature-api-brandwood-co.vercel.app/api/v1",
  VITE_META_PIXEL_ID: "2017963328859874",
} as const;

function requiredPublicEnv(name: keyof typeof publicEnvFallbacks) {
  const value = import.meta.env[name] || publicEnvFallbacks[name];
  if (!value) {
    console.error(`[Config] Missing public environment variable: ${name}`);
    throw new Error("Configuration momentanément indisponible. Réessayez plus tard.");
  }

  return value;
}

function normalizeApiUrl(value: string) {
  return value
    .replace("https://soltani-signature-api.vercel.app", "https://soltani-signature-api-brandwood-co.vercel.app")
    .replace(/\/$/, "");
}

export const publicEnv = {
  supabaseUrl: requiredPublicEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: requiredPublicEnv("VITE_SUPABASE_ANON_KEY"),
  apiUrl: normalizeApiUrl(requiredPublicEnv("VITE_API_URL")),
  metaPixelId: requiredPublicEnv("VITE_META_PIXEL_ID"),
};
