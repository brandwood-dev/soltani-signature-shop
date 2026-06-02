import { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const NAV = [
  "Homme", "Femme", "Montres", "Lunettes", "Parfums",
  "Sacs & Accessoires", "Maquillage", "Soin",
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/95 backdrop-blur-xl shadow-luxe" : "bg-background/70 backdrop-blur-md"
      } border-b border-gold/10`}
    >
      <div className="container-luxe flex h-20 items-center gap-6">
        <button onClick={() => setOpen(!open)} className="lg:hidden text-cream" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link to="/" className="flex items-baseline gap-1 shrink-0">
          <span className="font-display text-2xl font-bold tracking-tight text-cream">
            SOLTANI
          </span>
          <span className="font-display text-2xl font-light italic text-gold">
            Signature
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input
              type="search"
              placeholder="Rechercher une marque, un produit…"
              className="w-full h-11 pl-11 pr-4 bg-secondary/60 border border-gold/15 text-sm text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 transition rounded-sm"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 text-cream">
          <button className="p-2.5 hover:text-gold transition" aria-label="Compte"><User className="h-5 w-5" /></button>
          <button className="p-2.5 hover:text-gold transition" aria-label="Wishlist"><Heart className="h-5 w-5" /></button>
          <button className="relative p-2.5 hover:text-gold transition" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 grid place-items-center rounded-full bg-gold text-[10px] font-bold text-ink">3</span>
          </button>
          <a
            href="#promos"
            className="hidden lg:inline-flex ml-2 px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold bg-destructive text-cream rounded-sm hover:opacity-90"
          >
            -30%
          </a>
        </div>
      </div>

      {/* Mega menu (desktop) */}
      <nav className="hidden lg:block border-t border-gold/10 bg-ink/60">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-8 h-11 text-[12px] uppercase tracking-[0.22em]">
            {NAV.map((n) => (
              <li key={n}>
                <a href="#" className="text-cream/80 hover:text-gold transition-colors relative group py-3">
                  {n}
                  <span className="absolute -bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
            <li>
              <a href="#promos" className="text-destructive hover:text-cream transition font-semibold">Promotions</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden border-t border-gold/15 bg-ink">
          <div className="container-luxe py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
              <input
                type="search"
                placeholder="Rechercher…"
                className="w-full h-10 pl-10 pr-3 bg-secondary border border-gold/15 text-sm rounded-sm"
              />
            </div>
            <ul className="flex flex-col gap-1">
              {[...NAV, "Promotions"].map((n) => (
                <li key={n}>
                  <a href="#" className="block py-2.5 text-sm uppercase tracking-widest text-cream/90 border-b border-gold/10">{n}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
