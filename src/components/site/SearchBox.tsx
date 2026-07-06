import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { searchProducts, findCategoryName } from "@/data/catalog";

export function SearchBox({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchProducts(q, 6), [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    if (results[0]) {
      navigate({ to: "/product/$slug", params: { slug: results[0].slug } });
    }
    setOpen(false);
    onNavigate?.();
  };

  const go = (slug: string) => {
    navigate({ to: "/product/$slug", params: { slug } });
    setOpen(false);
    setQ("");
    onNavigate?.();
  };

  const catLabel = (slug: string) => findCategoryName(slug);

  return (
    <div ref={wrap} className="relative w-full">
      <form onSubmit={submit}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={compact ? "Rechercher…" : "Rechercher une marque, un produit…"}
          aria-label="Rechercher un produit ou une marque"
          className={`w-full ${compact ? "h-10 pl-10" : "h-11 pl-11"} pr-9 bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 transition rounded-sm`}
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-gold" aria-label="Effacer">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-background border border-border rounded-sm shadow-luxe overflow-hidden">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun résultat pour <span className="text-foreground font-medium">"{q}"</span>
            </div>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border">
              {results.map((p) => {
                const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
                return (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => go(p.slug)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition text-left"
                    >
                      <img src={p.image} alt={p.name} className="h-14 w-14 object-cover rounded-sm shrink-0 bg-card" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold truncate">{p.brand} · {catLabel(p.category)}</p>
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground tabular-nums">{p.price} DT</span>
                          {p.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through tabular-nums">{p.oldPrice} DT</span>
                          )}
                        </div>
                      </div>
                      {discount > 0 && (
                        <span className="px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm shrink-0">
                          −{discount}%
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/promotions"
                  onClick={() => { setOpen(false); onNavigate?.(); }}
                  className="block p-3 text-center text-[11px] uppercase tracking-[0.25em] text-gold hover:bg-secondary/60 transition"
                >
                  Voir toutes les promotions →
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
