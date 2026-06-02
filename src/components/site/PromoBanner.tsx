import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  cta: string;
  to: string;
  image: string;
  align?: "left" | "right";
};

export function PromoBanner({ eyebrow, title, subtitle, cta, to, image, align = "left" }: Props) {
  const LinkAny = Link as unknown as React.ComponentType<{ to: string; className?: string; children: React.ReactNode }>;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[360px] md:h-[440px]">
        <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div
          className={`absolute inset-0 ${
            align === "left"
              ? "bg-gradient-to-r from-ink/85 via-ink/60 to-ink/10"
              : "bg-gradient-to-l from-ink/85 via-ink/60 to-ink/10"
          }`}
        />
        <div className="container-luxe relative h-full flex items-center">
          <div className={`max-w-xl ${align === "right" ? "ml-auto text-right" : ""}`}>
            {eyebrow && (
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-gold text-ink rounded-sm mb-5">
                {eyebrow}
              </span>
            )}
            <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] text-cream">
              {title}
            </h2>
            <p className="mt-4 text-cream/80 text-lg md:text-xl italic font-light">{subtitle}</p>
            <LinkAny
              to={to}
              className="mt-8 inline-flex items-center gap-3 bg-cream text-ink px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-gold transition shadow-luxe rounded-sm"
            >
              {cta} <ArrowRight className="h-4 w-4" />
            </LinkAny>

          </div>
        </div>
      </div>
    </section>
  );
}
