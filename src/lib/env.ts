function requiredPublicEnv(name: string) {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing public environment variable: ${name}`);
  }

  return value;
}

export const publicEnv = {
  supabaseUrl: requiredPublicEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: requiredPublicEnv("VITE_SUPABASE_ANON_KEY"),
  apiUrl: requiredPublicEnv("VITE_API_URL").replace(/\/$/, ""),
};
