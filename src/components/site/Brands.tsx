import { useEffect, useState } from "react";
import type { FeaturedBrand } from "@/lib/featured-brands-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";


export function Brands() {
  const [brands, setBrands] = useState<FeaturedBrand[]>([]);

  useEffect(() => {
    getActiveFeaturedBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden border-y border-border bg-secondary/40 py-16">
      <div className="container-luxe mb-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold">
          Les signatures de beauté & lifestyle
        </span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
          NOS MARQUES À LA UNE
        </h2>
      </div>
      <div className="relative">
        <div className="marquee flex w-max items-center gap-16">
          {[...brands, ...brands].map((brand, index) => {
            const logo = (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto object-contain opacity-70 transition duration-300 hover:opacity-100 md:h-16"
                loading="lazy"
              />
            );

            return brand.link ? (
              <a key={`${brand.id}-${index}`} href={brand.link} aria-label={brand.name}>
                {logo}
              </a>
            ) : (
              <div key={`${brand.id}-${index}`}>{logo}</div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}


