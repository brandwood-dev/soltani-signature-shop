import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import type { CategorySlug } from "@/data/catalog";

function CountBadge({ count, tone = "gold" }: { count: number; tone?: "gold" | "destructive" }) {
  if (!count) return null;
  const cls = tone === "gold" ? "bg-gold text-ink" : "bg-destructive text-cream";
  return (
    <span
      key={count}
      className={`absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center rounded-full text-[10px] font-bold tabular-nums ${cls} animate-in zoom-in-50 duration-200`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

type MegaItem = { label: string; slug: CategorySlug };
type MegaGroup = {
  label: string;
  slug: CategorySlug; // landing category when clicking the title
  items: MegaItem[];
};

const MEGA_MENU: MegaGroup[] = [
  {
    label: "Parfums & Fragrances",
    slug: "parfums",
    items: [
      { label: "Parfums", slug: "parfums" },
      { label: "Brumes parfumées", slug: "parfums" },
      { label: "Coffrets parfum", slug: "parfums" },
    ],
  },
  {
    label: "Maquillage",
    slug: "cosmetiques",
    items: [
      { label: "Teint", slug: "cosmetiques" },
      { label: "Yeux", slug: "cosmetiques" },
      { label: "Lèvres", slug: "cosmetiques" },
      { label: "Accessoires maquillage", slug: "cosmetiques" },
    ],
  },
  {
    label: "Soins du Visage",
    slug: "cosmetiques",
    items: [
      { label: "Nettoyants", slug: "cosmetiques" },
      { label: "Sérums", slug: "cosmetiques" },
      { label: "Crèmes hydratantes", slug: "cosmetiques" },
      { label: "Masques", slug: "cosmetiques" },
      { label: "Contour des yeux", slug: "cosmetiques" },
    ],
  },
  {
    label: "Cheveux",
    slug: "cosmetiques",
    items: [
      { label: "Shampoings", slug: "cosmetiques" },
      { label: "Après-shampoings", slug: "cosmetiques" },
      { label: "Masques capillaires", slug: "cosmetiques" },
      { label: "Huiles et sérums", slug: "cosmetiques" },
      { label: "Coiffage", slug: "cosmetiques" },
    ],
  },
  {
    label: "Protection Solaire",
    slug: "cosmetiques",
    items: [
      { label: "Crèmes solaires visage", slug: "cosmetiques" },
      { label: "Crèmes solaires corps", slug: "cosmetiques" },
      { label: "Après-soleil", slug: "cosmetiques" },
    ],
  },
  {
    label: "Mode & Style",
    slug: "sacs",
    items: [
      { label: "Sacs à main", slug: "sacs" },
      { label: "Montres", slug: "montres" },
      { label: "Lunettes", slug: "lunettes" },
      { label: "Bijoux", slug: "bijoux" },
    ],
  },
];

function MegaTrigger({ group }: { group: MegaGroup }) {
  return (
    <li className="relative group/mega">
      <Link
        to="/category/$slug"
        params={{ slug: group.slug }}
        className="inline-flex items-center gap-1 py-3 text-foreground/80 hover:text-gold transition-colors"
      >
        {group.label}
        <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-300 group-hover/mega:rotate-180" />
        <span className="absolute left-3 right-3 bottom-0 h-px bg-gold scale-x-0 group-hover/mega:scale-x-100 origin-left transition-transform duration-300" />
      </Link>

      {/* Dropdown */}
      <div
        className="invisible opacity-0 translate-y-1 group-hover/mega:visible group-hover/mega:opacity-100 group-hover/mega:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
      >
        <div className="min-w-[240px] bg-background border border-border shadow-luxe rounded-sm py-3">
          <ul className="flex flex-col">
            {group.items.map((it) => (
              <li key={it.label}>
                <Link
                  to="/category/$slug"
                  params={{ slug: it.slug }}
                  className="block px-5 py-2 text-[12px] tracking-[0.1em] text-foreground/80 hover:text-gold hover:bg-secondary/40 transition-colors"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function MobileGroup({ group, onNavigate }: { group: MegaGroup; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-sm tracking-widest text-foreground/90"
      >
        <span>{group.label}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <ul className="pb-3 pl-3 flex flex-col gap-1">
          <li>
            <Link
              to="/category/$slug"
              params={{ slug: group.slug }}
              onClick={onNavigate}
              className="block py-2 text-[12px] tracking-[0.15em] text-gold"
            >
              Tout voir
            </Link>
          </li>
          {group.items.map((it) => (
            <li key={it.label}>
              <Link
                to="/category/$slug"
                params={{ slug: it.slug }}
                onClick={onNavigate}
                className="block py-2 text-[13px] text-foreground/75 hover:text-gold"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();

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
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-1 text-foreground">
          <Link to="/profile" className="p-2.5 hover:text-gold transition" aria-label="Compte"><User className="h-5 w-5" /></Link>
          <Link to="/wishlist" className="relative p-2.5 hover:text-gold transition" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            <CountBadge count={wishlistCount} tone="destructive" />
          </Link>
          <Link to="/cart" className="relative p-2.5 hover:text-gold transition" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            <CountBadge count={cartCount} tone="gold" />
          </Link>
          <Link
            to="/promotions"
            className="hidden lg:inline-flex ml-2 px-4 py-2 text-[11px] tracking-[0.15em] font-medium bg-destructive text-cream rounded-sm hover:opacity-90"
          >
            -30%
          </Link>
        </div>
      </div>

      {/* Desktop mega menu */}
      <nav className="hidden lg:block border-t border-border bg-secondary/40">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-10 h-12 text-[12px] tracking-[0.15em]">
            {MEGA_MENU.map((g) => (
              <MegaTrigger key={g.label} group={g} />
            ))}
            <li>
              <Link
                to="/promotions"
                className="py-3 text-destructive hover:text-foreground transition font-medium"
              >
                Bon Plan
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <nav className="lg:hidden border-t border-border bg-background max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="container-luxe py-4">
            <div className="mb-4">
              <SearchBox compact onNavigate={() => setOpen(false)} />
            </div>

            <ul className="flex flex-col">
              {MEGA_MENU.map((g) => (
                <MobileGroup key={g.label} group={g} onNavigate={() => setOpen(false)} />
              ))}
              <li>
                <Link
                  to="/promotions"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm tracking-widest text-destructive border-b border-border"
                >
                  Bon Plan
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
