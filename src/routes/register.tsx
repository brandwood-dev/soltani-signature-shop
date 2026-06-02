import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Phone, Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { GoogleIcon } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Inscription — Soltani Signature" },
      { name: "description", content: "Créez votre compte Soltani Signature." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accept, setAccept] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accept) return;
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
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Bienvenue</span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-sm text-muted-foreground mt-2">Rejoignez le Cercle Signature.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={User} label="Nom complet" type="text" placeholder="Mohamed Soltani" />
            <Field icon={Mail} label="Email" type="email" placeholder="vous@exemple.com" />
            <Field icon={Phone} label="Téléphone" type="tel" placeholder="+216 …" />
            <Field icon={Lock} label="Mot de passe" type="password" placeholder="••••••••" />
            <Field icon={Lock} label="Confirmer le mot de passe" type="password" placeholder="••••••••" />

            <label className="flex items-start gap-3 cursor-pointer text-sm text-muted-foreground pt-1">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--gold)]"
              />
              <span>
                J'accepte les{" "}
                <Link to="/legal/$slug" params={{ slug: "cgv" }} className="text-gold hover:underline">conditions générales</Link>{" "}
                et la{" "}
                <Link to="/legal/$slug" params={{ slug: "confidentialite" }} className="text-gold hover:underline">politique de confidentialité</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !accept}
              className="w-full h-11 mt-2 bg-gradient-gold text-ink font-semibold text-sm uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button className="w-full h-11 border border-border bg-background hover:bg-secondary text-sm font-medium rounded-sm flex items-center justify-center gap-3 transition">
            <GoogleIcon /> S'inscrire avec Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-gold font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ icon: Icon, label, type, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <div className="relative mt-2">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
        <input required type={type} placeholder={placeholder} className="input-luxe pl-10" />
      </div>
    </div>
  );
}
