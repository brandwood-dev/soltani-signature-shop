import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { label: "Homme", slug: "montres" },
  { label: "Femme", slug: "sacs" },
  { label: "Enfant", slug: "bijoux" },
  { label: "Maison", slug: "parfums" },
  { label: "Bien-être", slug: "cosmetiques" },
];

export function CategoryNav() {
  return (
    <div className="bg-background border-b border-border/60">
      {/* Desktop */}
      <nav className="hidden lg:block">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-12 h-[46px]">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: cat.slug }}
                  className="text-[13px] tracking-[0.15em] text-foreground/70 hover:text-foreground transition-colors relative group py-3.5 font-medium"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {cat.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile — scroll horizontal */}
      <nav className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="container-luxe">
          <ul className="flex items-center gap-8 h-12 px-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className="shrink-0">
                <Link
                  to="/category/$slug"
                  params={{ slug: cat.slug }}
                  className="text-[12px] tracking-[0.12em] text-foreground/70 hover:text-foreground transition-colors relative group py-3 font-medium whitespace-nowrap"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {cat.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
