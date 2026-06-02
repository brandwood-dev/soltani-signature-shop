import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        localStorage.setItem("soltani-auth", "1");
      } catch {}
      navigate({ to: "/profile" });
    }, 600);
  };

  return (
    <SiteLayout>
      <section className="relative min-h-[calc(100vh-5rem)] grid place-items-center py-16 px-5 bg-secondary/30">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, var(--gold) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--gold) 0, transparent 40%)" }} />
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
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email ou téléphone</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type="text" placeholder="vous@exemple.com" className="input-luxe pl-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mot de passe</label>
                <a href="#" className="text-[11px] text-gold hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input required type={showPwd ? "text" : "password"} placeholder="••••••••" className="input-luxe pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold" aria-label="Afficher le mot de passe">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gradient-gold text-ink font-semibold text-sm uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <button className="w-full h-11 border border-border bg-background hover:bg-secondary text-sm font-medium rounded-sm flex items-center justify-center gap-3 transition">
              <GoogleIcon /> Continuer avec Google
            </button>
            <button className="w-full h-11 border border-border bg-background hover:bg-secondary text-sm font-medium rounded-sm flex items-center justify-center gap-3 transition">
              <AppleIcon /> Continuer avec Apple
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Vous n'avez pas de compte ?{" "}
            <Link to="/register" className="text-gold font-medium hover:underline">S'inscrire</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19-7.9 19-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12.5 24 12.5c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-1.9 13.3-5l-6.1-5.2C29.1 34.7 26.7 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.1 5.2c-.4.4 6.6-4.8 6.6-14 0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}

export function AppleIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.466 2.23-1.224 3.01-.81.83-2.14 1.47-3.21 1.38-.13-1.11.4-2.27 1.16-3.04.85-.86 2.28-1.5 3.27-1.35zM20.5 17.13c-.56 1.29-.83 1.86-1.55 3-1.02 1.59-2.45 3.57-4.22 3.58-1.57.02-1.98-1.03-4.12-1.02-2.14.01-2.58 1.04-4.15 1.02-1.77-.01-3.13-1.8-4.15-3.39-2.84-4.43-3.14-9.62-1.39-12.4 1.24-1.97 3.2-3.13 5.04-3.13 1.87 0 3.05 1.03 4.6 1.03 1.51 0 2.43-1.03 4.6-1.03 1.64 0 3.39.9 4.62 2.45-4.06 2.22-3.4 8.02.72 9.89z"/></svg>
  );
}
