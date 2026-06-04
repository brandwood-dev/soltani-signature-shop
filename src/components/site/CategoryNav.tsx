import { Link } from "@tanstack/react-router";
import { PARENT_CATEGORIES } from "@/data/catalog";

const ITEMS = [
  ...PARENT_CATEGORIES.map((p) => ({ label: p.name, slug: p.slug, to: "/category/$slug" as const })),
];

export function CategoryNav() {
  return (
    <div className="bg-background border-b border-border/60">
      {/* Desktop */}
      <nav className="hidden lg:block">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-10 h-[46px]">
            {ITEMS.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={cat.to}
                  params={{ slug: cat.slug }}
                  className="text-[13px] tracking-[0.15em] text-foreground/70 hover:text-foreground transition-colors relative group py-3.5 font-medium"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {cat.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/promotions"
                className="text-[13px] tracking-[0.15em] text-destructive hover:text-foreground transition-colors relative group py-3.5 font-semibold"
              >
                Bon Plan
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-destructive group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile — scroll horizontal */}
      <nav className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="container-luxe">
          <ul className="flex items-center gap-7 h-12 px-2 min-w-max">
            {ITEMS.map((cat) => (
              <li key={cat.slug} className="shrink-0">
                <Link
                  to={cat.to}
                  params={{ slug: cat.slug }}
                  className="text-[12px] tracking-[0.12em] text-foreground/70 hover:text-foreground transition-colors py-3 font-medium whitespace-nowrap"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
            <li className="shrink-0">
              <Link
                to="/promotions"
                className="text-[12px] tracking-[0.12em] text-destructive py-3 font-semibold whitespace-nowrap"
              >
                Bon Plan
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
