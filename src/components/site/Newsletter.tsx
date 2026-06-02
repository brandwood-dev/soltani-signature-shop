import { Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container-luxe">
        <div className="relative overflow-hidden border border-gold/30 rounded-sm p-10 md:p-16 text-center bg-gradient-to-br from-secondary to-card">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-destructive/10 blur-3xl" />
          <div className="relative">
            <Mail className="h-10 w-10 text-gold mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Rejoignez le <span className="italic font-light text-gold">Cercle Signature</span>
            </h2>
            <p className="text-foreground/70 max-w-xl mx-auto mb-8">
              Accès anticipé aux nouvelles collections, ventes privées exclusives et −10% sur votre première commande.
            </p>
            <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                className="flex-1 h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition rounded-sm"
              />
              <button className="h-12 px-6 bg-gold text-ink text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-ink hover:text-gold transition rounded-sm">
                S'inscrire
              </button>
            </form>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-6">
              Désinscription en 1 clic · Pas de spam, jamais
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
