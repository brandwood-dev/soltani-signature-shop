import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

type FooterLink = { label: string; to: string; params?: Record<string, string>; href?: string };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Montres", to: "/category/$slug", params: { slug: "montres" } },
      { label: "Lunettes", to: "/category/$slug", params: { slug: "lunettes" } },
      { label: "Parfums", to: "/category/$slug", params: { slug: "parfums" } },
      { label: "Sacs", to: "/category/$slug", params: { slug: "sacs" } },
      { label: "Bijoux", to: "/category/$slug", params: { slug: "bijoux" } },
      { label: "Cosmétiques", to: "/category/$slug", params: { slug: "cosmetiques" } },
    ],
  },
  {
    title: "Service Client",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Suivi de commande", to: "/legal/$slug", params: { slug: "suivi-commande" } },
      { label: "Livraison", to: "/legal/$slug", params: { slug: "livraison" } },
      { label: "Retours & échanges", to: "/legal/$slug", params: { slug: "retours-echanges" } },
      { label: "FAQ", to: "/legal/$slug", params: { slug: "faq" } },
      { label: "WhatsApp", to: "", href: "https://wa.me/21658997716" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Notre histoire", to: "/legal/$slug", params: { slug: "notre-histoire" } },
      { label: "Showroom Tunis", to: "/contact" },
      { label: "Authenticité", to: "/legal/$slug", params: { slug: "authenticite" } },
      { label: "Programme fidélité", to: "/legal/$slug", params: { slug: "fidelite" } },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "CGV", to: "/legal/$slug", params: { slug: "cgv" } },
  { label: "Confidentialité", to: "/legal/$slug", params: { slug: "confidentialite" } },
  { label: "Mentions légales", to: "/legal/$slug", params: { slug: "mentions" } },
];

function FLink({ link, className }: { link: FooterLink; className?: string }) {
  if (link.href) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to} params={link.params as never} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container-luxe py-20">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Logo footer height={52} className="mb-5" />
            <p className="text-foreground/70 max-w-sm leading-relaxed mb-6">
              Maison tunisienne de référence pour les montres, parfums et accessoires de luxe.
              Sélection authentique, service d'exception.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Réseau social" className="grid h-10 w-10 place-items-center border border-gold/40 text-gold hover:bg-gold hover:text-ink transition rounded-sm">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FLink link={l} className="text-sm text-foreground/75 hover:text-gold transition" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-border grid md:grid-cols-3 gap-6 items-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Soltani Signature. Tous droits réservés.</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {["VISA", "MASTERCARD", "AMEX", "PAYPAL", "D17", "3X"].map(p => (
              <span key={p} className="px-2.5 py-1 text-[10px] uppercase tracking-widest border border-border text-foreground/80 rounded-sm">{p}</span>
            ))}
          </div>
          <div className="flex md:justify-end gap-5 text-xs">
            {LEGAL.map((l) => (
              <FLink key={l.label} link={l} className="text-foreground/60 hover:text-gold transition" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
