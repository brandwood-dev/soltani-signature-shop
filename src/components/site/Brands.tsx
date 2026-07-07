import { useEffect, useState } from "react";
import type { FeaturedBrand } from "@/lib/featured-brands-api";
import { getActiveFeaturedBrands } from "@/lib/featured-brands-api";

const FALLBACK_LOGOS: FeaturedBrand[] = [
  {
    id: "fallback-brand-1",
    name: "Chanel",
    logo: "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602563/Plan_de_travail_1_aqe9pv.png",
    link: "/brand/chanel",
    active: true,
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-brand-2",
    name: "Dior",
    logo: "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_7_sz66o9.png",
    link: "/brand/dior",
    active: true,
    sortOrder: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-brand-3",
    name: "Guerlain",
    logo: "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_8_hxdulh.png",
    link: "/brand/guerlain",
    active: true,
    sortOrder: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-brand-4",
    name: "Lancôme",
    logo: "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602375/Plan_de_travail_6_mwrk7f.png",
    link: "/brand/lancome",
    active: true,
    sortOrder: 3,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-brand-5",
    name: "YSL",
    logo: "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_2_kz7djo.png",
    link: "/brand/ysl",
    active: true,
    sortOrder: 4,
    createdAt: "",
    updatedAt: "",
  },
];

export function Brands() {
  const [brands, setBrands] = useState<FeaturedBrand[]>([]);

  useEffect(() => {
    getActiveFeaturedBrands()
      .then((apiBrands) => setBrands(apiBrands.length > 0 ? apiBrands : FALLBACK_LOGOS))
      .catch(() => setBrands(FALLBACK_LOGOS));
  }, []);

  if (brands.length === 0) {
    return null;
  }

  const carouselBrands = brands.length >= 5 ? brands : FALLBACK_LOGOS;

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
          {[...carouselBrands, ...carouselBrands].map((brand, index) => {
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
