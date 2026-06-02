import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { BESTSELLERS, NEWARRIVALS } from "@/components/site/ProductGrid";
import { Heart, Share2, Shield, Truck, RotateCcw, Star, Minus, Plus, ChevronRight, Check } from "lucide-react";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Soltani Signature` },
      { name: "description", content: "Pièce d'exception, livraison rapide, paiement en 3x sans frais." },
    ],
  }),
  component: ProductPage,
});

const GALLERY = [p1, p2, p3, p4];
const BUNDLE = [...BESTSELLERS.slice(0, 2)];
const RELATED = [...NEWARRIVALS];

function ProductPage() {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [bundle, setBundle] = useState<Record<string, boolean>>({ main: true, b0: true, b1: false });

  const bundleTotal = (bundle.main ? 2890 : 0) + (bundle.b0 ? BUNDLE[0].price : 0) + (bundle.b1 ? BUNDLE[1].price : 0);

  return (
    <SiteLayout>
      <div className="container-luxe pt-8 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: "montres" }} className="hover:text-gold">Montres</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Chronographe Acier Noir</span>
      </div>

      <section className="container-luxe py-8 grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {GALLERY.map((g, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden rounded-sm border-2 transition ${active === i ? "border-gold" : "border-border hover:border-gold/50"}`}>
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative group aspect-square overflow-hidden rounded-sm bg-card">
            <img src={GALLERY[active]} alt="Produit" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-150 cursor-zoom-in" />
            <span className="absolute top-4 left-4 px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">−15%</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">Tissot</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Chronographe Acier Noir Signature</h1>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
            <span className="text-xs text-muted-foreground">128 avis · Réf. SS-2890</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold tabular-nums">2 890 DT</span>
            <span className="text-lg text-muted-foreground line-through tabular-nums">3 400 DT</span>
            <span className="text-sm text-destructive font-semibold">Vous économisez 510 DT</span>
          </div>
          <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
            Une pièce d'horlogerie suisse alliant précision mécanique et raffinement contemporain.
            Boîtier en acier inoxydable 316L, mouvement automatique 25 rubis.
          </p>

          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60 mb-2">Couleur : <span className="text-gold">Noir Mat</span></p>
            <div className="flex gap-2">
              {["#0a0a0a", "#c9a84c", "#7d6242", "#b8b8b8"].map((c, i) => (
                <button key={i} className="h-9 w-9 rounded-full border-2 border-border hover:border-gold transition" style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60 mb-2">Taille</p>
            <div className="flex gap-2">
              {["38mm", "42mm", "45mm"].map((s) => (
                <button key={s} className="h-10 px-4 border border-border text-sm hover:border-gold hover:text-gold transition rounded-sm">{s}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex items-center border border-border rounded-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12 grid place-items-center hover:text-gold"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="h-12 w-12 grid place-items-center hover:text-gold"><Plus className="h-4 w-4" /></button>
            </div>
            <Link to="/cart" className="flex-1 inline-flex items-center justify-center h-12 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">
              Ajouter au panier
            </Link>
            <button className="h-12 w-12 grid place-items-center border border-border hover:border-gold hover:text-gold rounded-sm"><Heart className="h-5 w-5" /></button>
            <button className="h-12 w-12 grid place-items-center border border-border hover:border-gold hover:text-gold rounded-sm"><Share2 className="h-5 w-5" /></button>
          </div>
          <Link to="/checkout" className="block w-full text-center h-12 leading-[3rem] bg-ink text-cream dark:bg-cream dark:text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:opacity-90 rounded-sm">
            Acheter maintenant — Paiement 3×
          </Link>

          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
            {[{ I: Truck, t: "Livraison gratuite", s: "Dès 300 DT" }, { I: RotateCcw, t: "Retours 14j", s: "Sans frais" }, { I: Shield, t: "Authentique", s: "100% garanti" }].map(({ I, t, s }) => (
              <div key={t} className="text-center">
                <I className="h-5 w-5 mx-auto text-gold mb-2" />
                <p className="text-xs font-semibold">{t}</p>
                <p className="text-[10px] text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle */}
      <section className="container-luxe py-12 border-t border-border">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Fréquemment achetés ensemble</h2>
        <p className="text-sm text-muted-foreground mb-8">Composez votre look signature.</p>
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="flex items-center gap-4 flex-wrap">
            {[{ key: "main", img: p1, name: "Chronographe Noir", price: 2890 },
              { key: "b0", img: BUNDLE[0].image, name: BUNDLE[0].name, price: BUNDLE[0].price },
              { key: "b1", img: BUNDLE[1].image, name: BUNDLE[1].name, price: BUNDLE[1].price }].map((b, i) => (
              <div key={b.key} className="flex items-center gap-4">
                <label className="relative cursor-pointer">
                  <input type="checkbox" checked={bundle[b.key]} onChange={() => setBundle({ ...bundle, [b.key]: !bundle[b.key] })} className="sr-only peer" />
                  <div className="aspect-square w-28 overflow-hidden rounded-sm border-2 border-border peer-checked:border-gold transition">
                    <img src={b.img} alt="" className="h-full w-full object-cover" />
                  </div>
                  {bundle[b.key] && <span className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-gold text-ink"><Check className="h-3.5 w-3.5" /></span>}
                  <p className="mt-2 text-xs font-medium max-w-[112px] truncate">{b.name}</p>
                  <p className="text-xs text-gold">{b.price} DT</p>
                </label>
                {i < 2 && <Plus className="h-5 w-5 text-muted-foreground hidden md:block" />}
              </div>
            ))}
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total pack</p>
            <p className="font-display text-3xl font-bold text-gold mb-3">{bundleTotal} DT</p>
            <button className="px-6 h-12 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">Ajouter le pack</button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-luxe py-12 border-t border-border">
        <div className="flex gap-8 border-b border-border mb-8">
          {[{ k: "desc", l: "Description" }, { k: "specs", l: "Spécifications" }, { k: "reviews", l: "Avis (128)" }].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k as typeof tab)}
              className={`pb-4 text-sm uppercase tracking-widest transition relative ${tab === k ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              {l}
              {tab === k && <span className="absolute bottom-0 inset-x-0 h-px bg-gold" />}
            </button>
          ))}
        </div>
        {tab === "desc" && (
          <div className="prose-luxe max-w-3xl text-foreground/80 leading-relaxed space-y-4">
            <p>Le Chronographe Acier Noir Signature incarne la quintessence de l'horlogerie contemporaine. Conçue dans les ateliers suisses, chaque pièce subit plus de 200 contrôles qualité.</p>
            <p>Le boîtier en acier 316L brossé satiné s'allie à un cadran noir mat sublimé par des index dorés appliqués à la main. Le mouvement automatique offre une réserve de marche de 80 heures.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verre saphir bombé anti-reflet</li><li>Étanchéité 100m</li><li>Bracelet cuir italien</li><li>Garantie internationale 5 ans</li>
            </ul>
          </div>
        )}
        {tab === "specs" && (
          <div className="max-w-3xl">
            <dl className="divide-y divide-border">
              {[["Marque", "Tissot"], ["Mouvement", "Automatique 25 rubis"], ["Boîtier", "Acier 316L · 42mm"], ["Verre", "Saphir anti-reflet"], ["Étanchéité", "100 mètres"], ["Bracelet", "Cuir italien noir"], ["Garantie", "5 ans internationale"]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
        {tab === "reviews" && (
          <div className="max-w-3xl space-y-6">
            {[{ n: "Karim B.", r: 5, t: "Magnifique pièce, finitions irréprochables. Livraison rapide." },
              { n: "Salma T.", r: 5, t: "Achat de confiance. Le SAV est exceptionnel." },
              { n: "Mehdi K.", r: 4, t: "Très belle montre, conforme à la description." }].map((rv, i) => (
              <div key={i} className="pb-6 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{rv.n}</span>
                  <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-3.5 w-3.5 ${j < rv.r ? "fill-gold text-gold" : "text-muted-foreground"}`} />)}</div>
                </div>
                <p className="text-sm text-foreground/80">{rv.t}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related */}
      <section className="container-luxe py-16 border-t border-border">
        <h2 className="font-display text-3xl font-bold mb-8">Vous pourriez aimer</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {RELATED.map((p) => <ProductCard key={p.name} p={p} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
