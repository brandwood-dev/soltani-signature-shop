const LOGOS = [
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602563/Plan_de_travail_1_aqe9pv.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_7_sz66o9.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_8_hxdulh.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602375/Plan_de_travail_6_mwrk7f.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_2_kz7djo.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602375/Plan_de_travail_4_tsvvvl.png",
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1780602374/Plan_de_travail_5_ctc7gk.png",
];

export function Brands() {
  return (
    <section className="py-16 border-y border-border bg-secondary/40 overflow-hidden">
      <div className="container-luxe mb-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Marques Partenaires</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-foreground">Les maisons d'exception</h2>
      </div>
      <div className="relative">
        <div className="flex marquee items-center gap-16 w-max">
          {[...LOGOS, ...LOGOS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Marque partenaire"
              className="h-12 md:h-16 w-auto object-contain opacity-70 hover:opacity-100 transition duration-300 cursor-pointer"
              loading="lazy"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
