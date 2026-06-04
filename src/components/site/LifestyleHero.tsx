import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  image: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function LifestyleHero({ eyebrow, title, titleAccent, subtitle, image, cta, secondaryCta }: Props) {
  return (
    <section className="relative h-[72vh] min-h-[520px] w-full overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </motion.div>

      <div className="container-luxe relative z-10 flex h-full items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold font-medium">{eyebrow}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1] mb-6">
            {title}
            {titleAccent && (
              <>
                <br />
                <span className="italic font-light text-gold">{titleAccent}</span>
              </>
            )}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            {cta && (
              <a
                href={cta.href}
                className="group inline-flex items-center gap-3 bg-gold text-ink px-7 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition shadow-gold rounded-sm"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-7 py-4 text-[12px] uppercase tracking-[0.25em] font-semibold hover:bg-foreground hover:text-background transition rounded-sm"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
