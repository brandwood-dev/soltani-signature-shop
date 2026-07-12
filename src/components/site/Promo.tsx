import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { CountdownCells } from "./Countdown";
import type { PromoBanner } from "@/lib/promo-banners-api";

type Props = {
  banner: PromoBanner;
};

export function Promo({ banner }: Props) {
  const target = banner.endsAt ? new Date(banner.endsAt).getTime() : 0;
  const [expired, setExpired] = useState(() => !target || target <= Date.now());

  if (expired) return null;

  return (
    <section id="promos" className="relative py-14 md:py-20 overflow-hidden bg-background">
      <img
        src={banner.image}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-transparent" />
      <div className="container-luxe relative grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-destructive text-cream rounded-sm mb-6">
            Offre limitée
          </span>
          <h2 className="font-display text-5xl md:text-7xl font-medium leading-[0.95] text-foreground mb-6">
            {banner.title}
          </h2>
          <p className="text-muted-foreground max-w-lg mb-8 text-lg">{banner.subtitle}</p>
          <Link
            to={banner.ctaUrl}
            className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition shadow-gold rounded-sm"
          >
            {banner.ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CountdownCells target={target} onExpire={() => setExpired(true)} />
      </div>
    </section>
  );
}
