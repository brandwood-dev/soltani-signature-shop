import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard, type Product } from "./ProductCard";

type Props = {
  eyebrow?: string;
  title: string;
  kicker?: string;
  items: Product[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function LifestyleSection({ eyebrow, title, kicker, items, ctaLabel = "Découvrir", ctaHref = "#" }: Props) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            {eyebrow && (
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-10 bg-gold" />
                <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
              </div>
            )}
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground tracking-tight">{title}</h2>
            {kicker && <p className="text-muted-foreground mt-3 max-w-lg">{kicker}</p>}
          </div>
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold hover:text-foreground transition underline-offset-4 hover:underline self-start md:self-auto"
          >
            {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DualBanner({
  left,
  right,
}: {
  left: { eyebrow?: string; title: string; subtitle: string; cta: string; href: string; image: string };
  right: { eyebrow?: string; title: string; subtitle: string; cta: string; href: string; image: string };
}) {
  return (
    <section className="bg-background">
      <div className="container-luxe grid md:grid-cols-2 gap-4 md:gap-6 py-12">
        {[left, right].map((b, i) => (
          <motion.a
            key={i}
            href={b.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="group relative block h-[320px] md:h-[420px] overflow-hidden rounded-sm"
          >
            <img
              src={b.image}
              alt={b.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
              {b.eyebrow && (
                <span className="inline-block w-fit px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-gold text-ink rounded-sm mb-4">
                  {b.eyebrow}
                </span>
              )}
              <h3 className="font-display text-2xl md:text-3xl font-light text-cream leading-tight mb-2">
                {b.title}
              </h3>
              <p className="text-cream/80 text-sm md:text-base mb-5 max-w-sm">{b.subtitle}</p>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                {b.cta} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
