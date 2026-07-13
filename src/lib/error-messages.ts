const NETWORK_ERROR_MESSAGE = "Connexion momentanément indisponible. Réessayez dans quelques instants.";
const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Réessayez plus tard.";

const TECHNICAL_PATTERNS = [
  /supabase/i,
  /brevo/i,
  /vercel/i,
  /cloudflare/i,
  /cloudinary/i,
  /auth request failed/i,
  /failed to fetch/i,
  /networkerror/i,
  /load failed/i,
  /internal server error/i,
  /stack/i,
  /prisma/i,
  /jwt/i,
  /bearer token/i,
  /invalid access token/i,
  /unauthorized/i,
  /forbidden/i,
  /p20\d{2}/i,
  /api\/v\d+/i,
  /unexpected token/i,
  /fetch/i,
];

export function toUserFriendlyErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  const rawMessage = extractErrorMessage(error);
  return sanitizeErrorMessage(rawMessage, fallback);
}

export function mapHttpErrorMessage(message: string, status?: number) {
  return sanitizeErrorMessage(message, messageForStatus(status));
}

export function networkErrorMessage() {
  return NETWORK_ERROR_MESSAGE;
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function sanitizeErrorMessage(message: string, fallback = DEFAULT_ERROR_MESSAGE) {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (!normalized) return fallback;
  if (lower.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (lower.includes("email not confirmed")) return "Veuillez confirmer votre adresse email avant de vous connecter.";
  if (lower.includes("user already registered") || lower.includes("already exists")) return "Un compte existe déjà avec cet email.";
  if (lower.includes("invalid email") || lower.includes("email address is invalid")) return "Adresse email invalide.";
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short"))) return "Le mot de passe est trop faible.";
  if (lower.includes("blocked") || lower.includes("disabled") || lower.includes("bloqué")) return "Votre compte a été bloqué. Contactez le service client.";
  if (lower.includes("session") && (lower.includes("expired") || lower.includes("expir"))) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (lower.includes("timeout") || lower.includes("aborted") || lower.includes("connexion api momentan")) return NETWORK_ERROR_MESSAGE;

  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return fallback;
  }

  return normalized;
}

function messageForStatus(status?: number) {
  if (!status) return DEFAULT_ERROR_MESSAGE;
  if (status === 400) return "Les informations saisies sont invalides.";
  if (status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (status === 403) return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
  if (status === 404) return "L'élément demandé est introuvable.";
  if (status === 409) return "Cette action est impossible car une donnée existe déjà.";
  if (status === 422) return "Certaines informations sont invalides.";
  if (status === 429) return "Trop de tentatives. Réessayez dans quelques instants.";
  if (status >= 500) return DEFAULT_ERROR_MESSAGE;
  return DEFAULT_ERROR_MESSAGE;
}
