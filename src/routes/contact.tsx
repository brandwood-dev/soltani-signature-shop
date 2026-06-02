import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Soltani Signature" },
      { name: "description", content: "Contactez notre équipe ou visitez notre showroom à Tunis." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Restons en contact" title="Parlons de vos envies" subtitle="Notre équipe vous répond sous 24 heures." />

      <section className="container-luxe py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {[{ I: MapPin, t: "Showroom Tunis", d: "Avenue Habib Bourguiba, Tunis 1000" },
            { I: Phone, t: "Téléphone", d: "+216 71 000 000" },
            { I: MessageCircle, t: "WhatsApp", d: "+216 99 000 000" },
            { I: Mail, t: "Email", d: "contact@soltani-signature.tn" },
            { I: Clock, t: "Horaires", d: "Lun-Sam · 9h-19h · Dim sur RDV" }].map(({ I, t, d }) => (
            <div key={t} className="flex items-start gap-4 p-5 bg-secondary/40 border border-border rounded-sm">
              <I className="h-5 w-5 text-gold shrink-0 mt-1" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gold mb-1">{t}</p>
                <p className="text-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="bg-card border border-border rounded-sm p-8 space-y-5">
          <h2 className="font-display text-2xl font-bold mb-2">Écrivez-nous</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Prénom"><input className="input-luxe" /></Field>
            <Field label="Nom"><input className="input-luxe" /></Field>
          </div>
          <Field label="Email"><input type="email" className="input-luxe" /></Field>
          <Field label="Sujet"><input className="input-luxe" /></Field>
          <Field label="Message"><textarea rows={5} className="input-luxe resize-none" /></Field>
          <button className="w-full h-12 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">
            Envoyer mon message
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-foreground/60 mb-2">{label}</span>
      {children}
    </label>
  );
}
