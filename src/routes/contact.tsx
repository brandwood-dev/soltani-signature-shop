import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { sendContactMessage } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => {
    const url = "https://soltanisignature.com/contact";
    const title = "Contact & Showroom — Soltani Signature";
    const description = "Contactez notre équipe ou visitez notre showroom Soltani Signature à Tunis : parfums, montres et maroquinerie de luxe. Ouvert du lundi au samedi de 9h à 19h.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Soltani Signature",
            image: "https://soltanisignature.com/favicon.ico",
            url: "https://soltanisignature.com",
            telephone: "+216-71-000-000",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Avenue Habib Bourguiba",
              addressLocality: "Tunis",
              postalCode: "1000",
              addressCountry: "TN",
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                opens: "09:00",
                closes: "19:00",
              },
            ],
          }),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const validationError = validateContactForm(form);
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await sendContactMessage({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizeTunisianPhone(form.phone),
        subject: form.subject.trim(),
        message: form.message.trim() || undefined,
      });
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
      setStatus({ type: "success", message: "Votre message a bien été envoyé. Notre équipe vous répondra rapidement." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Impossible d'envoyer votre message pour le moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="Restons en contact" title="Parlons de vos envies" subtitle="Notre équipe vous répond sous 24 heures." />

      <section className="container-luxe py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {[{ I: MapPin, t: "Showroom Tunis", d: "Avenue Habib Bourguiba, Tunis 1000" },
            { I: Phone, t: "Téléphone", d: "+216 71 000 000" },
            { I: MessageCircle, t: "WhatsApp", d: "+216 99 000 000" },
            { I: Mail, t: "Email", d: "contact@soltanisignature.com" },
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

        <form onSubmit={submit} className="bg-card border border-border rounded-sm p-8 space-y-5">
          <h2 className="font-display text-2xl font-bold mb-2">Écrivez-nous</h2>
          {status && (
            <div
              className={`rounded-sm border p-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
              role="status"
            >
              {status.message}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Prénom">
              <input className="input-luxe" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required maxLength={60} autoComplete="given-name" />
            </Field>
            <Field label="Nom">
              <input className="input-luxe" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required maxLength={60} autoComplete="family-name" />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className="input-luxe" value={form.email} onChange={(event) => updateField("email", event.target.value)} required maxLength={120} autoComplete="email" />
          </Field>
          <Field label="Téléphone">
            <input type="tel" className="input-luxe" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required maxLength={20} autoComplete="tel" placeholder="+216 00 000 000" />
          </Field>
          <Field label="Sujet">
            <input className="input-luxe" value={form.subject} onChange={(event) => updateField("subject", event.target.value)} required maxLength={120} />
          </Field>
          <Field label="Message">
            <textarea rows={5} className="input-luxe resize-none" value={form.message} onChange={(event) => updateField("message", event.target.value)} maxLength={2000} />
          </Field>
          <button disabled={submitting} className="w-full h-12 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Envoi en cours..." : "Envoyer mon message"}
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

function validateContactForm(form: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
}) {
  if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.subject.trim()) {
    return "Merci de compléter les champs obligatoires.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Merci de saisir une adresse email valide.";
  }
  if (!/^(?:\+216)?[24579]\d{7}$/.test(normalizeTunisianPhone(form.phone))) {
    return "Merci de saisir un numéro tunisien valide.";
  }
  return "";
}

function normalizeTunisianPhone(value: string) {
  const compact = value.replace(/[\s().-]/g, "").replace(/^00216/, "+216");
  return compact.startsWith("216") ? `+${compact}` : compact;
}
