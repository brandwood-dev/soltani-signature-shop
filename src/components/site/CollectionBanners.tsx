import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import femmeImg from "@/assets/cat-cosmetics.jpg";
import hommeImg from "@/assets/cat-watches.jpg";
import enfantImg from "@/assets/hero-3.jpg";

type Card = {
  eyebrow: string;
  title: string;
  subtitle: string;
  to: string;
  image: string;
};

const CARDS: Card[] = [
  {
    eyebrow: "Pour Elle",
    title: "Collection Femme",
    subtitle: "Beauté, élégance et raffinement au quotidien.",
    to: "/femme",
    image: femmeImg,
  },
  {
    eyebrow: "Pour Lui",
    title: "Collection Homme",
    subtitle: "L'art du style, du soin et de la prestance.",
    to: "/homme",
    image: hommeImg,
  },
];

export function CollectionBanners() {
  return (
    <section className="bg-background py-10 md:py-14">
      <div className="container-luxe space-y-5 md:space-y-6">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {CARDS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <Link
                to={b.to}
                className="group relative block h-[340px] md:h-[440px] overflow-hidden rounded-sm"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                  <span className="inline-block w-fit px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-gold text-ink rounded-sm mb-4">
                    {b.eyebrow}
                  </span>
                  <h3 className="font-display text-2xl md:text-4xl font-light text-cream leading-tight mb-2">
                    {b.title}
                  </h3>
                  <p className="text-cream/85 text-sm md:text-base mb-5 max-w-sm">
                    {b.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                    Voir la collection
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <Link
            to="/enfant"
            className="group relative block h-[280px] md:h-[380px] overflow-hidden rounded-sm"
          >
            <img
              src={enfantImg}
              alt="Collection Enfant"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
            <div className="container-luxe relative h-full flex items-center">
              <div className="max-w-lg">
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-bold bg-gold text-ink rounded-sm mb-4">
                  Univers Enfant
                </span>
                <h3 className="font-display text-3xl md:text-5xl font-light text-cream leading-[1.05] mb-3">
                  Enfant
                </h3>
                <p className="text-cream/85 text-sm md:text-lg mb-6 max-w-md font-light">
                  Douceur, tendresse et qualité pour les plus petits.
                </p>
                <span className="inline-flex items-center gap-3 bg-gold text-ink px-7 py-3.5 text-[11px] uppercase tracking-[0.25em] font-semibold rounded-sm group-hover:bg-cream transition">
                  Voir la collection
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
