import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { lines, update, remove, subtotal, count } = useCart();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("cart:open", onOpen);
    return () => window.removeEventListener("cart:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className={`fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Panier"
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg font-bold">Mon panier</h2>
            <span className="text-xs text-muted-foreground">({count})</span>
          </div>
          <button onClick={close} aria-label="Fermer" className="p-2 hover:text-gold transition">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Votre panier est vide.</p>
              <button onClick={close} className="text-gold underline text-sm">Continuer mes achats</button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.id} className="py-4 grid grid-cols-[72px_1fr_auto] gap-3">
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-gold">{l.brand}</p>
                    <p className="text-sm font-medium truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{l.variant}</p>
                    <div className="flex items-center border border-border w-fit rounded-sm">
                      <button onClick={() => update(l.id, l.qty - 1)} className="h-7 w-7 grid place-items-center hover:text-gold">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs tabular-nums">{l.qty}</span>
                      <button onClick={() => update(l.id, l.qty + 1)} className="h-7 w-7 grid place-items-center hover:text-gold">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => remove(l.id)} aria-label="Supprimer" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-semibold tabular-nums">{l.price * l.qty} DT</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-border p-5 space-y-3 shrink-0 bg-secondary/30">
            <div className="flex items-end justify-between">
              <span className="text-sm uppercase tracking-widest text-muted-foreground">Sous-total</span>
              <span className="font-display text-2xl font-bold text-gold tabular-nums">{subtotal} DT</span>
            </div>
            <Link
              to="/checkout"
              search={{ quick: undefined }}
              onClick={close}
              className="block w-full text-center h-12 leading-[3rem] bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm"
            >
              Finaliser la commande
            </Link>
            <Link
              to="/cart"
              onClick={close}
              className="block w-full text-center h-11 leading-[2.75rem] border border-border text-[12px] uppercase tracking-[0.2em] font-semibold hover:border-gold hover:text-gold transition rounded-sm"
            >
              Voir mon panier
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
