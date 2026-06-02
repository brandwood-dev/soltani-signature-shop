import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/data/catalog";

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
      } border-b border-border`}
    >
      <div className="container-luxe flex h-20 items-center gap-6">
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link to="/" className="mx-auto lg:mx-0">
          <Logo height={42} />
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input
              type="search"
              placeholder="Rechercher une marque, un produit…"
              className="w-full h-11 pl-11 pr-4 bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 transition rounded-sm"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 text-foreground">
          <ThemeToggle />
          <button className="p-2.5 hover:text-gold transition" aria-label="Compte"><User className="h-5 w-5" /></button>
          <button className="p-2.5 hover:text-gold transition" aria-label="Wishlist"><Heart className="h-5 w-5" /></button>
          <Link to="/cart" className="relative p-2.5 hover:text-gold transition" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 grid place-items-center rounded-full bg-gold text-[10px] font-bold text-ink">3</span>
          </Link>
          <a
            href="#promos"
            className="hidden lg:inline-flex ml-2 px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold bg-destructive text-cream rounded-sm hover:opacity-90"
          >
            -30%
          </a>
        </div>
      </div>

      <nav className="hidden lg:block border-t border-border bg-secondary/40">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-8 h-11 text-[12px] uppercase tracking-[0.22em]">
            {NAV_LINKS.map((n) => (
              <li key={n.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: n.slug }}
                  className="text-foreground/80 hover:text-gold transition-colors relative group py-3"
                  activeProps={{ className: "text-gold" }}
                >
                  {n.label}
                  <span className="absolute -bottom-0 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
            <li>
              <a href="#promos" className="text-destructive hover:text-foreground transition font-semibold">Promotions</a>
            </li>
          </ul>
        </div>
      </nav>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="container-luxe py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
              <input
                type="search"
                placeholder="Rechercher…"
                className="w-full h-10 pl-10 pr-3 bg-secondary border border-border text-sm text-foreground rounded-sm"
              />
            </div>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((n) => (
                <li key={n.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: n.slug }}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 text-sm uppercase tracking-widest text-foreground/90 border-b border-border"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="#promos" onClick={() => setOpen(false)} className="block py-2.5 text-sm uppercase tracking-widest text-destructive border-b border-border">Promotions</a>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
