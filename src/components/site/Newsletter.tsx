import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function Newsletter() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setOpen(true);
    setEmail("");
  };

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container-luxe">
        <div className="relative overflow-hidden border border-gold/30 rounded-sm p-10 md:p-16 text-center bg-gradient-to-br from-secondary to-card">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-destructive/10 blur-3xl" />
          <div className="relative">
            <Mail className="h-10 w-10 text-gold mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Rejoignez <span className="italic font-light text-gold">l'univers Soltani</span>
            </h2>
            <p className="text-foreground/70 max-w-xl mx-auto mb-8">
              Soyez parmi les premières à découvrir nos nouveautés et bénéficiez de -10 % de bienvenue.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full sm:flex-1 h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition rounded-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto h-12 px-6 bg-gold text-ink text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-ink hover:text-gold transition rounded-sm"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-center border-gold/30 bg-gradient-to-br from-secondary to-card rounded-sm">
          <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <CheckCircle2 className="h-9 w-9 text-gold" />
          </div>
          <DialogHeader className="mt-2 space-y-3 text-center sm:text-center">
            <DialogTitle className="font-display text-2xl md:text-3xl font-light text-center">
              Merci pour votre <span className="italic text-gold">inscription</span>
            </DialogTitle>
            <DialogDescription className="text-foreground/70 text-center">
              Bienvenue dans l'univers Soltani. Votre code de bienvenue
              <span className="font-semibold text-gold"> -10% </span>
              vient de vous être envoyé par email.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setOpen(false)}
            className="mt-4 mx-auto h-11 px-8 bg-gold text-ink text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-ink hover:text-gold transition rounded-sm"
          >
            Continuer
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
