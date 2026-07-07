import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { getCurrentUser } from "@/lib/api";
import { signInWithPassword } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Soltani Signature" },
      { name: "description", content: "Connectez-vous à votre compte Soltani Signature." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      setError("");
      await signInWithPassword(email, password);
      await getCurrentUser();
      await navigate({ to: "/profile" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" className="input-luxe pl-10" />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mot de passe</label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type={showPwd ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="input-luxe pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold" aria-label="Afficher le mot de passe">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loading} className="w-full h-11 mt-2 bg-gradient-gold text-ink font-semibold text-sm uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition disabled:opacity-60">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Vous n'avez pas de compte ?{" "}
            <Link to="/register" className="text-gold font-medium hover:underline">
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
