import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { findProduct, productsByCategory, PRODUCTS, CATEGORIES } from "@/data/catalog";
import { CountdownInline, useStableDeadline } from "@/components/site/Countdown";
import { Heart, Share2, Shield, Truck, RotateCcw, Star, Minus, Plus, ChevronRight, Check, Flame } from "lucide-react";


export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }): { product: Product; related: Product[]; bundle: Product[] } => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    const related = productsByCategory(product.category).filter((p: Product) => p.slug !== product.slug).slice(0, 4);
    const bundle = PRODUCTS.filter((p: Product) => p.slug !== product.slug).slice(0, 2);
    return { product, related, bundle };
  },
  head: ({ params }) => {
    const p = findProduct(params.slug);
    return {
      meta: [
        { title: p ? `${p.name} — Soltani Signature` : "Produit — Soltani Signature" },
        { name: "description", content: p ? `${p.brand} · ${p.name}. Livraison rapide, paiement en 3x sans frais.` : "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Produit introuvable</h1>
        <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related, bundle } = Route.useLoaderData() as { product: Product; related: Product[]; bundle: Product[] };
  const gallery = [product.image, ...related.slice(0, 3).map((r: Product) => r.image)];
  const category = CATEGORIES.find((c) => c.slug === product.category)!;
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [pick, setPick] = useState<Record<string, boolean>>({ main: true, b0: true, b1: false });

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const bundleTotal = (pick.main ? product.price : 0) + (pick.b0 ? bundle[0].price : 0) + (pick.b1 ? bundle[1].price : 0);

  return (
    <SiteLayout>
      <div className="container-luxe pt-8 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-gold">{category.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <section className="container-luxe py-8 grid lg:grid-cols-2 gap-12">
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {gallery.map((g, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden rounded-sm border-2 transition ${active === i ? "border-gold" : "border-border hover:border-gold/50"}`}>
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative group aspect-square overflow-hidden rounded-sm bg-card">
            <img src={gallery[active]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-150 cursor-zoom-in" />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-2 py-1 text-[10px] uppercase tracking-widest font-bold bg-destructive text-cream rounded-sm">−{discount}%</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">{product.brand}</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating ?? 5) ? "fill-gold text-gold" : "text-muted-foreground"}`} />)}</div>
            <span className="text-xs text-muted-foreground">128 avis · Réf. {product.slug.toUpperCase().slice(0, 10)}</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold tabular-nums">{product.price} DT</span>
            {product.oldPrice && <span className="text-lg text-muted-foreground line-through tabular-nums">{product.oldPrice} DT</span>}
            {product.oldPrice && <span className="text-sm text-destructive font-semibold">Économisez {product.oldPrice - product.price} DT</span>}
          </div>
          {discount > 0 && (
            <PromoCountdown />
          )}

          <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
            Une pièce d'exception sélectionnée par nos experts. {product.brand} incarne le raffinement et la précision dans les moindres détails.
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
              {["S", "M", "L"].map((s) => (
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

      <section className="container-luxe py-12 border-t border-border">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Fréquemment achetés ensemble</h2>
        <p className="text-sm text-muted-foreground mb-8">Composez votre look signature.</p>
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="flex items-center gap-4 flex-wrap">
            {[{ key: "main", img: product.image, name: product.name, price: product.price },
              { key: "b0", img: bundle[0].image, name: bundle[0].name, price: bundle[0].price },
              { key: "b1", img: bundle[1].image, name: bundle[1].name, price: bundle[1].price }].map((b, i) => (
              <div key={b.key} className="flex items-center gap-4">
                <label className="relative cursor-pointer">
                  <input type="checkbox" checked={pick[b.key]} onChange={() => setPick({ ...pick, [b.key]: !pick[b.key] })} className="sr-only peer" />
                  <div className="aspect-square w-28 overflow-hidden rounded-sm border-2 border-border peer-checked:border-gold transition">
                    <img src={b.img} alt="" className="h-full w-full object-cover" />
                  </div>
                  {pick[b.key] && <span className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-gold text-ink"><Check className="h-3.5 w-3.5" /></span>}
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
          <div className="max-w-3xl text-foreground/80 leading-relaxed space-y-4">
            <p>{product.name} incarne la quintessence du savoir-faire {product.brand}. Chaque pièce est sélectionnée pour son authenticité, sa qualité et son raffinement.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Matériaux nobles et finitions haut de gamme</li><li>Authenticité 100% garantie</li><li>Emballage cadeau signature</li><li>Garantie internationale</li>
            </ul>
          </div>
        )}
        {tab === "specs" && (
          <div className="max-w-3xl">
            <dl className="divide-y divide-border">
              {[["Marque", product.brand], ["Catégorie", category.name], ["Référence", product.slug.toUpperCase()], ["Garantie", "2 ans internationale"]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
        {tab === "reviews" && (
          <div className="max-w-3xl space-y-6">
            {[{ n: "Karim B.", r: 5, t: "Magnifique pièce, finitions irréprochables. Livraison rapide." },
              { n: "Salma T.", r: 5, t: "Achat de confiance. Le SAV est exceptionnel." },
              { n: "Mehdi K.", r: 4, t: "Très belle pièce, conforme à la description." }].map((rv, i) => (
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

      {related.length > 0 && (
        <section className="container-luxe py-16 border-t border-border">
          <h2 className="font-display text-3xl font-bold mb-8">Vous pourriez aimer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
