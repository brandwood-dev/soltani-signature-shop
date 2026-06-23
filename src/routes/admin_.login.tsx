import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Connexion Admin — Soltani Signature" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "Accès réservé à l'administration Soltani Signature." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        (remember ? localStorage : sessionStorage).setItem("soltani-admin-auth", "1");
      } catch {}
      setLoading(false);
      navigate({ to: "/admin" });
    }, 700);
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-secondary/40 via-background to-secondary/30 flex items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, var(--gold) 0, transparent 35%), radial-gradient(circle at 85% 85%, var(--gold) 0, transparent 35%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour au site
        </Link>

        <div className="bg-card border border-border rounded-sm shadow-luxe p-6 sm:p-10">
          <div className="flex flex-col items-center text-center mb-7">
            <Logo height={44} />
            <div className="flex items-center gap-3 mt-5 mb-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Espace Admin
              </span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Connexion au Backoffice
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Accès strictement réservé au personnel autorisé.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                Email administrateur
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input
                  id="admin-email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="admin@soltani-signature.com"
                  className="input-luxe pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-pwd"
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setError("Contactez le super-administrateur pour réinitialiser votre mot de passe.")}
                  className="text-[11px] text-gold hover:underline"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
                <input
                  id="admin-pwd"
                  required
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-luxe pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border accent-[var(--gold)]"
              />
              Rester connecté sur cet appareil
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gradient-gold text-ink font-semibold text-sm uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? "Vérification…" : "Accéder au Backoffice"}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-sm bg-secondary/40 border border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
            <p>
              Toutes les tentatives de connexion sont journalisées. Les accès non autorisés sont
              passibles de poursuites.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          © {new Date().getFullYear()} Soltani Signature — Backoffice v1.0
        </p>
      </div>
    </main>
  );
}
