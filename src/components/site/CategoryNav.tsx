const ITEMS = [
  { label: "Homme", href: "#homme" },
  { label: "Femme", href: "#femme" },
  { label: "Enfant", href: "#enfant" },
  { label: "Maison", href: "#maison" },
  { label: "Bien-être", href: "#bien-etre" },
];

export function CategoryNav() {
  return (
    <div className="bg-background border-b border-border/60">
      {/* Desktop */}
      <nav className="hidden lg:block">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-10 h-[46px]">
            {ITEMS.map((cat) => (
              <li key={cat.label}>
                <a
                  href={cat.href}
                  className="text-[13px] tracking-[0.15em] text-foreground/70 hover:text-foreground transition-colors relative group py-3.5 font-medium"
                >
                  {cat.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-300 ease-out" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile — scroll horizontal */}
      <nav className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="container-luxe">
          <ul className="flex items-center justify-center gap-6 h-12 px-2 min-w-max">
            {ITEMS.map((cat) => (
              <li key={cat.label} className="shrink-0">
                <a
                  href={cat.href}
                  className="text-[12px] tracking-[0.12em] text-foreground/70 hover:text-foreground transition-colors py-3 font-medium whitespace-nowrap"
                >
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
