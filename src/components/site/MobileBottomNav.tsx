import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Tag, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type NavItem = { to: string; label: string; Icon: typeof Tag; badge?: boolean };
const ITEMS: NavItem[] = [
  { to: "/promotions", label: "Promos", Icon: Tag },
  { to: "/wishlist", label: "Favoris", Icon: Heart },
  { to: "/cart", label: "Panier", Icon: ShoppingBag, badge: true },
  { to: "/profile", label: "Profil", Icon: User },
];

export function MobileBottomNav() {
  const [visible, setVisible] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      // show after scrolling past 200px, hide when back near top
      if (y > 200 && y > last - 4) setVisible(true);
      else if (y < 120) setVisible(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Expose state to floating buttons via a CSS variable on <html>
  useEffect(() => {
    document.documentElement.style.setProperty("--mobile-nav-offset", visible ? "72px" : "0px");
    return () => {
      document.documentElement.style.setProperty("--mobile-nav-offset", "0px");
    };
  }, [visible]);

  return (
    <nav
      aria-label="Navigation mobile"
      className={`fixed inset-x-0 bottom-0 z-[55] lg:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-2 mb-2 rounded-2xl border border-border/60 bg-background/95 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
        <ul className="grid grid-cols-4">
          {ITEMS.map(({ to, label, Icon, badge }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to as never}
                  className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                    active ? "text-gold" : "text-foreground/70"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    {badge && count > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-gold text-ink text-[9px] font-bold">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className="uppercase">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
