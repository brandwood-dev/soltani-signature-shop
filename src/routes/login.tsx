import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { confirmPasswordReset, getCurrentUser, requestPasswordReset, verifyPasswordReset } from "@/lib/api";
import { signInWithPassword } from "@/lib/supabase";
import { canonicalLink, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: seoMeta({ title: "Connexion — Soltani Signature", description: "Connectez-vous à votre compte Soltani Signature.", path: "/login", noindex: true }),
    links: [canonicalLink("/login")],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      setError("");
      setSuccess("");
      await signInWithPassword(email, password);
      await getCurrentUser();
      await navigate({ to: "/profile", search: { tab: undefined } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  const openPasswordReset = () => {
    setResetOpen(true);
    setResetStep("email");
    setResetEmail(email);
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetMessage("");
    setSuccess("");
  };

  const validateStrongPassword = (value: string) =>
    value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);

  const onRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      if (!resetEmail.trim()) throw new Error("Adresse email obligatoire.");
      const response = await requestPasswordReset({ email: resetEmail.trim() });
      setResetMessage(response.message);
      setResetStep("code");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Impossible d’envoyer le code.");
    } finally {
      setResetLoading(false);
    }
  };

  const onResendResetCode = async () => {
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      const response = await requestPasswordReset({ email: resetEmail.trim() });
      setResetMessage(response.message);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Impossible de renvoyer le code.");
    } finally {
      setResetLoading(false);
    }
  };

  const onVerifyResetCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      if (!/^\d{6}$/.test(resetCode.trim())) throw new Error("Le code doit contenir 6 chiffres.");
      const response = await verifyPasswordReset({ email: resetEmail.trim(), code: resetCode.trim() });
      setResetMessage(response.message);
      setResetStep("password");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Code invalide ou expiré.");
    } finally {
      setResetLoading(false);
    }
  };

  const onConfirmReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      if (!validateStrongPassword(newPassword)) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
      }
      if (newPassword !== confirmPassword) throw new Error("Les mots de passe ne correspondent pas.");

      const response = await confirmPasswordReset({
        email: resetEmail.trim(),
        code: resetCode.trim(),
        password: newPassword,
        confirmPassword,
      });
      setResetOpen(false);
      setResetStep("email");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setEmail(resetEmail.trim());
      setSuccess(response.message);
      await navigate({ to: "/login" });
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Impossible de modifier le mot de passe.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative min-h-[calc(100vh-5rem)] grid place-items-center py-16 px-5 bg-secondary/30">
        <div className="relative w-full max-w-md bg-card border border-border rounded-sm shadow-luxe p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo height={48} />
            <div className="flex items-center gap-3 mt-6 mb-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Espace privé</span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Connexion à votre compte</h1>
            <p className="text-sm text-muted-foreground mt-2">Heureux de vous revoir.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" className="input-luxe input-luxe-icon-left" />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mot de passe</label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type={showPwd ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="input-luxe input-luxe-icon-both" />
                <button type="button" onClick={() => setShowPwd((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold" aria-label="Afficher le mot de passe">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" onClick={openPasswordReset} className="mt-2 text-xs text-gold hover:underline">
                Mot de passe oublié ?
              </button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <button type="submit" disabled={loading} className="w-full h-11 mt-2 bg-gradient-gold text-ink font-semibold text-sm uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition disabled:opacity-60">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          {resetOpen && (
            <div className="mt-6 border border-border bg-secondary/30 rounded-sm p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Réinitialisation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resetStep === "email" && "Recevez un code de sécurité par email."}
                    {resetStep === "code" && "Saisissez le code reçu par email."}
                    {resetStep === "password" && "Choisissez votre nouveau mot de passe."}
                  </p>
                </div>
                <button type="button" onClick={() => setResetOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
                  Fermer
                </button>
              </div>

              {resetStep === "email" && (
                <form onSubmit={onRequestReset} className="space-y-3">
                  <input required type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="vous@exemple.com" className="input-luxe" />
                  <button type="submit" disabled={resetLoading} className="w-full h-10 bg-foreground text-background text-xs uppercase tracking-[0.2em] rounded-sm disabled:opacity-60">
                    {resetLoading ? "Envoi..." : "Envoyer le code"}
                  </button>
                </form>
              )}

              {resetStep === "code" && (
                <form onSubmit={onVerifyResetCode} className="space-y-3">
                  <input required inputMode="numeric" value={resetCode} onChange={(event) => setResetCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Code à 6 chiffres" className="input-luxe text-center tracking-[0.4em]" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button type="button" disabled={resetLoading} onClick={onResendResetCode} className="h-10 border border-border text-xs uppercase tracking-[0.18em] rounded-sm disabled:opacity-60">
                      Renvoyer
                    </button>
                    <button type="submit" disabled={resetLoading} className="h-10 bg-foreground text-background text-xs uppercase tracking-[0.18em] rounded-sm disabled:opacity-60">
                      {resetLoading ? "Vérification..." : "Vérifier"}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === "password" && (
                <form onSubmit={onConfirmReset} className="space-y-3">
                  <div className="relative">
                    <input required type={showResetPwd ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nouveau mot de passe" className="input-luxe input-luxe-icon-right" />
                    <button type="button" onClick={() => setShowResetPwd((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold" aria-label="Afficher le nouveau mot de passe">
                      {showResetPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <input required type={showResetPwd ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirmer le mot de passe" className="input-luxe" />
                  <button type="submit" disabled={resetLoading} className="w-full h-10 bg-foreground text-background text-xs uppercase tracking-[0.2em] rounded-sm disabled:opacity-60">
                    {resetLoading ? "Modification..." : "Modifier le mot de passe"}
                  </button>
                </form>
              )}

              {resetMessage && <p className="text-sm text-emerald-700 mt-3">{resetMessage}</p>}
              {resetError && <p className="text-sm text-destructive mt-3">{resetError}</p>}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Vous n'avez pas de compte ?{" "}
            <Link to="/register" search={{ reason: undefined }} className="text-gold font-medium hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19-7.9 19-19.5 0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12.5 24 12.5c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-1.9 13.3-5l-6.1-5.2C29.1 34.7 26.7 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.1 5.2c-.4.4 6.6-4.8 6.6-14 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
